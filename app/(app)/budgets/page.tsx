import { createClient } from '@/lib/supabase-server'
import BudgetsClient from '@/components/modules/BudgetsClient'

export default async function BudgetsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? '550e8400-e29b-41d4-a716-446655440000'
  const month = new Date().toISOString().slice(0, 7)
  const [{ data: budgets }, { data: monthTxs }] = await Promise.all([
    supabase.from('budgets').select('*').eq('user_id', userId),
    supabase.from('transactions').select('category,amount,type').eq('user_id', userId).like('date', `${month}%`),
  ])
  return <BudgetsClient initialBudgets={budgets ?? []} monthTxs={monthTxs ?? []} userId={userId} />
}
