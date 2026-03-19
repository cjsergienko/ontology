'use client'

import { useRef, useEffect, useState } from 'react'
import { CapabilityTiles } from './CapabilityTiles'

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill="#6366f1"/>
        <circle cx="4" cy="5" r="2" fill="#6366f1" opacity="0.6"/>
        <circle cx="20" cy="5" r="2" fill="#6366f1" opacity="0.6"/>
        <circle cx="4" cy="19" r="2" fill="#6366f1" opacity="0.6"/>
        <circle cx="20" cy="19" r="2" fill="#6366f1" opacity="0.6"/>
        <line x1="12" y1="12" x2="4" y2="5" stroke="#6366f1" strokeWidth="1.5" opacity="0.5"/>
        <line x1="12" y1="12" x2="20" y2="5" stroke="#6366f1" strokeWidth="1.5" opacity="0.5"/>
        <line x1="12" y1="12" x2="4" y2="19" stroke="#6366f1" strokeWidth="1.5" opacity="0.5"/>
        <line x1="12" y1="12" x2="20" y2="19" stroke="#6366f1" strokeWidth="1.5" opacity="0.5"/>
      </svg>
    ),
    title: 'Visual Graph Editor',
    desc: 'Drag-and-drop canvas powered by React Flow. Connect nodes, define edges, and see your ontology come alive in real time.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#f59e0b" opacity="0.8"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#f59e0b" opacity="0.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#f59e0b" opacity="0.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#f59e0b" opacity="0.3"/>
        <line x1="6.5" y1="10" x2="6.5" y2="14" stroke="#f59e0b" strokeWidth="1.5"/>
        <line x1="17.5" y1="10" x2="17.5" y2="14" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6"/>
        <line x1="10" y1="6.5" x2="14" y2="6.5" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6"/>
      </svg>
    ),
    title: 'Taxonomy Management',
    desc: 'Structure complex domains with classes, properties, values, dimensions, and constraints. Six node types, seven edge types.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 10h10M4 14h12M4 18h8" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="19" cy="17" r="3" fill="#10b981" opacity="0.2" stroke="#10b981" strokeWidth="1.5"/>
        <path d="M17.5 17l1 1 2-2" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'YAML / JSON Export',
    desc: 'Export your ontology as structured YAML or JSON — ready to plug into LangGraph agent pipelines, RAG systems, or LLM routers.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L3 9v12h6v-6h6v6h6V9L12 3z" fill="#8b5cf6" opacity="0.15" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M9 21v-6h6v6" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Multi-Domain Support',
    desc: 'Hiring, finance, healthcare, legal, product — any domain. Tag ontologies, filter by domain, and manage them from a single dashboard.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M12 5l7 7-7 7" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="5" cy="12" r="2" fill="#06b6d4" opacity="0.6"/>
      </svg>
    ),
    title: 'Import & Parse',
    desc: 'Upload existing YAML or JSON ontologies. Automatic node positioning, edge inference, and domain detection from file structure.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#ef4444" opacity="0.15" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      </svg>
    ),
    title: 'AI Pipeline Ready',
    desc: 'Designed as the structural backbone for agent clusters. Router → Cluster agents → Combiner → Scorer. Your ontology drives every step.',
  },
]

const PRICING = [
  {
    name: 'Free',
    price: '€0',
    period: '',
    tagline: 'Try the builder, no card needed',
    highlighted: false,
    cta: 'Get started free',
    ctaHref: '/login',
    planKey: null as string | null,
    features: [
      '2 ontologies',
      '50 nodes per ontology',
      'Visual graph editor',
      'JSON export',
      'Demo ontology access',
    ],
  },
  {
    name: 'Starter',
    price: '€29',
    period: '/month',
    tagline: 'For individuals building structured domains',
    highlighted: false,
    cta: 'Start with Starter',
    ctaHref: '/login',
    planKey: 'starter',
    features: [
      '10 ontologies',
      '500 nodes per ontology',
      '10 AI-assisted imports/month',
      'Visual graph editor',
      'JSON + YAML export',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '€149',
    period: '/month',
    tagline: 'For AI engineers & knowledge teams',
    highlighted: true,
    badge: 'Most Popular',
    cta: 'Start with Pro',
    ctaHref: '/login',
    planKey: 'pro',
    features: [
      'Unlimited ontologies',
      'Unlimited nodes',
      '100 AI imports + 20 analyses/month',
      'JSON + YAML export',
      'API access',
      'Priority support',
    ],
  },
  {
    name: 'Business',
    price: '€499',
    period: '/month',
    tagline: 'For teams with unlimited AI pipeline usage',
    highlighted: false,
    cta: 'Contact us',
    ctaHref: 'mailto:contact@ontology.live',
    planKey: null,
    features: [
      'Unlimited ontologies',
      'Unlimited nodes',
      'Unlimited AI imports & analyses',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
  },
]


// Animated hero graph
function HeroGraph() {
  return (
    <svg width="520" height="400" viewBox="0 0 520 400" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: '100%', height: 'auto' }}>
      <style>{`
        @keyframes nodePulse {
          0%, 100% { opacity: 0.7; r: 8; }
          50% { opacity: 1; r: 10; }
        }
        @keyframes edgeDraw {
          from { stroke-dashoffset: 300; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 0.45; }
        }
        @keyframes labelFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .n1 { animation: nodePulse 3.2s ease-in-out infinite; }
        .n2 { animation: nodePulse 3.2s ease-in-out infinite 0.4s; }
        .n3 { animation: nodePulse 3.2s ease-in-out infinite 0.8s; }
        .n4 { animation: nodePulse 3.2s ease-in-out infinite 1.2s; }
        .n5 { animation: nodePulse 3.2s ease-in-out infinite 1.6s; }
        .n6 { animation: nodePulse 3.2s ease-in-out infinite 2.0s; }
        .n7 { animation: nodePulse 3.2s ease-in-out infinite 2.4s; }
        .n8 { animation: nodePulse 3.2s ease-in-out infinite 2.8s; }
        .e { stroke-dasharray: 300; animation: edgeDraw 1.4s ease forwards; }
        .e1 { animation-delay: 0.1s; }
        .e2 { animation-delay: 0.3s; }
        .e3 { animation-delay: 0.5s; }
        .e4 { animation-delay: 0.7s; }
        .e5 { animation-delay: 0.9s; }
        .e6 { animation-delay: 1.1s; }
        .e7 { animation-delay: 1.3s; }
        .lbl { animation: labelFade 0.6s ease forwards; }
        .lbl1 { animation-delay: 0.8s; opacity: 0; }
        .lbl2 { animation-delay: 1.0s; opacity: 0; }
        .lbl3 { animation-delay: 1.2s; opacity: 0; }
        .lbl4 { animation-delay: 1.4s; opacity: 0; }
        .lbl5 { animation-delay: 1.6s; opacity: 0; }
        .lbl6 { animation-delay: 1.8s; opacity: 0; }
        .lbl7 { animation-delay: 2.0s; opacity: 0; }
        .lbl8 { animation-delay: 2.2s; opacity: 0; }
      `}</style>

      {/* Glow halos */}
      <circle cx="260" cy="180" r="60" fill="rgba(99,102,241,0.06)"/>
      <circle cx="260" cy="180" r="100" fill="rgba(99,102,241,0.03)"/>

      {/* Edges */}
      <line className="e e1" x1="260" y1="180" x2="130" y2="80" stroke="#6366f1" strokeWidth="1.5"/>
      <line className="e e2" x1="260" y1="180" x2="390" y2="80" stroke="#6366f1" strokeWidth="1.5"/>
      <line className="e e3" x1="260" y1="180" x2="90" y2="210" stroke="#6366f1" strokeWidth="1.5"/>
      <line className="e e4" x1="260" y1="180" x2="430" y2="210" stroke="#6366f1" strokeWidth="1.5"/>
      <line className="e e5" x1="260" y1="180" x2="200" y2="320" stroke="#f59e0b" strokeWidth="1.5"/>
      <line className="e e6" x1="260" y1="180" x2="320" y2="320" stroke="#f59e0b" strokeWidth="1.5"/>
      <line className="e e7" x1="130" y1="80" x2="390" y2="80" stroke="#6366f1" strokeWidth="1" opacity="0.25"/>

      {/* Satellite edges */}
      <line className="e e3" x1="90" y1="210" x2="50" y2="310" stroke="#10b981" strokeWidth="1.2" opacity="0.5"/>
      <line className="e e4" x1="430" y1="210" x2="470" y2="310" stroke="#10b981" strokeWidth="1.2" opacity="0.5"/>

      {/* Satellite far nodes */}
      <circle className="n7" cx="50" cy="310" r="6" fill="#10b981"/>
      <circle cx="50" cy="310" r="14" fill="rgba(16,185,129,0.12)"/>
      <circle className="n8" cx="470" cy="310" r="6" fill="#10b981"/>
      <circle cx="470" cy="310" r="14" fill="rgba(16,185,129,0.12)"/>

      {/* Node halos */}
      <circle cx="260" cy="180" r="22" fill="rgba(99,102,241,0.15)"/>
      <circle cx="130" cy="80" r="16" fill="rgba(99,102,241,0.1)"/>
      <circle cx="390" cy="80" r="16" fill="rgba(99,102,241,0.1)"/>
      <circle cx="90" cy="210" r="16" fill="rgba(245,158,11,0.1)"/>
      <circle cx="430" cy="210" r="16" fill="rgba(245,158,11,0.1)"/>
      <circle cx="200" cy="320" r="14" fill="rgba(139,92,246,0.1)"/>
      <circle cx="320" cy="320" r="14" fill="rgba(139,92,246,0.1)"/>

      {/* Nodes */}
      <circle className="n1" cx="260" cy="180" r="10" fill="#6366f1"/>
      <circle className="n2" cx="130" cy="80" r="8" fill="#818cf8"/>
      <circle className="n3" cx="390" cy="80" r="8" fill="#818cf8"/>
      <circle className="n4" cx="90" cy="210" r="8" fill="#f59e0b"/>
      <circle className="n5" cx="430" cy="210" r="8" fill="#f59e0b"/>
      <circle className="n6" cx="200" cy="320" r="7" fill="#8b5cf6"/>
      <circle className="n6" cx="320" cy="320" r="7" fill="#8b5cf6"/>

      {/* Labels */}
      <text className="lbl lbl1" x="260" y="160" textAnchor="middle" fontSize="12" fill="#f1f5f9" fontFamily="JetBrains Mono, monospace" fontWeight="600">JobDescription</text>
      <text className="lbl lbl2" x="130" y="60" textAnchor="middle" fontSize="11" fill="#a5b4fc" fontFamily="JetBrains Mono, monospace">Role</text>
      <text className="lbl lbl3" x="390" y="60" textAnchor="middle" fontSize="11" fill="#a5b4fc" fontFamily="JetBrains Mono, monospace">Skills</text>
      <text className="lbl lbl4" x="90" y="236" textAnchor="middle" fontSize="11" fill="#fcd34d" fontFamily="JetBrains Mono, monospace">Seniority</text>
      <text className="lbl lbl5" x="430" y="236" textAnchor="middle" fontSize="11" fill="#fcd34d" fontFamily="JetBrains Mono, monospace">Domain</text>
      <text className="lbl lbl6" x="200" y="348" textAnchor="middle" fontSize="11" fill="#c4b5fd" fontFamily="JetBrains Mono, monospace">Senior</text>
      <text className="lbl lbl7" x="320" y="348" textAnchor="middle" fontSize="11" fill="#c4b5fd" fontFamily="JetBrains Mono, monospace">hiring</text>
      <text className="lbl lbl8" x="50" y="332" textAnchor="middle" fontSize="10" fill="#6ee7b7" fontFamily="JetBrains Mono, monospace">is_a</text>
    </svg>
  )
}

export function LandingPage() {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  async function handleCheckout(planKey: string) {
    setCheckoutLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      if (res.status === 401) {
        window.location.href = '/login'
        return
      }
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setCheckoutLoading(null)
    }
  }

  return (
    <div className="landing-page" style={{
      background: '#070b14',
      color: '#f1f5f9',
      fontFamily: "'JetBrains Mono', monospace",
      overflowX: 'hidden',
    }}>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* background mesh */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 60% 40%, rgba(99,102,241,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(245,158,11,0.06) 0%, transparent 60%),
            linear-gradient(180deg, #070b14 0%, #09101f 100%)
          `,
        }}/>
        {/* grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}/>

        <div style={{
          maxWidth: 1200, width: '100%', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Left: Copy */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 9999,
              padding: '6px 14px',
              marginBottom: 28,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }}/>
              <span style={{ fontSize: 11, color: '#a5b4fc', letterSpacing: '0.1em' }}>
                ONTOLOGY BUILDER
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(36px, 4vw, 56px)',
              lineHeight: 1.1,
              color: '#f1f5f9',
              margin: '0 0 20px 0',
              letterSpacing: '-0.02em',
            }}>
              Build the Structural<br/>
              <span style={{ color: '#6366f1' }}>Backbone</span> of AI
            </h1>

            <p style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: '#94a3b8',
              margin: '0 0 40px 0',
              maxWidth: 460,
            }}>
              Design ontologies, taxonomies, and knowledge graphs visually.
              Export to YAML or JSON and feed them directly into LLM agent
              pipelines, RAG systems, and domain classifiers.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a
                href="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 28px',
                  borderRadius: 9999,
                  background: '#6366f1',
                  color: '#fff',
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'background 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#4f46e5'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#6366f1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Launch App
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="#pricing"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 28px',
                  borderRadius: 9999,
                  background: 'transparent',
                  border: '1px solid rgba(99,102,241,0.35)',
                  color: '#a5b4fc',
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)'
                  e.currentTarget.style.color = '#c7d2fe'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'
                  e.currentTarget.style.color = '#a5b4fc'
                }}
              >
                See Pricing
              </a>
            </div>

            {/* Stats strip */}
            <div style={{
              display: 'flex', gap: 32, marginTop: 52,
              paddingTop: 32,
              borderTop: '1px solid rgba(99,102,241,0.12)',
            }}>
              {[
                { val: '6', label: 'Node types' },
                { val: '7', label: 'Edge types' },
                { val: 'YAML', label: 'Native export' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: 24,
                    color: '#f1f5f9',
                    letterSpacing: '-0.02em',
                  }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Graph visualization */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              background: 'rgba(13,18,36,0.8)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 20,
              padding: '32px',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 200, height: 200,
                background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}/>
              <div style={{
                fontSize: 13, color: '#94a3b8', letterSpacing: '0.05em',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}/>
                jd-ontology.yaml — 63 nodes · 63 edges
              </div>
              <HeroGraph />
            </div>
          </div>
        </div>
      </section>

      {/* ── DOMAIN STRIP ─────────────────────────────────────────── */}
      <section style={{
        borderTop: '1px solid rgba(99,102,241,0.08)',
        borderBottom: '1px solid rgba(99,102,241,0.08)',
        padding: '24px 40px',
        background: 'rgba(13,18,36,0.5)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 11, color: '#475569', letterSpacing: '0.1em' }}>POWERING DOMAINS:</span>
          {['Hiring', 'Finance', 'Healthcare', 'Legal', 'Product', 'Education', 'Compliance', 'Email'].map(d => (
            <span key={d} style={{
              fontSize: 12, color: '#64748b',
              padding: '4px 12px',
              border: '1px solid rgba(99,102,241,0.1)',
              borderRadius: 9999,
              background: 'rgba(99,102,241,0.05)',
            }}>{d}</span>
          ))}
        </div>
      </section>

      {/* ── FOUR WAYS TO WORK ────────────────────────────────────── */}
      <section style={{
        padding: '80px 40px 70px',
        borderTop: '1px solid rgba(99,102,241,0.08)',
        background: 'rgba(8,11,22,0.6)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{
              display: 'inline-block',
              fontSize: 11, color: '#6366f1', letterSpacing: '0.15em',
              marginBottom: 16, textTransform: 'uppercase' as const,
            }}>
              Four ways to work
            </div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(24px, 2.8vw, 36px)',
              color: '#f1f5f9',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              Every path leads to a<br/>
              <span style={{ color: '#6366f1' }}>precise ontology</span>
            </h2>
          </div>
          <CapabilityTiles />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{
              display: 'inline-block',
              fontSize: 11, color: '#6366f1', letterSpacing: '0.15em',
              marginBottom: 16, textTransform: 'uppercase',
            }}>Capabilities</div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: 'clamp(28px, 3vw, 40px)',
              color: '#f1f5f9', margin: 0, letterSpacing: '-0.02em',
            }}>
              Everything you need to design<br/>
              <span style={{ color: '#6366f1' }}>precision ontologies</span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: '#0d1224',
                  border: '1px solid rgba(99,102,241,0.1)',
                  borderRadius: 16,
                  padding: '28px',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.1)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700, fontSize: 16,
                  color: '#f1f5f9', margin: '0 0 10px 0',
                }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" style={{
        padding: '100px 40px',
        background: 'rgba(9,13,28,0.8)',
        borderTop: '1px solid rgba(99,102,241,0.08)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{
              display: 'inline-block',
              fontSize: 11, color: '#f59e0b', letterSpacing: '0.15em',
              marginBottom: 16, textTransform: 'uppercase',
            }}>Pricing</div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: 'clamp(28px, 3vw, 40px)',
              color: '#f1f5f9', margin: '0 0 16px 0', letterSpacing: '-0.02em',
            }}>
              Start building today
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
              From solo ontology designers to enterprise AI platform teams
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
            alignItems: 'stretch',
          }}>
            {/* Standard plans */}
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: plan.highlighted ? '#0a0e1e' : '#0d1224',
                  border: plan.highlighted
                    ? '2px solid #6366f1'
                    : '1px solid rgba(99,102,241,0.12)',
                  borderRadius: 16,
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  position: 'relative',
                  transform: plan.highlighted ? 'scale(1.03)' : 'none',
                  boxShadow: plan.highlighted
                    ? '0 0 40px rgba(99,102,241,0.15)'
                    : 'none',
                  overflow: 'hidden',
                }}
              >
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                    padding: '7px',
                    textAlign: 'center',
                    fontSize: 10,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '0.1em',
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{ paddingTop: plan.highlighted ? 24 : 0 }}>
                  <div style={{
                    fontSize: 11, color: plan.highlighted ? '#a5b4fc' : '#475569',
                    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8,
                  }}>
                    {plan.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 800,
                      fontSize: 32,
                      color: plan.highlighted ? '#f1f5f9' : '#e2e8f0',
                      letterSpacing: '-0.02em',
                    }}>{plan.price}</span>
                    {plan.period && (
                      <span style={{ fontSize: 13, color: '#475569' }}>{plan.period}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
                    {plan.tagline}
                  </div>
                </div>

                <div style={{
                  height: 1,
                  background: plan.highlighted
                    ? 'rgba(99,102,241,0.3)'
                    : 'rgba(99,102,241,0.08)',
                }}/>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: plan.highlighted
                          ? 'rgba(99,102,241,0.2)'
                          : 'rgba(99,102,241,0.08)',
                        border: `1px solid ${plan.highlighted ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <path d="M1.5 4.5l2.5 2.5 3.5-4" stroke={plan.highlighted ? '#818cf8' : '#6366f1'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span style={{
                        fontSize: 13,
                        color: plan.highlighted ? '#cbd5e1' : '#64748b',
                      }}>{f}</span>
                    </div>
                  ))}
                </div>

                {plan.planKey ? (
                  <button
                    onClick={() => handleCheckout(plan.planKey!)}
                    disabled={checkoutLoading === plan.planKey}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                      padding: '13px 0',
                      borderRadius: 9999,
                      background: plan.highlighted ? '#6366f1' : 'transparent',
                      border: plan.highlighted ? 'none' : '1px solid rgba(99,102,241,0.3)',
                      color: plan.highlighted ? '#fff' : '#818cf8',
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      transition: 'all 0.2s',
                      opacity: checkoutLoading === plan.planKey ? 0.6 : 1,
                    }}
                    onMouseEnter={e => {
                      if (checkoutLoading) return
                      if (plan.highlighted) {
                        e.currentTarget.style.background = '#4f46e5'
                      } else {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'
                        e.currentTarget.style.color = '#a5b4fc'
                      }
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={e => {
                      if (plan.highlighted) {
                        e.currentTarget.style.background = '#6366f1'
                      } else {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
                        e.currentTarget.style.color = '#818cf8'
                      }
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {checkoutLoading === plan.planKey ? 'Redirecting…' : plan.cta}
                  </button>
                ) : (
                  <a
                    href={plan.ctaHref}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '13px 0',
                      borderRadius: 9999,
                      background: plan.highlighted ? '#6366f1' : 'transparent',
                      border: plan.highlighted ? 'none' : '1px solid rgba(99,102,241,0.3)',
                      color: plan.highlighted ? '#fff' : '#818cf8',
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (plan.highlighted) {
                        e.currentTarget.style.background = '#4f46e5'
                      } else {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'
                        e.currentTarget.style.color = '#a5b4fc'
                      }
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={e => {
                      if (plan.highlighted) {
                        e.currentTarget.style.background = '#6366f1'
                      } else {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
                        e.currentTarget.style.color = '#818cf8'
                      }
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {plan.cta}
                  </a>
                )}
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ── PLAN COMPARISON TABLE ────────────────────────────────── */}
      <section style={{ padding: '60px 40px 100px', background: '#070b14' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h3 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: 20,
            color: '#f1f5f9', margin: '0 0 32px 0', textAlign: 'center',
          }}>
            Plan comparison
          </h3>
          <div style={{
            background: '#0d1224',
            border: '1px solid rgba(99,102,241,0.1)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
                  <th style={{ textAlign: 'left', padding: '18px 24px', color: '#475569', fontWeight: 500 }}>Feature</th>
                  {['Free', 'Starter', 'Pro', 'Business'].map(p => (
                    <th key={p} style={{
                      padding: '18px 24px', color: p === 'Pro' ? '#a5b4fc' : '#64748b',
                      fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
                      textAlign: 'center',
                    }}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Ontologies', '2', '10', 'Unlimited', 'Unlimited'],
                  ['Nodes per ontology', '50', '500', 'Unlimited', 'Unlimited'],
                  ['AI imports/month', '—', '10', '100', 'Unlimited'],
                  ['AI analyses/month', '—', '—', '20', 'Unlimited'],
                  ['YAML export', '—', '✓', '✓', '✓'],
                  ['API access', '—', '—', '✓', '✓'],
                ].map(([label, ...vals], i) => (
                  <tr key={label} style={{
                    borderBottom: '1px solid rgba(99,102,241,0.06)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(99,102,241,0.02)',
                  }}>
                    <td style={{ padding: '14px 24px', color: '#94a3b8' }}>{label}</td>
                    {vals.map((v, vi) => (
                      <td key={vi} style={{
                        padding: '14px 24px',
                        textAlign: 'center',
                        color: v === '✓' ? '#6366f1' : v === '—' ? '#1e293b' : '#cbd5e1',
                        fontWeight: v === '✓' ? 600 : 400,
                        fontSize: v === '✓' ? 16 : 13,
                      }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────── */}
      <section style={{
        padding: '100px 40px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
        borderTop: '1px solid rgba(99,102,241,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800, fontSize: 'clamp(28px, 3vw, 40px)',
            color: '#f1f5f9', margin: '0 0 16px 0', letterSpacing: '-0.02em',
          }}>
            Start designing your ontology today
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 40px 0', lineHeight: 1.7 }}>
            Visual graph editor · YAML export · AI pipeline ready
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '16px 36px',
              borderRadius: 9999,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.9'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Launch Ontology Builder
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>
    </div>
  )
}
