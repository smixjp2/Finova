import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { StatCard, Card } from '@/components/ui'
import DashboardCharts from '@/components/modules/DashboardCharts'

const FMT = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n)) + ' MAD'

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: txs }, { data: savings }, { data: investments }, { data: subs }] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('savings').select('type,amount').eq('user_id', user.id),
    supabase.from('investments').select('current_price,quantity').eq('user_id', user.id),
    supabase.from('subscriptions').select('amount').eq('user_id', user.id),
  ])

  const allTxs = txs ?? []
  const month  = new Date().toISOString().slice(0, 7)

  const totalIncome   = allTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExp      = allTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance       = totalIncome - totalExp
  const monthTxs      = allTxs.filter(t => t.date.startsWith(month))
  const monthIncome   = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthExpenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Patrimoine
  const totalSaved    = (savings ?? []).reduce((s, e) => s + (e.type === 'deposit' ? e.amount : -e.amount), 0)
  const totalPortfolio = (investments ?? []).reduce((s, i) => s + i.current_price * i.quantity, 0)
  const totalSubs     = (subs ?? []).reduce((s, sub) => s + sub.amount, 0)
  const patrimoine    = Math.max(0, totalSaved) + totalPortfolio + balance

  // Chart : 6 derniers mois
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const m = d.toISOString().slice(0, 7)
    const t = allTxs.filter(x => x.date.startsWith(m))
    return {
      name: MONTHS[d.getMonth()],
      inc:  t.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0),
      exp:  t.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0),
    }
  })

  // Donut dépenses du mois
  const CC: Record<string, string> = {
    Logement:'#7c3aed',Alimentation:'#f59e0b',Transport:'#3b82f6',Loisirs:'#ec4899',
    Shopping:'#a78bfa',Santé:'#10b981',Éducation:'#14b8a6',Abonnements:'#f97316',Autre:'#64748b',
  }
  const catData = monthTxs
    .filter(t => t.type === 'expense')
    .reduce((acc: { name: string; value: number; fill: string }[], t) => {
      const e = acc.find(c => c.name === t.category)
      if (e) e.value += t.amount
      else acc.push({ name: t.category, value: t.amount, fill: CC[t.category] ?? '#64748b' })
      return acc
    }, [])
    .sort((a, b) => b.value - a.value)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          Tableau de bord{' '}
          <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 400 }}>
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
        </h1>
      </div>

      {/* KPIs mois */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <StatCard label="Solde total"      value={FMT(balance)}               color={balance >= 0 ? 'var(--acc)' : 'var(--danger)'} sub="Tous revenus - dépenses" />
        <StatCard label="Revenus du mois"  value={FMT(monthIncome)}            color="var(--acc)" />
        <StatCard label="Dépenses du mois" value={FMT(monthExpenses)}          color="var(--danger)" />
        <StatCard label="Épargne nette"    value={FMT(monthIncome - monthExpenses)} color={monthIncome - monthExpenses >= 0 ? 'var(--acc)' : 'var(--danger)'} />
      </div>

      {/* Patrimoine */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: '🏦 Épargne Cornet',       value: FMT(Math.max(0, totalSaved)),  color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
          { label: '📈 Portefeuille Bourse',  value: FMT(totalPortfolio),           color: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
          { label: '🔄 Abonnements/an',       value: FMT(totalSubs),               color: '#38bdf8', border: 'rgba(56,189,248,0.25)' },
          { label: '💎 Patrimoine total',     value: FMT(patrimoine),              color: 'var(--acc)', border: 'rgba(0,212,170,0.25)' },
        ].map(item => (
          <div key={item.label} style={{
            flex: 1, minWidth: 140, background: 'var(--card)',
            border: `1px solid ${item.border}`, borderRadius: 12, padding: '16px 20px'
          }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Charts (client component) */}
      <DashboardCharts chartData={chartData} catData={catData} recentTxs={allTxs.slice(0, 7)} />
    </div>
  )
}
