import { createClient } from '@/lib/supabase-server'
import ReportsClient from '@/components/modules/ReportsClient'

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
const CC: Record<string, string> = {
  Logement:'#7c3aed',Alimentation:'#f59e0b',Transport:'#3b82f6',Loisirs:'#ec4899',
  Shopping:'#a78bfa',Santé:'#10b981',Éducation:'#14b8a6',Abonnements:'#f97316',Autre:'#64748b',
}

export default async function ReportsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? '550e8400-e29b-41d4-a716-446655440000'

  const { data: txs } = await supabase
    .from('transactions').select('type,amount,category,date')
    .eq('user_id', userId)

  const allTxs = txs ?? []
  const month  = new Date().toISOString().slice(0, 7)

  const totalInc = allTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExp = allTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savings  = totalInc - totalExp
  const rate     = totalInc > 0 ? Math.round(savings / totalInc * 100) : 0

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const m = d.toISOString().slice(0, 7)
    const t = allTxs.filter(x => x.date.startsWith(m))
    return { name: MONTHS[d.getMonth()], inc: t.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0), exp: t.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0) }
  })

  const catData = allTxs
    .filter(t => t.date.startsWith(month) && t.type === 'expense')
    .reduce((acc: { name: string; value: number; fill: string }[], t) => {
      const e = acc.find(c => c.name === t.category)
      if (e) e.value += t.amount
      else acc.push({ name: t.category, value: t.amount, fill: CC[t.category] ?? '#64748b' })
      return acc
    }, []).sort((a, b) => b.value - a.value)

  return <ReportsClient chartData={chartData} catData={catData} totalInc={totalInc} totalExp={totalExp} savings={savings} rate={rate} />
}
