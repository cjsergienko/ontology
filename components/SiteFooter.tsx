'use client'

import { usePathname } from 'next/navigation'

export function SiteFooter() {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  return (
    <footer style={{
      background: '#070b14',
      borderTop: isLanding ? '1px solid rgba(99,102,241,0.1)' : '1px solid #1e2130',
      padding: isLanding ? '40px 40px' : '14px 40px',
      flexShrink: 0,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        {isLanding ? (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 32,
          }}>
            {/* Brand */}
            <div>
              <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 12 }}>
                <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
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
                <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em' }}>
                  ontology<span style={{ color: '#6366f1' }}>.live</span>
                </span>
              </a>
              <p style={{ fontSize: 12, color: '#334155', margin: 0, maxWidth: 260, lineHeight: 1.6 }}>
                Visual ontology & knowledge graph designer for AI agent pipelines.
              </p>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: 48 }}>
              <div>
                <div style={{ fontSize: 11, color: '#6366f1', letterSpacing: '0.1em', marginBottom: 12 }}>PRODUCT</div>
                {[
                  { label: 'Features', href: '/#features' },
                  { label: 'Pricing', href: '/#pricing' },
                  { label: 'Launch App', href: '/dashboard' },
                ].map(l => (
                  <a key={l.label} href={l.href} style={{
                    display: 'block', fontSize: 13, color: '#475569', textDecoration: 'none',
                    marginBottom: 8, transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6366f1', letterSpacing: '0.1em', marginBottom: 12 }}>CONTACT</div>
                <a href="mailto:hello@ontology.live" style={{
                  display: 'block', fontSize: 13, color: '#475569', textDecoration: 'none',
                  marginBottom: 8,
                }}>hello@ontology.live</a>
              </div>
            </div>
          </div>
        ) : null}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: isLanding ? 40 : 0,
          paddingTop: isLanding ? 24 : 0,
          borderTop: isLanding ? '1px solid rgba(99,102,241,0.06)' : 'none',
        }}>
          {isLanding ? (
            <p style={{ fontSize: 12, color: '#1e293b', margin: 0 }}>
              © 2026 ontology.live
            </p>
          ) : (
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
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
              <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '-0.01em' }}>
                ontology<span style={{ color: '#6366f1' }}>.live</span>
              </span>
            </a>
          )}
          <p style={{ fontSize: 12, color: '#1e293b', margin: 0 }}>
            {!isLanding && '© 2026 ontology.live — Visual ontology & knowledge graph designer'}
          </p>
        </div>
      </div>
    </footer>
  )
}
