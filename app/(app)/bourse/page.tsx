import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import BourseClient from '@/components/modules/BourseClient'

export default async function BoursePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data } = await supabase.from('investments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  return <BourseClient initialData={data ?? []} userId={user.id} />
}
