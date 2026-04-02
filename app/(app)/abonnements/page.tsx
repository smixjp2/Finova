import { createClient } from '@/lib/supabase-server'
import AbonnementsClient from '@/components/modules/AbonnementsClient'

export default async function AbonnementsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? '550e8400-e29b-41d4-a716-446655440000'
  const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).order('renewal_date', { ascending: true })
  return <AbonnementsClient initialData={data ?? []} userId={userId} />
}
