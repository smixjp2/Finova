import { createClient } from '@/lib/supabase-server'
import Sidebar from '@/components/ui/Sidebar'

// Layout partagé pour toutes les pages protégées
// Chaque nouvelle page dans /app/(app)/ est automatiquement protégée
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Use mock user ID if no authentication
  const userId = user?.id ?? '550e8400-e29b-41d4-a716-446655440000'

  const now   = new Date()
  const month = now.toISOString().slice(0, 7)

  const [{ data: txs }, { data: subs }] = await Promise.all([
    supabase.from('transactions').select('type,amount,date').eq('user_id', userId),
    supabase.from('subscriptions').select('renewal_date').eq('user_id', userId),
  ])

  const allTxs       = txs ?? []
  const totalIncome  = allTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExp     = allTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalIncome - totalExp
  const monthTxs     = allTxs.filter(t => t.date.startsWith(month))
  const monthIncome  = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthExpenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const upcomingSubsCount = (subs ?? []).filter(s => {
    const r = new Date(s.renewal_date); r.setHours(0, 0, 0, 0)
    return Math.ceil((r.getTime() - today.getTime()) / 86400000) <= 60
  }).length

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        balance={balance}
        monthIncome={monthIncome}
        monthExpenses={monthExpenses}
        upcomingSubsCount={upcomingSubsCount}
      />
      <main style={{ flex: 1, overflowY: 'auto', padding: 28, background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
