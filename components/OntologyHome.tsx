'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { NodeType } from '@/lib/types'
import type { OntologyListItem } from '@/lib/storage'
import { PlusIcon, BoxIcon, NetworkIcon, TrashIcon, ArrowRightIcon } from 'lucide-react'
import { UploadOntologyModal } from './UploadOntologyModal'
import { ImportOntologyModal } from './ImportOntologyModal'
import { CapabilityTiles } from './CapabilityTiles'

interface Props {
  initialOntologies: OntologyListItem[]
}

const DOMAIN_COLORS: Record<string, string> = {
  hiring: '#3b82f6',
  finance: '#10b981',
  healthcare: '#ef4444',
  product: '#8b5cf6',
  legal: '#f59e0b',
  education: '#06b6d4',
  default: '#64748b',
}

const NODE_COLORS: Record<NodeType, string> = {
  class: '#3b82f6',
  property: '#10b981',
  value: '#8b5cf6',
  dimension: '#f59e0b',
  relation: '#ef4444',
  constraint: '#64748b',
}

// ── Mini graph thumbnail ──────────────────────────────────────────────────────

function MiniGraph({
  thumbnail,
  thumbnailEdges,
}: {
  thumbnail: { type: NodeType; x: number; y: number }[]
  thumbnailEdges: [number, number][]
}) {
  const W = 72, H = 52, PAD = 5
  const W2 = W - PAD * 2
  const H2 = H - PAD * 2

  if (thumbnail.length === 0) {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect x="1" y="1" width={W - 2} height={H - 2} rx="5" fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.12)" strokeWidth="1"/>
        <circle cx={W / 2} cy={H / 2} r="4" fill="rgba(99,102,241,0.2)"/>
      </svg>
    )
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* Background */}
      <rect x="0" y="0" width={W} height={H} rx="6" fill="rgba(13,18,36,0.8)" stroke="rgba(99,102,241,0.15)" strokeWidth="1"/>
      {/* Edges */}
      {thumbnailEdges.map(([si, ti], i) => {
        const s = thumbnail[si], t = thumbnail[ti]
        if (!s || !t) return null
        return (
          <line
            key={i}
            x1={PAD + s.x * W2}
            y1={PAD + s.y * H2}
            x2={PAD + t.x * W2}
            y2={PAD + t.y * H2}
            stroke="rgba(148,163,184,0.15)"
            strokeWidth="0.7"
          />
        )
      })}
      {/* Nodes */}
      {thumbnail.map((n, i) => (
        <circle
          key={i}
          cx={PAD + n.x * W2}
          cy={PAD + n.y * H2}
          r="2"
          fill={NODE_COLORS[n.type] ?? '#64748b'}
          opacity="0.85"
        />
      ))}
    </svg>
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 52 }}>
      <span style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: 15,
        color: value > 0 ? color : 'var(--text-dim)',
        lineHeight: 1,
      }}>{value}</span>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2, letterSpacing: '0.05em' }}>{label}</span>
    </div>
  )
}

// ── Column header ─────────────────────────────────────────────────────────────

function ColHead({ label, right }: { label: string; right?: boolean }) {
  return (
    <div style={{
      fontSize: 10,
      color: 'var(--text-dim)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      textAlign: right ? 'right' : 'left',
    }}>
      {label}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OntologyHome({ initialOntologies }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [ontologies, setOntologies] = useState(initialOntologies)
  const [form, setForm] = useState({ name: '', description: '', domain: '' })
  const [deleting, setDeleting] = useState<string | null>(null)

  const modal = searchParams.get('modal')
  const creating = modal === 'create'
  const uploading = modal === 'upload'
  const importing = modal === 'import'

  function openModal(name: string) { router.push(`${pathname}?modal=${name}`) }
  function closeModal() { router.replace(pathname) }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    const res = await fetch('/api/ontologies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const created = await res.json()
    router.push(`/ontology/${created.id}`)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setDeleting(id)
    await fetch(`/api/ontologies/${id}`, { method: 'DELETE' })
    setOntologies(o => o.filter(x => x.id !== id))
    setDeleting(null)
  }

  const domainColor = (domain: string) =>
    DOMAIN_COLORS[domain.toLowerCase()] ?? DOMAIN_COLORS.default

  // Grid template for the list rows + header
  const COLS = '72px 1fr 96px 80px 80px 64px 64px 96px 36px'

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)' }} className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <NetworkIcon size={22} style={{ color: 'var(--accent)' }} />
            <div className="absolute inset-0 blur-sm animate-glow" style={{ color: 'var(--accent)' }}>
              <NetworkIcon size={22} />
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wide" style={{ color: 'var(--text)' }}>
              ONTOLOGY BUILDER
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              knowledge graph · taxonomy · ontology
            </p>
          </div>
        </div>
        <button
          onClick={() => openModal('create')}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all"
          style={{
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
        >
          <PlusIcon size={14} />
          New Ontology
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {/* Capability tiles */}
        <div style={{ marginBottom: 36 }}>
          <CapabilityTiles onAction={openModal} />
        </div>

        {ontologies.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div style={{ color: 'var(--text-dim)' }}>
              <BoxIcon size={48} />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-xl" style={{ color: 'var(--text-muted)' }}>
                No ontologies yet
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>
                Create your first knowledge structure
              </p>
            </div>
            <button
              onClick={() => openModal('create')}
              className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium"
              style={{ background: 'var(--accent)', color: '#000' }}
            >
              <PlusIcon size={14} />
              Create Ontology
            </button>
          </div>
        ) : (
          <div>
            {/* Count */}
            <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
              {ontologies.length} ontolog{ontologies.length === 1 ? 'y' : 'ies'}
            </p>

            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: COLS,
              gap: '0 16px',
              alignItems: 'center',
              padding: '0 16px 10px',
              borderBottom: '1px solid var(--border)',
              marginBottom: 4,
            }}>
              <div/>
              <ColHead label="Name" />
              <ColHead label="Domain" />
              <ColHead label="Dimensions" right />
              <ColHead label="Classes" right />
              <ColHead label="Nodes" right />
              <ColHead label="Edges" right />
              <ColHead label="Updated" right />
              <div/>
            </div>

            {/* Rows */}
            {ontologies.map(o => (
              <div
                key={o.id}
                onClick={() => router.push(`/ontology/${o.id}`)}
                className="group animate-fade-in"
                style={{
                  display: 'grid',
                  gridTemplateColumns: COLS,
                  gap: '0 16px',
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  borderRadius: 6,
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {/* Thumbnail */}
                <div style={{ flexShrink: 0 }}>
                  <MiniGraph thumbnail={o.thumbnail} thumbnailEdges={o.thumbnailEdges} />
                </div>

                {/* Name + description */}
                <div style={{ overflow: 'hidden' }}>
                  <div className="font-display font-semibold" style={{ fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {o.name}
                  </div>
                  {o.description && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.description}
                    </div>
                  )}
                </div>

                {/* Domain */}
                <div>
                  {o.domain ? (
                    <span style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 9999,
                      background: `${domainColor(o.domain)}18`,
                      color: domainColor(o.domain),
                      border: `1px solid ${domainColor(o.domain)}40`,
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {o.domain}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>—</span>
                  )}
                </div>

                {/* Dimensions */}
                <Stat value={o.dimensions} label="dims" color="#f59e0b" />

                {/* Classes */}
                <Stat value={o.classes} label="classes" color="#3b82f6" />

                {/* Nodes */}
                <Stat value={o.nodeCount} label="nodes" color="var(--text-muted)" />

                {/* Edges */}
                <Stat value={o.edgeCount} label="edges" color="var(--text-muted)" />

                {/* Updated */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    {new Date(o.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={e => handleDelete(o.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                    style={{ color: 'var(--text-dim)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                  >
                    {deleting === o.id ? '…' : <TrashIcon size={13} />}
                  </button>
                  <ArrowRightIcon
                    size={13}
                    className="opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: 'var(--accent)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Examples modal */}
      {uploading && <UploadOntologyModal onClose={closeModal} />}

      {/* Import Ontology modal */}
      {importing && <ImportOntologyModal onClose={closeModal} />}

      {/* Create modal */}
      {creating && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(15,23,42,0.5)' }}
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="rounded-xl p-8 w-full max-w-md animate-fade-in"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)' }}
          >
            <h2 className="font-display font-bold text-xl mb-6" style={{ color: 'var(--text)' }}>
              New Ontology
            </h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Name *</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Job Description Ontology"
                  className="w-full px-3 py-2.5 rounded text-sm outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
                />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Domain</label>
                <input
                  value={form.domain}
                  onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                  placeholder="e.g. hiring, finance, healthcare"
                  className="w-full px-3 py-2.5 rounded text-sm outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
                />
              </div>
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What does this ontology model?"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded text-sm outline-none resize-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded text-sm"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.name.trim()}
                  className="flex-1 py-2.5 rounded text-sm font-medium transition-opacity"
                  style={{ background: 'var(--accent)', color: '#000', opacity: form.name.trim() ? 1 : 0.4 }}
                >
                  Create →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
