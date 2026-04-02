'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { PageHeader, ActionButton, FormPanel } from '@/components/ui'
import type { Budget } from '@/types'

const CATS = ['Logement','Alimentation','Transport','Loisirs','Shopping','Santé','Éducation','Abonnements','Autre']
const CC: Record<string, string> = {
  Logement:'#7c3aed',Alimentation:'#f59e0b',Transport:'#3b82f6',Loisirs:'#ec4899',
  Shopping:'#a78bfa',Santé:'#10b981',Éducation:'#14b8a6',Abonnements:'#f97316',Autre:'#64748b',
}
const FMT = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' MAD'
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: 'var(--card)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none',
}

interface Props {
  initialBudgets: Budget[]
  monthTxs: { category: string; amount: number; type: string }[]
  userId: string
}

export default function BudgetsClient({ initialBudgets, monthTxs, userId }: Props) {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets)
  const [showForm, setShowForm] = useState(false)
  const [bf, setBf] = useState({ category: 'Alimentation', limit: '' })
  const supabase = createClient()

  const spent: Record<string, number> = {}
  monthTxs.filter(t => t.type === 'expense').forEach(t => {
    spent[t.category] = (spent[t.category] ?? 0) + t.amount
  })

  const addBudget = async () => {
    if (!bf.limit || +bf.limit <= 0) return
    const payload = { user_id: userId, category: bf.category, limit_amount: +bf.limit, color: CC[bf.category] ?? '#64748b' }
    const existing = budgets.find(b => b.category === bf.category)
    if (existing) {
      const { data } = await supabase.from('budgets').update({ limit_amount: +bf.limit }).eq('id', existing.id).select().single()
      if (data) setBudgets(prev => prev.map(b => b.id === existing.id ? data : b))
    } else {
      const { data } = await supabase.from('budgets').insert(payload).select().single()
      if (data) setBudgets(prev => [...prev, data])
    }
    setBf({ category: 'Alimentation', limit: '' })
    setShowForm(false)
  }

  const deleteBudget = async (id: string) => {
    await supabase.from('budgets').delete().eq('id', id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div>
      <PageHeader title="Budgets"
        action={<ActionButton onClick={() => setShowForm(!showForm)}>{showForm ? 'Fermer' : '+ Budget'}</ActionButton>} />

      {showForm && (
        <FormPanel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Catégorie</label>
              <select value={bf.category} onChange={e => setBf(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Plafond mensuel (MAD)</label>
              <input type="number" min="1" value={bf.limit} onChange={e => setBf(f => ({ ...f, limit: e.target.value }))} placeholder="ex: 2000" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addBudget} style={{ flex: 1, padding: '9px 0', background: 'var(--acc)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 14 }}>Enregistrer</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 14 }}>Annuler</button>
          </div>
        </FormPanel>
      )}

      {budgets.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          Aucun budget. Commencez par en créer un !
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {budgets.map(b => {
            const s   = spent[b.category] ?? 0
            const pct = Math.min(100, Math.round(s / b.limit_amount * 100))
            const over = s > b.limit_amount
            return (
              <div key={b.id} style={{ background: 'var(--card)', border: `1px solid ${over ? 'rgba(244,63,94,0.4)' : 'var(--border)'}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{b.category}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{FMT(s)} / {FMT(b.limit_amount)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: over ? 'var(--danger)' : pct > 80 ? '#f59e0b' : 'var(--acc)' }}>{pct}%</span>
                    <button onClick={() => deleteBudget(b.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16, padding: '0 2px', cursor: 'pointer' }}>×</button>
                  </div>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: over ? 'var(--danger)' : pct > 80 ? '#f59e0b' : b.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
                {over && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 8 }}>⚠ Dépassement : {FMT(s - b.limit_amount)}</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
