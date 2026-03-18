'use client'

import { serverSignOut } from '@/app/actions'

export function SignOutButton() {
  async function handleSignOut() {
    // Clear all client-side storage
    try { localStorage.clear() } catch {}
    try { sessionStorage.clear() } catch {}

    // Clear all cookies the browser can see
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
    })

    // Clear Auth.js session cookie server-side and redirect to /
    await serverSignOut()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        background: 'transparent',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 6,
        color: '#94a3b8',
        cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        padding: '5px 12px',
        transition: 'border-color 0.15s, color 0.15s',
        letterSpacing: '0.05em',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.7)'
        e.currentTarget.style.color = '#f87171'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
        e.currentTarget.style.color = '#94a3b8'
      }}
    >
      sign out
    </button>
  )
}
