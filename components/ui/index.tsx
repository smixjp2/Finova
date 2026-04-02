// ─────────────────────────────────────────────────────────────
//  Composants UI réutilisables dans toute l'app
// ─────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: string
  icon?: string
}

export function StatCard({ label, value, sub, color = 'var(--text)', icon }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '18px 20px', flex: 1, minWidth: 140
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

interface EmptyStateProps {
  emoji: string
  message: string
}

export function EmptyState({ emoji, message }: EmptyStateProps) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '40px 20px', textAlign: 'center',
      color: 'var(--muted)', fontSize: 14
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
      {message}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string
  textColor?: string
  children: React.ReactNode
}

export function ActionButton({ color = 'var(--acc)', textColor = '#000', children, style, ...props }: ActionButtonProps) {
  return (
    <button
      style={{
        padding: '10px 20px', background: color, border: 'none',
        borderRadius: 10, color: textColor, fontWeight: 700, fontSize: 14,
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export function FormPanel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surf)', border: '1px solid var(--border)',
      borderRadius: 14, padding: 24, marginBottom: 20
    }}>
      {children}
    </div>
  )
}

export function Card({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 20, ...style
    }}>
      {children}
    </div>
  )
}
