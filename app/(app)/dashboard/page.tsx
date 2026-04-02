import { createClient } from '@/lib/supabase-server'
import { StatCard } from '@/components/ui'
import DashboardCharts from '@/components/modules/DashboardCharts'
import { calculateFinancialSummary, formatMAD, getLast6Months } from '@/lib/calculations'

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
const CC: Record<string, string> = {
  Logement:'#7c3aed',Alimentation:'#f59e0b',Transport:'#3b82f6',Loisirs:'#ec4899',
  Shopping:'#a78bfa',Santé:'#10b981',Éducation:'#14b8a6',Abonnements:'#f97316',Autre:'#64748b',
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? '550e8400-e29b-41d4-a716-446655440000'

  const [{ data: txs }, { data: savings }, { data: investments }, { data: subs }] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('savings').select('type,amount').eq('user_id', userId),
    supabase.from('investments').select('current_price,quantity').eq('user_id', userId),
    supabase.from('subscriptions').select('amount').eq('user_id', userId),
  ])

  const month  = new Date().toISOString().slice(0, 7)
  const allTxs = (txs ?? []) as any[]
  const monthTxs = allTxs.filter(t => t.date.startsWith(month))

  // Calculate comprehensive summary
  const summary = calculateFinancialSummary(
    allTxs,
    (savings ?? []) as any[],
    (investments ?? []) as any[],
    (subs ?? []) as any[]
  )

  // Chart data using shared utility
  const chartData = getLast6Months(allTxs)

  // Category breakdown for current month
  const catData = monthTxs
    .filter((t: any) => t.type === 'expense')
    .reduce((acc: { name: string; value: number; fill: string }[], t: any) => {
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
        <StatCard label="Solde total"      value={formatMAD(summary.balance)}               color={summary.balance >= 0 ? 'var(--acc)' : 'var(--danger)'} sub="Tous revenus - dépenses" />
        <StatCard label="Revenus du mois"  value={formatMAD(summary.monthIncome)}            color="var(--acc)" />
        <StatCard label="Dépenses du mois" value={formatMAD(summary.monthExpenses)}          color="var(--danger)" />
        <StatCard label="Épargne nette"    value={formatMAD(summary.monthBalance)} color={summary.monthBalance >= 0 ? 'var(--acc)' : 'var(--danger)'} sub={`${summary.savingsRate}% d'épargne`} />
      </div>

      {/* Patrimoine */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: '🏦 Épargne Cornet',       value: formatMAD(Math.max(0, summary.totalSaved)),  color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
          { label: '📈 Portefeuille Bourse',  value: formatMAD(summary.totalPortfolio),           color: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
          { label: '🔄 Abonnements/an',       value: formatMAD(summary.totalSubscriptions),       color: '#38bdf8', border: 'rgba(56,189,248,0.25)' },
          { label: '💎 Patrimoine total',     value: formatMAD(summary.patrimoine),              color: 'var(--acc)', border: 'rgba(0,212,170,0.25)' },
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
