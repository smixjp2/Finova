'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const NAV = [
  { href: '/dashboard',     icon: '⊞', label: 'Dashboard' },
  { href: '/transactions',  icon: '↕', label: 'Transactions' },
  { href: '/reports',       icon: '◉', label: 'Rapports' },
  { href: '/budgets',       icon: '◈', label: 'Budgets' },
  { href: '/savings',       icon: '🏦', label: 'Épargne Cornet' },
  { href: '/bourse',        icon: '📈', label: 'Bourse' },
  { href: '/abonnements',   icon: '🔄', label: 'Abonnements' },
  // ↓ Ajoute tes futurs modules ici
]

interface SidebarProps {
  balance: number
  monthIncome: number
  monthExpenses: number
  upcomingSubsCount?: number
}

const FMT = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    .format(Math.round(n)) + ' MAD'

export default function Sidebar({ balance, monthIncome, monthExpenses, upcomingSubsCount = 0 }: SidebarProps) {
  const pathname  = usePathname()
  const router    = useRouter()

  return (
    <nav style={{
      width: 210, background: 'var(--surf)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh',
      position: 'sticky', top: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 34, height: 34, background: 'var(--acc)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#000' }}>F</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>Finova</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em' }}>FINANCE PERSO</div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '12px 0', flex: 1, overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = pathname === item.href
          const badge  = item.href === '/abonnements' && upcomingSubsCount > 0 ? upcomingSubsCount : null
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 20px', width: '100%', border: 'none', textAlign: 'left',
                fontFamily: 'inherit', fontSize: 14, transition: 'all 0.15s', cursor: 'pointer',
                background: active ? 'rgba(0,212,170,0.15)' : 'transparent',
                borderLeft: active ? '3px solid var(--acc)' : '3px solid transparent',
                color: active ? 'var(--acc)' : 'var(--muted)',
                fontWeight: active ? 600 : 400,
              }}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
              {badge && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--danger)', color: '#fff',
                  borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 6px',
                }}>{badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Résumé + logout */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Solde total</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: balance >= 0 ? 'var(--acc)' : 'var(--danger)', letterSpacing: '-0.02em' }}>
          {FMT(balance)}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: 'rgba(0,212,170,0.08)', borderRadius: 7, padding: '7px 10px' }}>
            <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Revenus</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--acc)' }}>{FMT(monthIncome)}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(244,63,94,0.08)', borderRadius: 7, padding: '7px 10px' }}>
            <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Dépenses</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)' }}>{FMT(monthExpenses)}</div>
          </div>
        </div>
        {/* Logout button hidden - no authentication required */}
      </div>
    </nav>
  )
}
