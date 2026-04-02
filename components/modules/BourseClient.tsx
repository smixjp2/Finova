'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Chart, registerables } from 'chart.js'
import { PageHeader, ActionButton, FormPanel, StatCard } from '@/components/ui'
import { INVESTMENT_SECTORS, INVESTMENT_SECTOR_COLORS } from '@/lib/constants'
import { formatMAD, formatDecimal, getToday } from '@/lib/calculations'
import type { Investment } from '@/types'
Chart.register(...registerables)

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: 'var(--card)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none',
}

export default function BourseClient({ initialData, userId }: { initialData: Investment[]; userId: string }) {
  const [investments, setInvestments] = useState<Investment[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [form, setForm] = useState({ symbol: '', name: '', buy_price: '', quantity: '', current_price: '', date: getToday(), sector: INVESTMENT_SECTORS[0] })
  const supabase = createClient()

  const totalInvested  = investments.reduce((s, i) => s + i.buy_price * i.quantity, 0)
  const totalCurrent   = investments.reduce((s, i) => s + i.current_price * i.quantity, 0)
  const totalPL        = totalCurrent - totalInvested
  const totalPLpct     = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0

  const addInv = async () => {
    if (!form.buy_price || !form.quantity || +form.buy_price <= 0 || +form.quantity <= 0) return
    setLoading(true)
    const payload = {
      user_id: userId,
      symbol: form.symbol.toUpperCase(),
      name: form.name || null,
      sector: form.sector,
      buy_price: +form.buy_price,
      quantity: +form.quantity,
      current_price: form.current_price ? +form.current_price : +form.buy_price,
      date: form.date,
    }
    const { data, error } = await supabase.from('investments').insert(payload).select().single()
    if (!error && data) {
      setInvestments(prev => [data, ...prev])
      setForm({ symbol: '', name: '', buy_price: '', quantity: '', current_price: '', date: getToday(), sector: INVESTMENT_SECTORS[0] })
      setShowForm(false)
    }
    setLoading(false)
  }

  const updatePrice = async (id: string, price: number) => {
    if (!price || isNaN(price) || price <= 0) return
    await supabase.from('investments').update({ current_price: price }).eq('id', id)
    setInvestments(prev => prev.map(i => i.id === id ? { ...i, current_price: price } : i))
  }

  const deleteInv = async (id: string) => {
    await supabase.from('investments').delete().eq('id', id)
    setInvestments(prev => prev.filter(i => i.id !== id))
  }

  // Sector donut
  const donutRef  = useRef<HTMLCanvasElement>(null)
  const donutInst = useRef<Chart | null>(null)
  const sectorData = INVESTMENT_SECTORS.map(s => ({
    name: s,
    value: investments.filter(i => i.sector === s).reduce((sum, i) => sum + i.current_price * i.quantity, 0),
    fill: INVESTMENT_SECTOR_COLORS[s],
  })).filter(d => d.value > 0)

  useEffect(() => {
    if (!donutRef.current || !sectorData.length) return
    donutInst.current?.destroy()
    donutInst.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: { labels: sectorData.map(d => d.name), datasets: [{ data: sectorData.map(d => d.value), backgroundColor: sectorData.map(d => d.fill), borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } },
    })
    return () => donutInst.current?.destroy()
  }, [investments])

  return (
    <div>
      <PageHeader title="📈 Bourse & Investissements" subtitle="Suivi de votre portefeuille"
        action={<ActionButton color="#a78bfa" textColor="#fff" onClick={() => setShowForm(!showForm)}>{showForm ? 'Fermer' : '+ Position'}</ActionButton>} />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <StatCard label="Valeur portefeuille" value={formatMAD(totalCurrent)}    color="#a78bfa" icon="💼" />
        <StatCard label="Capital investi"     value={formatMAD(totalInvested)}   color="var(--muted)" icon="💵" />
        <StatCard label="Plus/Moins-value"    value={(totalPL >= 0 ? '+' : '') + formatMAD(totalPL)} color={totalPL >= 0 ? 'var(--acc)' : 'var(--danger)'} icon={totalPL >= 0 ? '📈' : '📉'} sub={(totalPLpct >= 0 ? '+' : '') + formatDecimal(totalPLpct, 2) + '%'} />
        <StatCard label="Positions"           value={investments.length}   color="#38bdf8" icon="🎯" />
      </div>

      {showForm && (
        <FormPanel>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Nouvelle position</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Symbole</label><input value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))} placeholder="AAPL" style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Nom (optionnel)</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Apple Inc." style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Secteur</label>
              <select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} style={inputStyle}>
                {INVESTMENT_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Prix d'achat (MAD)</label><input type="number" min="0" value={form.buy_price} onChange={e => setForm(f => ({ ...f, buy_price: e.target.value }))} placeholder="0.00" style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Quantité</label><input type="number" min="0" step="any" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="10" style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Cours actuel (MAD)</label><input type="number" min="0" value={form.current_price} onChange={e => setForm(f => ({ ...f, current_price: e.target.value }))} placeholder="Optionnel" style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Date d'achat</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addInv} disabled={loading} style={{ flex: 1, padding: '10px 0', background: loading ? 'var(--muted)' : '#a78bfa', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14 }}>{loading ? 'Enregistrement...' : 'Ajouter'}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 14 }}>Annuler</button>
          </div>
        </FormPanel>
      )}

      {investments.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
          {/* Donut secteur */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Répartition</div>
            <div style={{ position: 'relative', height: 150 }}><canvas ref={donutRef} /></div>
            <div style={{ marginTop: 8 }}>
              {sectorData.map(d => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: d.fill, display: 'inline-block' }} />{d.name}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>{Math.round(d.value / totalCurrent * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Positions list */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Positions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {investments.map(inv => {
                const pl     = (inv.current_price - inv.buy_price) * inv.quantity
                const plPct  = ((inv.current_price - inv.buy_price) / inv.buy_price) * 100
                const val    = inv.current_price * inv.quantity
                const color  = INVESTMENT_SECTOR_COLORS[inv.sector] ?? 'var(--muted)'
                return (
                  <div key={inv.id} style={{ background: 'var(--surf)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color, flexShrink: 0 }}>
                        {inv.symbol.slice(0, 4)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{inv.symbol}{inv.name ? ` — ${inv.name}` : ''}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{inv.quantity} × {formatDecimal(inv.buy_price, 2)} MAD · {inv.sector}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{formatMAD(val)}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: pl >= 0 ? 'var(--acc)' : 'var(--danger)' }}>
                          {pl >= 0 ? '+' : ''}{formatMAD(pl)} ({formatDecimal(plPct, 2)}%)
                        </div>
                      </div>
                      <button onClick={() => deleteInv(inv.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '2px 6px', cursor: 'pointer' }}
                        onMouseOver={e => (e.currentTarget.style.color = 'var(--danger)')} onMouseOut={e => (e.currentTarget.style.color = 'var(--muted)')}>×</button>
                    </div>
                    {/* Update current price */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>Cours actuel :</span>
                      <input type="number" defaultValue={inv.current_price} onBlur={e => updatePrice(inv.id, +e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 12, padding: '4px 8px', width: 110, outline: 'none' }} />
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>MAD</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          📊 Aucune position — ajoutez votre premier investissement !
        </div>
      )}
    </div>
  )
}
