import { createClient } from '@/lib/supabase-server'
import SavingsClient from '@/components/modules/SavingsClient'

export default async function SavingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data } = await supabase.from('savings').select('*').eq('user_id', user!.id).order('date', { ascending: false })
  return <SavingsClient initialData={data ?? []} userId={user!.id} />
}
