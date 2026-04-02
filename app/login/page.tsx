'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Email invalide')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-12),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (err) {
        setError(err.message)
      } else {
        setMessage('Vérifie ton email pour confirmer ton compte!')
        setEmail('')
      }
    } catch (err) {
      setError('Erreur réseau')
    }

    setLoading(false)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Email invalide')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (err) {
        setError(err.message)
      } else {
        setMessage('Lien magique envoyé ! Vérifie ton email 📧')
        setEmail('')
      }
    } catch (err) {
      setError('Erreur réseau')
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          Finova
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#94a3b8',
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          Gère tes finances simplement
        </p>

        <form onSubmit={handleMagicLink} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#cbd5e1',
                marginBottom: '6px',
                fontWeight: '500',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: loading ? '#64748b' : '#00d4aa',
              border: 'none',
              borderRadius: '8px',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Envoi en cours...' : '🔗 Lien magique'}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            margin: '20px 0',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: '#334155', marginTop: '8px' }} />
          <span style={{ fontSize: '12px', color: '#64748b' }}>ou</span>
          <div style={{ flex: 1, height: '1px', background: '#334155', marginTop: '8px' }} />
        </div>

        <button
          onClick={handleSignUp}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#cbd5e1',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Envoi en cours...' : '✍️ S\'inscrire'}
        </button>

        {error && (
          <div
            style={{
              marginTop: '16px',
              padding: '10px 12px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid #f43f5e',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#fca5a5',
            }}
          >
            ❌ {error}
          </div>
        )}

        {message && (
          <div
            style={{
              marginTop: '16px',
              padding: '10px 12px',
              background: 'rgba(0, 212, 170, 0.1)',
              border: '1px solid #00d4aa',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#86efac',
            }}
          >
            ✅ {message}
          </div>
        )}

        <p
          style={{
            fontSize: '11px',
            color: '#64748b',
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          Tu recevras un lien/code pour te connecter sans mot de passe.
        </p>
      </div>
    </div>
  )
}
