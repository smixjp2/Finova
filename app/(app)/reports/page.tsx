import { createClient } from '@/lib/supabase-server'
import ReportsClient from '@/components/modules/ReportsClient'
import { getLast6Months, calculateFinancialSummary } from '@/lib/calculations'

const CC: Record<string, string> = {
  Logement:'#7c3aed',Alimentation:'#f59e0b',Transport:'#3b82f6',Loisirs:'#ec4899',
  Shopping:'#a78bfa',Santé:'#10b981',Éducation:'#14b8a6',Abonnements:'#f97316',Autre:'#64748b',
}

export default async function ReportsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? '550e8400-e29b-41d4-a716-446655440000'

  const [{ data: txs }, { data: savings }, { data: investments }, { data: subs }] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', userId),
    supabase.from('savings').select('type,amount').eq('user_id', userId),
    supabase.from('investments').select('current_price,quantity').eq('user_id', userId),
    supabase.from('subscriptions').select('amount').eq('user_id', userId),
  ])

  const allTxs = (txs ?? []) as any[]
  const month  = new Date().toISOString().slice(0, 7)

  // Calculate comprehensive summary
  const summary = calculateFinancialSummary(
    allTxs,
    (savings ?? []) as any[],
    (investments ?? []) as any[],
    (subs ?? []) as any[]
  )

  // Chart data: 6 last months
  const chartData = getLast6Months(allTxs).map(d => ({
    name: d.month,
    inc: d.income,
    exp: d.expenses,
  }))

  // Category breakdown for current month
  const monthTxs = allTxs.filter(t => t.date.startsWith(month))
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
    <ReportsClient
      chartData={chartData}
      catData={catData}
      totalInc={summary.totalIncome}
      totalExp={summary.totalExpenses}
      savings={summary.balance}
      rate={summary.savingsRate}
    />
  )
}
