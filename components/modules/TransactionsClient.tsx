'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { PageHeader, ActionButton, FormPanel, Card } from '@/components/ui'
import type { Transaction, NewTransaction } from '@/types'

const CATS = {
  expense: ['Logement','Alimentation','Transport','Loisirs','Shopping','Santé','Éducation','Abonnements','Autre'],
  income:  ['Salaire','Freelance','Investissement','Cadeau','Remboursement','Autre'],
}
const CC: Record<string, string> = {
  Logement:'#7c3aed',Alimentation:'#f59e0b',Transport:'#3b82f6',Loisirs:'#ec4899',
  Shopping:'#a78bfa',Santé:'#10b981',Éducation:'#14b8a6',Abonnements:'#f97316',Autre:'#64748b',
  Salaire:'#00d4aa',Freelance:'#34d399',Investissement:'#a78bfa',Cadeau:'#fb7185',Remboursement:'#38bdf8',
}
const FMT = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' MAD'
const TODAY = () => new Date().toISOString().split('T')[0]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: 'var(--card)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
  fontSize: 14, boxSizing: 'border-box', outline: 'none',
}

interface Props { initialTxs: Transaction[]; userId: string }

export default function TransactionsClient({ initialTxs, userId }: Props) {
  const [txs, setTxs]         = useState<Transaction[]>(initialTxs)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fType, setFType]     = useState<'all' | 'income' | 'expense'>('all')
  const [fMonth, setFMonth]   = useState(TODAY().slice(0, 7))
  const [form, setForm]       = useState<NewTransaction>({
    type: 'expense', amount: 0, category: 'Alimentation', description: '', date: TODAY(),
  })
  const supabase = createClient()

  const addTx = async () => {
    if (!form.amount || form.amount <= 0) return
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...form, user_id: userId })
      .select()
      .single()
    if (!error && data) {
      setTxs(prev => [data, ...prev])
      setForm({ type: form.type, amount: 0, category: form.category, description: '', date: TODAY() })
      setShowAdd(false)
    }
    setLoading(false)
  }

  const deleteTx = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id)
    setTxs(prev => prev.filter(t => t.id !== id))
  }

  const filtered = txs.filter(t => {
    if (fType !== 'all' && t.type !== fType) return false
    if (fMonth && !t.date.startsWith(fMonth)) return false
    return true
  })
  const net = filtered.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
  const cats = CATS[form.type]

  return (
    <div>
      <PageHeader
        title="Transactions"
        action={
          <ActionButton onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Fermer' : '+ Ajouter'}
          </ActionButton>
        }
      />

      {showAdd && (
        <FormPanel>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 18 }}>Nouvelle transaction</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['income', 'expense'] as const).map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: CATS[t][0] }))}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: `1.5px solid ${form.type === t ? (t === 'income' ? 'var(--acc)' : 'var(--danger)') : 'var(--border)'}`,
                  background: form.type === t ? (t === 'income' ? 'rgba(0,212,170,0.12)' : 'rgba(244,63,94,0.12)') : 'transparent',
                  color: form.type === t ? (t === 'income' ? 'var(--acc)' : 'var(--danger)') : 'var(--muted)',
                  fontSize: 14, fontWeight: form.type === t ? 700 : 400,
                }}>
                {t === 'income' ? '＋ Revenu' : '－ Dépense'}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Montant (MAD)</label>
              <input type="number" min="0" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Catégorie</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Description</label>
              <input type="text" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Note optionnelle..." style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addTx} disabled={loading} style={{ flex: 1, padding: '10px 0', background: loading ? 'var(--muted)' : 'var(--acc)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 14 }}>
              {loading ? 'Enregistrement...' : 'Ajouter'}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 14 }}>
              Annuler
            </button>
          </div>
        </FormPanel>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        {(['all', 'income', 'expense'] as const).map(t => (
          <button key={t} onClick={() => setFType(t)} style={{
            padding: '7px 14px', borderRadius: 8,
            border: `1px solid ${fType === t ? (t === 'income' ? 'var(--acc)' : t === 'expense' ? 'var(--danger)' : 'var(--acc)') : 'var(--border)'}`,
            background: fType === t ? 'rgba(255,255,255,0.07)' : 'transparent',
            color: fType === t ? 'var(--text)' : 'var(--muted)', fontSize: 13,
          }}>
            {t === 'all' ? 'Tout' : t === 'income' ? 'Revenus' : 'Dépenses'}
          </button>
        ))}
        <input type="month" value={fMonth} onChange={e => setFMonth(e.target.value)}
          style={{ marginLeft: 'auto', padding: '7px 12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none' }} />
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 20px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: net >= 0 ? 'var(--acc)' : 'var(--danger)' }}>
          {net >= 0 ? '+ ' : ''}{FMT(Math.abs(net))}
        </span>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '4px 16px' }}>
        {filtered.length === 0
          ? <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Aucune transaction pour ces filtres.</div>
          : filtered.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: (CC[t.category] ?? '#64748b') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: CC[t.category] ?? '#64748b', flexShrink: 0 }}>
                {t.category.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description || t.category}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{t.category} · {t.date.split('-').reverse().join('/')}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: t.type === 'income' ? 'var(--acc)' : 'var(--danger)', marginRight: 8, whiteSpace: 'nowrap' }}>
                {t.type === 'income' ? '+ ' : '- '}{FMT(t.amount)}
              </div>
              <button onClick={() => deleteTx(t.id)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '2px 6px', borderRadius: 4, lineHeight: 1 }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--danger)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--muted)')}>×</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}
