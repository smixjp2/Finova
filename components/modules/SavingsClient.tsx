'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Chart, registerables } from 'chart.js'
import { PageHeader, ActionButton, FormPanel, StatCard } from '@/components/ui'
import { getToday } from '@/lib/constants'
import { formatMAD } from '@/lib/calculations'
import type { SavingEntry } from '@/types'
Chart.register(...registerables)
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: 'var(--card)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none',
}

export default function SavingsClient({ initialData, userId }: { initialData: SavingEntry[]; userId: string }) {
  const [entries, setEntries] = useState<SavingEntry[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [form, setForm] = useState({ type: 'deposit' as 'deposit' | 'withdrawal', amount: '', description: '', date: getToday() })
  const supabase = createClient()

  const totalSaved  = entries.reduce((s, e) => s + (e.type === 'deposit' ? e.amount : -e.amount), 0)
  const totalIn     = entries.filter(e => e.type === 'deposit').reduce((s, e) => s + e.amount, 0)
  const totalOut    = entries.filter(e => e.type === 'withdrawal').reduce((s, e) => s + e.amount, 0)

  const addEntry = async () => {
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) return
    setLoading(true)
    const { data, error } = await supabase.from('savings')
      .insert({ ...form, amount: +form.amount, user_id: userId })
      .select().single()
    if (!error && data) {
      setEntries(prev => [data, ...prev])
      setForm({ type: form.type, amount: '', description: '', date: getToday() })
      setShowForm(false)
    }
    setLoading(false)
  }

  const deleteEntry = async (id: string) => {
    await supabase.from('savings').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  // Line chart cumulative
  const lineRef  = useRef<HTMLCanvasElement>(null)
  const lineInst = useRef<Chart | null>(null)
  useEffect(() => {
    if (!lineRef.current) return
    lineInst.current?.destroy()
    const sorted  = [...entries].sort((a, b) => a.date.localeCompare(b.date))
    const points: { date: string; bal: number }[] = []
    let run = 0
    sorted.forEach(e => { run += e.type === 'deposit' ? e.amount : -e.amount; points.push({ date: e.date.slice(5).replace('-', '/'), bal: run }) })
    if (!points.length) return
    lineInst.current = new Chart(lineRef.current, {
      type: 'line',
      data: { labels: points.map(p => p.date), datasets: [{ label: 'Solde', data: points.map(p => p.bal), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 2, pointBackgroundColor: '#f59e0b', pointRadius: 3, fill: true, tension: 0.4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#4a6080', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#4a6080', font: { size: 10 }, callback: v => Math.round(+v).toLocaleString('fr-FR') }, grid: { color: 'rgba(255,255,255,0.04)' } } } },
    })
    return () => lineInst.current?.destroy()
  }, [entries])

  return (
    <div>
      <PageHeader title="🏦 Épargne Cornet" subtitle="Suivi de votre compte épargne"
        action={<ActionButton color="#f59e0b" onClick={() => setShowForm(!showForm)}>{showForm ? 'Fermer' : '+ Mouvement'}</ActionButton>} />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <StatCard label="Solde Cornet"  value={formatMAD(Math.max(0, totalSaved))} color="#f59e0b" icon="💰" sub="Épargne disponible" />
        <StatCard label="Total versé"   value={formatMAD(totalIn)}                 color="var(--acc)" icon="⬆" />
        <StatCard label="Total retiré"  value={formatMAD(totalOut)}                color="var(--danger)" icon="⬇" />
        <StatCard label="Mouvements"    value={entries.length}               color="var(--muted)" icon="📋" />
      </div>

      {showForm && (
        <FormPanel>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Nouveau mouvement</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['deposit', 'withdrawal'] as const).map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                flex: 1, padding: '9px 0', borderRadius: 8,
                border: `1.5px solid ${form.type === t ? (t === 'deposit' ? '#f59e0b' : 'var(--danger)') : 'var(--border)'}`,
                background: form.type === t ? (t === 'deposit' ? 'rgba(245,158,11,0.12)' : 'rgba(244,63,94,0.12)') : 'transparent',
                color: form.type === t ? (t === 'deposit' ? '#f59e0b' : 'var(--danger)') : 'var(--muted)', fontSize: 14, fontWeight: form.type === t ? 700 : 400,
              }}>{t === 'deposit' ? '⬆ Versement' : '⬇ Retrait'}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Montant (MAD)</label><input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Date</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Note</label><input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optionnel..." style={inputStyle} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addEntry} disabled={loading} style={{ flex: 1, padding: '10px 0', background: loading ? 'var(--muted)' : '#f59e0b', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 14 }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 14 }}>Annuler</button>
          </div>
        </FormPanel>
      )}

      {entries.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Évolution du solde</div>
          <div style={{ position: 'relative', height: 180 }}><canvas ref={lineRef} /></div>
        </div>
      )}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '4px 16px' }}>
        {entries.length === 0
          ? <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Aucun mouvement — ajoutez votre premier versement !</div>
          : entries.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: (e.type === 'deposit' ? '#f59e0b' : 'var(--danger)') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {e.type === 'deposit' ? '⬆' : '⬇'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text)' }}>{e.description || (e.type === 'deposit' ? 'Versement' : 'Retrait')}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{e.date.split('-').reverse().join('/')}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: e.type === 'deposit' ? '#f59e0b' : 'var(--danger)', marginRight: 8 }}>
                {e.type === 'deposit' ? '+ ' : '- '}{formatMAD(e.amount)}
              </div>
              <button onClick={() => deleteEntry(e.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '2px 6px', cursor: 'pointer' }}
                onMouseOver={ev => (ev.currentTarget.style.color = 'var(--danger)')} onMouseOut={ev => (ev.currentTarget.style.color = 'var(--muted)')}>×</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}
