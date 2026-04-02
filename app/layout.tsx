import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finova — Finance Personnelle',
  description: 'Gérez vos finances, épargne, investissements et abonnements',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
