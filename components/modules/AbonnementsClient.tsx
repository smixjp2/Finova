'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { PageHeader, ActionButton, FormPanel, StatCard } from '@/components/ui'
import { SUBSCRIPTION_CATEGORIES, SUBSCRIPTION_ICONS, SUBSCRIPTION_COLORS, daysUntil } from '@/lib/constants'
import { formatMAD } from '@/lib/calculations'
import type { Subscription } from '@/types'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: 'var(--card)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none',
}

export default function AbonnementsClient({ initialData, userId }: { initialData: Subscription[]; userId: string }) {
  const [subs, setSubs]       = useState<Subscription[]>(initialData)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', renewal_date: '', category: SUBSCRIPTION_CATEGORIES[0], auto_save: true })
  const supabase = createClient()

  const addSub = async () => {
    if (!form.name || !form.amount || !form.renewal_date || +form.amount <= 0) {
      alert('Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.from('subscriptions')
        .insert({ ...form, amount: +form.amount, user_id: userId })
        .select().single()
      if (error) throw error
      if (data) {
        setSubs(prev => [...prev, data].sort((a, b) => a.renewal_date.localeCompare(b.renewal_date)))
        setForm({ name: '', amount: '', renewal_date: '', category: SUBSCRIPTION_CATEGORIES[0], auto_save: true })
        setShowForm(false)
      }
    } catch (err: any) {
      console.error('Erreur abonnement:', err)
      alert('Erreur: ' + (err.message || 'Impossible d\'ajouter l\'abonnement'))
    }
    setLoading(false)
  }

  const deleteSub = async (id: string) => {
    try {
      await supabase.from('subscriptions').delete().eq('id', id)
      setSubs(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error('Erreur suppression abonnement:', err)
      alert('Erreur lors de la suppression')
    }
  }

  const totalAnnual    = subs.reduce((s, sub) => s + sub.amount, 0)
  const totalMonthly   = Math.round(totalAnnual / 12)
  const upcoming       = subs.filter(s => daysUntil(s.renewal_date) <= 60)

  const subsWithInfo   = subs.map(sub => {
    const days      = daysUntil(sub.renewal_date)
    const mLeft     = Math.max(1, Math.ceil(days / 30))
    const mElapsed  = Math.max(0, 12 - mLeft)
    const saved     = Math.min(sub.amount, mElapsed * (sub.amount / 12))
    const needed    = Math.max(0, sub.amount - saved)
    const pct       = Math.min(100, Math.round(saved / sub.amount * 100))
    const monthly   = sub.auto_save ? Math.ceil(sub.amount / mLeft) : 0
    return { ...sub, days, monthly, saved, needed, pct }
  })

  const totalMonthlySaving = subsWithInfo.filter(s => s.auto_save).reduce((s, sub) => s + sub.monthly, 0)

  return (
    <div>
      <PageHeader title="Abonnements Annuels" subtitle="Gérez et épargnez avant chaque renouvellement"
        action={<ActionButton color="#38bdf8" textColor="#000" onClick={() => setShowForm(!showForm)}>{showForm ? 'Fermer' : '+ Abonnement'}</ActionButton>} />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <StatCard label="Total annuel"       value={formatMAD(totalAnnual)}         color="#38bdf8"      icon="📅" />
        <StatCard label="Coût mensuel moyen" value={formatMAD(totalMonthly)}        color="var(--muted)" icon="📆" />
        <StatCard label="À épargner/mois"    value={formatMAD(totalMonthlySaving)}  color="#f59e0b"      icon="🎯" sub="Pour tous renouvellements" />
        <StatCard label="Abonnements actifs" value={subs.length}              color="var(--acc)"   icon="✅" />
      </div>

      {upcoming.length > 0 && (
        <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>Renouvellements dans 60 jours</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {upcoming.map(s => (
                <span key={s.id} style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {s.name} — {formatMAD(s.amount)} dans {daysUntil(s.renewal_date)} jours
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <FormPanel>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Nouvel abonnement</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Nom</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Netflix, Spotify..." style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Montant annuel (MAD)</label><input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" style={inputStyle} /></div>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Catégorie</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                {SUBSCRIPTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Date de renouvellement</label><input type="date" value={form.renewal_date} onChange={e => setForm(f => ({ ...f, renewal_date: e.target.value }))} style={inputStyle} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 22 }}>
              <input type="checkbox" id="autoSave" checked={form.auto_save} onChange={e => setForm(f => ({ ...f, auto_save: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#f59e0b' }} />
              <label htmlFor="autoSave" style={{ fontSize: 14, color: 'var(--text)', cursor: 'pointer' }}>Activer la cagnotte mensuelle</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addSub} disabled={loading} style={{ flex: 1, padding: '10px 0', background: loading ? 'var(--muted)' : '#38bdf8', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 14 }}>{loading ? 'Enregistrement...' : 'Ajouter'}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 14 }}>Annuler</button>
          </div>
        </FormPanel>
      )}

      {subs.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          🔄 Aucun abonnement — ajoutez-en un pour commencer à épargner !
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {subsWithInfo.map(sub => {
            const color  = SUBSCRIPTION_COLORS[sub.category] ?? 'var(--muted)'
            const urgent = sub.days <= 30
            const soon   = sub.days <= 60 && sub.days > 30
            const statusColor = urgent ? 'var(--danger)' : soon ? '#f59e0b' : 'var(--acc)'
            return (
              <div key={sub.id} style={{ background: 'var(--card)', border: `1px solid ${urgent ? 'rgba(244,63,94,0.35)' : 'var(--border)'}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: sub.auto_save ? 14 : 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: SUBSCRIPTION_COLORS[sub.category] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {SUBSCRIPTION_ICONS[sub.category] ?? '📦'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{sub.name}</div>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: SUBSCRIPTION_COLORS[sub.category] + '22', color: SUBSCRIPTION_COLORS[sub.category] }}>{sub.category}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      Renouvellement : {sub.renewal_date.split('-').reverse().join('/')} —{' '}
                      <span style={{ color: statusColor, fontWeight: 600 }}>
                        {sub.days <= 0 ? 'Expiré !' : `${sub.days} jours restants`}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{formatMAD(sub.amount)}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>annuel</div>
                  </div>
                  <button onClick={() => deleteSub(sub.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, padding: '2px 6px', cursor: 'pointer' }}
                    onMouseOver={e => (e.currentTarget.style.color = 'var(--danger)')} onMouseOut={e => (e.currentTarget.style.color = 'var(--muted)')}>×</button>
                </div>

                {sub.auto_save && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                      <span>🎯 Cagnotte : <span style={{ color: '#f59e0b', fontWeight: 700 }}>{formatMAD(sub.monthly)}/mois</span></span>
                      <span>{formatMAD(Math.round(sub.saved))} / {formatMAD(sub.amount)}</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${sub.pct}%`, background: 'linear-gradient(90deg, #f59e0b, #00d4aa)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                      <span>{sub.pct}% épargné</span>
                      <span style={{ color: sub.needed <= 0 ? 'var(--acc)' : '#f59e0b' }}>
                        {sub.needed <= 0 ? '✅ Objectif atteint !' : `Encore ${formatMAD(Math.round(sub.needed))} à épargner`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
