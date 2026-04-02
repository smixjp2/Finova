import { createClient } from '@/lib/supabase-server'
import TransactionsClient from '@/components/modules/TransactionsClient'

export default async function TransactionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: txs } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })

  return <TransactionsClient initialTxs={txs ?? []} userId={user!.id} />
}
