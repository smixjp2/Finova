import { createClient } from '@/lib/supabase-server'
import SavingsClient from '@/components/modules/SavingsClient'

export default async function SavingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? '550e8400-e29b-41d4-a716-446655440000'
  const { data } = await supabase.from('savings').select('*').eq('user_id', userId).order('date', { ascending: false })
  return <SavingsClient initialData={data ?? []} userId={userId} />
}
