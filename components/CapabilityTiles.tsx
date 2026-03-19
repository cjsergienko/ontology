'use client'

import React from 'react'

// ── Illustrations ────────────────────────────────────────────────────────────

function UploadOntologyIllust() {
  return (
    <svg width="120" height="76" viewBox="0 0 120 76" fill="none">
      {/* Source file */}
      <rect x="6" y="8" width="30" height="42" rx="3" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="1.2"/>
      {/* Dog-ear */}
      <path d="M30 8 L36 14 L30 14 Z" fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="0.8"/>
      {/* File lines */}
      <line x1="11" y1="20" x2="29" y2="20" stroke="#6366f1" strokeWidth="0.9" opacity="0.7"/>
      <line x1="11" y1="25" x2="29" y2="25" stroke="#6366f1" strokeWidth="0.9" opacity="0.5"/>
      <line x1="11" y1="30" x2="23" y2="30" stroke="#6366f1" strokeWidth="0.9" opacity="0.4"/>
      <line x1="11" y1="35" x2="27" y2="35" stroke="#6366f1" strokeWidth="0.9" opacity="0.35"/>
      {/* Code hint */}
      <text x="11" y="45" fontSize="7" fill="#818cf8" fontFamily="monospace">{'{ yaml }'}</text>
      {/* Upload particles */}
      <circle cx="50" cy="30" r="1.5" fill="#6366f1" opacity="0.5"/>
      <circle cx="46" cy="22" r="1" fill="#6366f1" opacity="0.35"/>
      <circle cx="53" cy="20" r="1" fill="#6366f1" opacity="0.4"/>
      {/* Arrow */}
      <path d="M42 38 L56 38" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M52 34 L56 38 L52 42" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Graph center + glow */}
      <circle cx="76" cy="38" r="14" fill="rgba(99,102,241,0.08)"/>
      <circle cx="76" cy="38" r="7" fill="#6366f1"/>
      {/* Satellites */}
      <circle cx="98" cy="22" r="5" fill="#818cf8"/>
      <circle cx="98" cy="22" r="9" fill="rgba(99,102,241,0.08)"/>
      <circle cx="110" cy="50" r="4.5" fill="#818cf8"/>
      <circle cx="96" cy="60" r="4" fill="#a5b4fc"/>
      {/* Edges */}
      <line x1="76" y1="38" x2="98" y2="22" stroke="#6366f1" strokeWidth="1.3" opacity="0.8"/>
      <line x1="76" y1="38" x2="110" y2="50" stroke="#6366f1" strokeWidth="1.3" opacity="0.7"/>
      <line x1="76" y1="38" x2="96" y2="60" stroke="#6366f1" strokeWidth="1.3" opacity="0.55"/>
      <line x1="98" y1="22" x2="110" y2="50" stroke="#6366f1" strokeWidth="0.8" opacity="0.3"/>
    </svg>
  )
}

function UploadExamplesIllust() {
  return (
    <svg width="120" height="76" viewBox="0 0 120 76" fill="none">
      {/* Three stacked docs */}
      <rect x="2" y="28" width="24" height="30" rx="2.5" fill="rgba(6,182,212,0.06)" stroke="#06b6d4" strokeWidth="1" opacity="0.4"/>
      <rect x="6" y="17" width="24" height="30" rx="2.5" fill="rgba(6,182,212,0.09)" stroke="#06b6d4" strokeWidth="1" opacity="0.65"/>
      <rect x="10" y="6" width="24" height="30" rx="2.5" fill="rgba(6,182,212,0.13)" stroke="#06b6d4" strokeWidth="1.2"/>
      {/* Lines on top doc */}
      <line x1="14" y1="13" x2="30" y2="13" stroke="#06b6d4" strokeWidth="0.8" opacity="0.7"/>
      <line x1="14" y1="17" x2="30" y2="17" stroke="#06b6d4" strokeWidth="0.8" opacity="0.5"/>
      <line x1="14" y1="21" x2="23" y2="21" stroke="#06b6d4" strokeWidth="0.8" opacity="0.4"/>
      <line x1="14" y1="25" x2="28" y2="25" stroke="#06b6d4" strokeWidth="0.8" opacity="0.35"/>
      {/* Arrow 1 */}
      <path d="M40 38 L51 38" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M47 34 L51 38 L47 42" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* AI processor (dashed circle) */}
      <circle cx="64" cy="38" r="11" fill="rgba(6,182,212,0.1)" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="3.5 2"/>
      {/* Neural mini-net inside */}
      <circle cx="60" cy="35" r="1.8" fill="#06b6d4" opacity="0.9"/>
      <circle cx="68" cy="35" r="1.8" fill="#06b6d4" opacity="0.9"/>
      <circle cx="64" cy="43" r="1.8" fill="#06b6d4" opacity="0.9"/>
      <line x1="60" y1="35" x2="68" y2="35" stroke="#06b6d4" strokeWidth="0.9" opacity="0.5"/>
      <line x1="60" y1="35" x2="64" y2="43" stroke="#06b6d4" strokeWidth="0.9" opacity="0.5"/>
      <line x1="68" y1="35" x2="64" y2="43" stroke="#06b6d4" strokeWidth="0.9" opacity="0.5"/>
      {/* Arrow 2 */}
      <path d="M76 38 L86 38" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M82 34 L86 38 L82 42" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Emerging graph */}
      <circle cx="100" cy="38" r="6" fill="#06b6d4"/>
      <circle cx="100" cy="38" r="11" fill="rgba(6,182,212,0.1)"/>
      <circle cx="113" cy="25" r="4.5" fill="#67e8f9"/>
      <circle cx="116" cy="52" r="4" fill="#67e8f9"/>
      <line x1="100" y1="38" x2="113" y2="25" stroke="#06b6d4" strokeWidth="1.3" opacity="0.8"/>
      <line x1="100" y1="38" x2="116" y2="52" stroke="#06b6d4" strokeWidth="1.3" opacity="0.8"/>
      <line x1="113" y1="25" x2="116" y2="52" stroke="#06b6d4" strokeWidth="0.8" opacity="0.35"/>
    </svg>
  )
}

function BuildManuallyIllust() {
  const dots = [
    { x: 14, y: 8 }, { x: 32, y: 8 }, { x: 50, y: 8 }, { x: 68, y: 8 }, { x: 86, y: 8 }, { x: 104, y: 8 },
    { x: 14, y: 26 }, { x: 32, y: 26 }, { x: 50, y: 26 }, { x: 68, y: 26 }, { x: 86, y: 26 }, { x: 104, y: 26 },
    { x: 14, y: 44 }, { x: 32, y: 44 }, { x: 50, y: 44 }, { x: 68, y: 44 }, { x: 86, y: 44 }, { x: 104, y: 44 },
    { x: 14, y: 62 }, { x: 32, y: 62 }, { x: 50, y: 62 }, { x: 68, y: 62 }, { x: 86, y: 62 }, { x: 104, y: 62 },
  ]
  return (
    <svg width="120" height="76" viewBox="0 0 120 76" fill="none">
      {/* Grid dots */}
      {dots.map(({ x, y }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="rgba(245,158,11,0.15)" />
      ))}
      {/* Node A — anchor */}
      <circle cx="28" cy="30" r="14" fill="rgba(245,158,11,0.1)"/>
      <circle cx="28" cy="30" r="8" fill="#f59e0b"/>
      <text x="28" y="34" textAnchor="middle" fontSize="7" fill="#0f172a" fontFamily="monospace" fontWeight="bold">A</text>
      {/* Node B */}
      <circle cx="68" cy="20" r="11" fill="rgba(245,158,11,0.08)"/>
      <circle cx="68" cy="20" r="6.5" fill="#fbbf24"/>
      <text x="68" y="24" textAnchor="middle" fontSize="6.5" fill="#0f172a" fontFamily="monospace" fontWeight="bold">B</text>
      {/* Node C */}
      <circle cx="46" cy="60" r="11" fill="rgba(245,158,11,0.07)"/>
      <circle cx="46" cy="60" r="6.5" fill="#fbbf24"/>
      <text x="46" y="64" textAnchor="middle" fontSize="6.5" fill="#0f172a" fontFamily="monospace" fontWeight="bold">C</text>
      {/* Solid edges */}
      <line x1="28" y1="30" x2="68" y2="20" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8"/>
      <line x1="28" y1="30" x2="46" y2="60" stroke="#f59e0b" strokeWidth="1.5" opacity="0.7"/>
      {/* Edge label */}
      <text x="47" y="22" textAnchor="middle" fontSize="7" fill="#f59e0b" opacity="0.65" fontFamily="monospace">is_a</text>
      {/* Dashed line — edge being drawn */}
      <line x1="68" y1="20" x2="99" y2="53" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.75"/>
      {/* New node — ghost outline */}
      <circle cx="102" cy="56" r="5.5" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Cursor */}
      <path d="M85 36 L80 54 L84.5 51 L87.5 58 L90 57 L87 50 L93 50 Z" fill="#f59e0b" opacity="0.88"/>
    </svg>
  )
}

function RunPromptsIllust() {
  return (
    <svg width="120" height="76" viewBox="0 0 120 76" fill="none">
      {/* Prompt bubble */}
      <rect x="2" y="6" width="38" height="30" rx="4" fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" strokeWidth="1.2"/>
      {/* Bubble tail */}
      <path d="M8 36 L6 46 L18 38" fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" strokeWidth="1" strokeLinejoin="round"/>
      {/* Prompt text lines */}
      <line x1="7" y1="14" x2="34" y2="14" stroke="#8b5cf6" strokeWidth="0.9" opacity="0.8"/>
      <line x1="7" y1="19" x2="34" y2="19" stroke="#8b5cf6" strokeWidth="0.9" opacity="0.6"/>
      <line x1="7" y1="24" x2="22" y2="24" stroke="#8b5cf6" strokeWidth="0.9" opacity="0.5"/>
      {/* Cursor blink */}
      <rect x="23" y="21" width="1.2" height="6" rx="0.5" fill="#8b5cf6" opacity="0.9"/>
      {/* Arrow */}
      <path d="M46 38 L54 38" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M50 34 L54 38 L50 42" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Graph — center node */}
      <circle cx="65" cy="38" r="13" fill="rgba(139,92,246,0.1)"/>
      <circle cx="65" cy="38" r="7" fill="#8b5cf6"/>
      {/* Highlighted path node */}
      <circle cx="82" cy="24" r="9" fill="rgba(139,92,246,0.1)"/>
      <circle cx="82" cy="24" r="5.5" fill="#a78bfa"/>
      {/* Dim node */}
      <circle cx="80" cy="54" r="4.5" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="1" opacity="0.5"/>
      {/* Highlighted edge */}
      <line x1="65" y1="38" x2="82" y2="24" stroke="#c4b5fd" strokeWidth="2.5" opacity="0.95"/>
      {/* Dim edge */}
      <line x1="65" y1="38" x2="80" y2="54" stroke="#8b5cf6" strokeWidth="1" opacity="0.25"/>
      {/* Score / metrics panel */}
      <rect x="94" y="12" width="24" height="50" rx="3.5" fill="rgba(139,92,246,0.07)" stroke="#8b5cf6" strokeWidth="1" opacity="0.65"/>
      <text x="106" y="20" textAnchor="middle" fontSize="5.5" fill="#8b5cf6" fontFamily="monospace" opacity="0.8">score</text>
      {/* Bars */}
      <rect x="97" y="42" width="5.5" height="14" rx="1.5" fill="rgba(139,92,246,0.45)"/>
      <rect x="104.5" y="35" width="5.5" height="21" rx="1.5" fill="#8b5cf6" opacity="0.8"/>
      <rect x="112" y="29" width="4.5" height="27" rx="1.5" fill="#a78bfa" opacity="0.7"/>
      <line x1="96" y1="57" x2="117" y2="57" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.5"/>
      {/* Improving arrow */}
      <path d="M100 32 L106 27 L112 30" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  )
}

// ── Tile config ──────────────────────────────────────────────────────────────

interface TileConfig {
  id: string
  badge: string
  title: string
  desc: string
  color: string
  bg: string
  border: string
  borderHover: string
  illustration: React.ReactNode
  action: string | null
}

const TILES: TileConfig[] = [
  {
    id: 'import',
    badge: 'Import',
    title: 'Upload Ontology',
    desc: 'Import an existing YAML or JSON ontology and watch it transform into an interactive knowledge graph on the visual canvas.',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.05)',
    border: 'rgba(99,102,241,0.15)',
    borderHover: 'rgba(99,102,241,0.45)',
    illustration: <UploadOntologyIllust />,
    action: 'import',
  },
  {
    id: 'discover',
    badge: 'Discover',
    title: 'Learn from Documents',
    desc: 'Upload a batch of real documents — the AI identifies recurring entities, maps their structure, and assembles an ontology automatically.',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.05)',
    border: 'rgba(6,182,212,0.15)',
    borderHover: 'rgba(6,182,212,0.45)',
    illustration: <UploadExamplesIllust />,
    action: 'upload',
  },
  {
    id: 'build',
    badge: 'Design',
    title: 'Build Visually',
    desc: 'Create ontologies of any complexity with an intuitive drag-and-drop canvas. Connect nodes, define edge types, and add constraints — no code.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.15)',
    borderHover: 'rgba(245,158,11,0.45)',
    illustration: <BuildManuallyIllust />,
    action: 'create',
  },
  {
    id: 'run',
    badge: 'Evaluate',
    title: 'Run & Iterate',
    desc: 'Fire a prompt through your ontology, trace every routing decision in detail, and measure performance. Runs are saved — compare iterations and improve.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.05)',
    border: 'rgba(139,92,246,0.15)',
    borderHover: 'rgba(139,92,246,0.45)',
    illustration: <RunPromptsIllust />,
    action: 'create',
  },
]

// ── Component ────────────────────────────────────────────────────────────────

export function CapabilityTiles({ onAction }: { onAction?: (action: string) => void }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
    }}>
      {TILES.map(tile => {
        const clickable = !!onAction && !!tile.action
        return (
          <div
            key={tile.id}
            onClick={() => clickable && tile.action && onAction(tile.action)}
            style={{
              background: tile.bg,
              border: `1px solid ${tile.border}`,
              borderRadius: '14px',
              padding: '20px 20px 18px',
              cursor: clickable ? 'pointer' : 'default',
              transition: 'border-color 0.2s, transform 0.2s',
              position: 'relative',
              overflow: 'hidden',
              opacity: !tile.action && onAction ? 0.65 : 1,
            }}
            onMouseEnter={clickable ? e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = tile.borderHover
              el.style.transform = 'translateY(-3px)'
            } : undefined}
            onMouseLeave={clickable ? e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = tile.border
              el.style.transform = 'translateY(0)'
            } : undefined}
          >
            {/* Corner glow */}
            <div style={{
              position: 'absolute', top: -24, right: -24,
              width: 88, height: 88, borderRadius: '50%',
              background: `radial-gradient(circle, ${tile.color}20 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}/>

            {/* Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              {tile.illustration}
            </div>

            {/* Badge */}
            <div style={{ marginBottom: 8 }}>
              <span style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: tile.color,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: `${tile.color}18`,
                border: `1px solid ${tile.color}40`,
                borderRadius: 9999,
                padding: '2px 8px',
              }}>
                {tile.badge}
              </span>
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: '#f1f5f9',
              margin: '0 0 8px 0',
            }}>
              {tile.title}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: 12,
              color: '#64748b',
              lineHeight: 1.65,
              margin: 0,
            }}>
              {tile.desc}
            </p>

            {/* Action hint */}
            {clickable && (
              <div style={{
                marginTop: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: tile.color,
                opacity: 0.7,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                <span>Get started</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5h6M5 2l3 3-3 3" stroke={tile.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
