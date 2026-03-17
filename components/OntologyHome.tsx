'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Ontology } from '@/lib/types'
import { PlusIcon, BoxIcon, NetworkIcon, TrashIcon, ArrowRightIcon, UploadIcon, FileJsonIcon } from 'lucide-react'
import { UploadOntologyModal } from './UploadOntologyModal'
import { ImportOntologyModal } from './ImportOntologyModal'

interface Props {
  initialOntologies: Omit<Ontology, 'nodes' | 'edges'>[]
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

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('import')}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
          >
            <FileJsonIcon size={14} />
            Upload Ontology
          </button>
          <button
            onClick={() => openModal('upload')}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
          >
            <UploadIcon size={14} />
            Upload Examples
          </button>
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
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-auto px-8 py-8">
        {ontologies.length === 0 && !creating ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
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
              style={{
                background: 'var(--accent)',
                color: '#000',
              }}
            >
              <PlusIcon size={14} />
              Create Ontology
            </button>
          </div>
        ) : (
          <>
            {ontologies.length > 0 && (
              <div>
                <p className="text-xs mb-6" style={{ color: 'var(--text-dim)' }}>
                  {ontologies.length} ontolog{ontologies.length === 1 ? 'y' : 'ies'}
                </p>
                <div className="grid grid-cols-1 gap-3 max-w-3xl" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  {ontologies.map(o => (
                    <div
                      key={o.id}
                      onClick={() => router.push(`/ontology/${o.id}`)}
                      className="group relative rounded-lg cursor-pointer transition-all animate-fade-in"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        padding: '20px',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                      }}
                    >
                      {/* Domain tag */}
                      {o.domain && (
                        <span
                          className="inline-block text-xs px-2 py-0.5 rounded-full mb-3"
                          style={{
                            background: `${domainColor(o.domain)}18`,
                            color: domainColor(o.domain),
                            border: `1px solid ${domainColor(o.domain)}40`,
                          }}
                        >
                          {o.domain}
                        </span>
                      )}

                      <h3 className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text)' }}>
                        {o.name}
                      </h3>
                      {o.description && (
                        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                          {o.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                          {new Date(o.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDelete(o.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                            style={{ color: 'var(--text-dim)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                          >
                            {deleting === o.id ? '...' : <TrashIcon size={13} />}
                          </button>
                          <ArrowRightIcon
                            size={14}
                            className="opacity-0 group-hover:opacity-100 transition-all"
                            style={{ color: 'var(--accent)' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
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
          style={{ background: 'rgba(8,12,20,0.85)' }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
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
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border2)',
                    color: 'var(--text)',
                  }}
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
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border2)',
                    color: 'var(--text)',
                  }}
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
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border2)',
                    color: 'var(--text)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => closeModal()}
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
