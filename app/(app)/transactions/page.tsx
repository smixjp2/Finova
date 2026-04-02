import { createClient } from '@/lib/supabase-server'
import TransactionsClient from '@/components/modules/TransactionsClient'

export default async function TransactionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? '550e8400-e29b-41d4-a716-446655440000'

  const { data: txs } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  return <TransactionsClient initialTxs={txs ?? []} userId={userId} />
}}
