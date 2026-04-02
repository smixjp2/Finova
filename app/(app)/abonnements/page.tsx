import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AbonnementsClient from '@/components/modules/AbonnementsClient'

export default async function AbonnementsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).order('renewal_date', { ascending: true })
  return <AbonnementsClient initialData={data ?? []} userId={user.id} />
}
