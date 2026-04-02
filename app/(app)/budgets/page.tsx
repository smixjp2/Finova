import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import BudgetsClient from '@/components/modules/BudgetsClient'

export default async function BudgetsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const month = new Date().toISOString().slice(0, 7)
  const [{ data: budgets }, { data: monthTxs }] = await Promise.all([
    supabase.from('budgets').select('*').eq('user_id', user.id),
    supabase.from('transactions').select('category,amount,type').eq('user_id', user.id).like('date', `${month}%`),
  ])
  return <BudgetsClient initialBudgets={budgets ?? []} monthTxs={monthTxs ?? []} userId={user.id} />
}
