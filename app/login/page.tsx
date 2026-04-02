'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, background: 'var(--acc)', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#000'
          }}>F</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>Finova</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>FINANCE PERSONNELLE</div>
          </div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Vérifie ta boîte mail !</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
              Un lien de connexion a été envoyé à<br />
              <strong style={{ color: 'var(--acc)' }}>{email}</strong>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Connexion</div>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>Entre ton email — on t'envoie un lien magique, pas de mot de passe !</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="toi@exemple.com"
                required
                style={{ fontSize: 15 }}
              />
            </div>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 12, padding: '8px 12px', background: 'rgba(244,63,94,0.08)', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0', background: loading ? 'var(--muted)' : 'var(--acc)',
                border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 15,
                transition: 'all 0.2s', cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Envoi...' : 'Envoyer le lien magique ✨'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
