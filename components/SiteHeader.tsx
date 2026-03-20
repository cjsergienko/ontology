'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.sh-header')) setMenuOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [menuOpen])

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .sh-desktop-nav { display: none !important; }
          .sh-hamburger { display: flex !important; }
          .sh-header { padding: 0 16px !important; }
        }
        @media (min-width: 769px) {
          .sh-hamburger { display: none !important; }
          .sh-mobile-menu { display: none !important; }
        }
      `}</style>

      <header className="sh-header" style={{
        background: '#0a0d18',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: pathname.startsWith('/ontology') ? '0 14px' : '0 40px',
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

        {/* Landing page nav — desktop */}
        {isLanding && (
          <nav className="sh-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

        {/* App nav — sign out only */}
        {isApp && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SignOutButton />
          </nav>
        )}

        {/* Hamburger button — mobile, landing only */}
        {isLanding && (
          <button
            className="sh-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              display: 'none', // overridden by media query
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              background: 'transparent',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 8,
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          >
            {menuOpen ? (
              // X icon
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4l10 10M14 4L4 14" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              // Hamburger icon
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5h12M3 9h12M3 13h12" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        )}
      </header>

      {/* Mobile dropdown menu */}
      {isLanding && menuOpen && (
        <div
          className="sh-mobile-menu"
          style={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            zIndex: 99,
            background: '#0a0d18',
            borderBottom: '1px solid rgba(99,102,241,0.15)',
            padding: '16px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {[
            { label: 'Features', href: '/#features' },
            { label: 'Pricing', href: '/#pricing' },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: 14,
                color: '#94a3b8',
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: 8,
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.08)'
                e.currentTarget.style.color = '#a5b4fc'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#94a3b8'
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 14,
              color: '#fff',
              textDecoration: 'none',
              padding: '12px 16px',
              borderRadius: 9999,
              background: '#6366f1',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
            }}
          >
            Launch App
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      )}
    </>
  )
}
