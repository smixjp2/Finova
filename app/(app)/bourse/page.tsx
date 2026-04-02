import { createClient } from '@/lib/supabase-server'
import BourseClient from '@/components/modules/BourseClient'

export default async function BoursePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? '550e8400-e29b-41d4-a716-446655440000'
  const { data } = await supabase.from('investments').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return <BourseClient initialData={data ?? []} userId={userId} />
}
