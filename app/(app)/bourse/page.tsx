import { createClient } from '@/lib/supabase-server'
import BourseClient from '@/components/modules/BourseClient'

export default async function BoursePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data } = await supabase.from('investments').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
  return <BourseClient initialData={data ?? []} userId={user!.id} />
}
