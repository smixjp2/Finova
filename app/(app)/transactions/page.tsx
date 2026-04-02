import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TransactionsClient from '@/components/modules/TransactionsClient'

export default async function TransactionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: txs } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return <TransactionsClient initialTxs={txs ?? []} userId={user.id} />
}
