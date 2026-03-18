'use client'

import { usePathname } from 'next/navigation'
import { SignOutButton } from './SignOutButton'

const Logo = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="3.5" fill="#6366f1"/>
    <circle cx="3" cy="4" r="2.5" fill="#6366f1" opacity="0.7"/>
    <circle cx="19" cy="4" r="2.5" fill="#6366f1" opacity="0.7"/>
    <circle cx="3" cy="18" r="2.5" fill="#6366f1" opacity="0.7"/>
    <circle cx="19" cy="18" r="2.5" fill="#6366f1" opacity="0.7"/>
    <line x1="11" y1="11" x2="3" y2="4" stroke="#6366f1" strokeWidth="1.5" opacity="0.5"/>
    <line x1="11" y1="11" x2="19" y2="4" stroke="#6366f1" strokeWidth="1.5" opacity="0.5"/>
    <line x1="11" y1="11" x2="3" y2="18" stroke="#6366f1" strokeWidth="1.5" opacity="0.5"/>
    <line x1="11" y1="11" x2="19" y2="18" stroke="#6366f1" strokeWidth="1.5" opacity="0.5"/>
  </svg>
)

export function SiteHeader() {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isApp = pathname.startsWith('/dashboard') || pathname.startsWith('/ontology')

  return (
    <header style={{
      background: '#0a0d18',
      borderBottom: '1px solid rgba(99,102,241,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      height: '56px',
      flexShrink: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <Logo />
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: '15px',
          color: '#f1f5f9',
          letterSpacing: '-0.02em',
        }}>
          ontology<span style={{ color: '#6366f1' }}>.live</span>
        </span>
      </a>

      {/* Landing page nav */}
      {isLanding && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { label: 'Features', href: '/#features' },
            { label: 'Pricing', href: '/#pricing' },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontSize: 13,
                color: '#64748b',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                transition: 'color 0.15s',
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/dashboard"
            style={{
              marginLeft: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#f1f5f9',
              textDecoration: 'none',
              padding: '7px 18px',
              borderRadius: 9999,
              background: '#6366f1',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#4f46e5')}
            onMouseLeave={e => (e.currentTarget.style.background = '#6366f1')}
          >
            Launch App
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </nav>
      )}

      {/* App nav — back to home + sign out */}
      {isApp && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href="/"
            style={{
              fontSize: 12,
              color: '#475569',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M9.5 6h-7M6 2.5L2.5 6 6 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ontology.live
          </a>
          <SignOutButton />
        </nav>
      )}
    </header>
  )
}
