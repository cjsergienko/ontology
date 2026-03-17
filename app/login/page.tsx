'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => { inputRef.current?.focus() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (res.ok) {
        router.replace('/')
      } else {
        setError('Wrong PIN')
        setPin('')
        inputRef.current?.focus()
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg)',
    }}>
      <form onSubmit={submit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '32px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        minWidth: '280px',
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Ontology Builder
        </div>
        <input
          ref={inputRef}
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          placeholder="PIN"
          autoComplete="current-password"
          style={{
            background: 'var(--surface2)',
            border: `1px solid ${error ? 'var(--red)' : 'var(--border2)'}`,
            borderRadius: '4px',
            color: 'var(--text)',
            fontFamily: 'inherit',
            fontSize: '16px',
            letterSpacing: '0.3em',
            padding: '10px 14px',
            outline: 'none',
            textAlign: 'center',
          }}
        />
        {error && (
          <div style={{ color: 'var(--red)', fontSize: '11px', textAlign: 'center' }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={loading || pin.length === 0}
          style={{
            background: 'var(--accent)',
            border: 'none',
            borderRadius: '4px',
            color: '#000',
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: 600,
            padding: '10px',
            opacity: loading || pin.length === 0 ? 0.5 : 1,
          }}
        >
          {loading ? '...' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
