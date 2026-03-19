'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  XIcon, FileIcon, FileTextIcon, ImageIcon, AlertCircleIcon,
  PlusIcon, PencilIcon, UploadIcon, FilesIcon,
} from 'lucide-react'

interface Props {
  onClose: () => void
}

type Mode = 'build' | 'import' | 'analyze'

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function ElapsedTimer() {
  const [ms, setMs] = useState(0)
  const start = useRef(Date.now())
  useEffect(() => {
    start.current = Date.now()
    const id = setInterval(() => setMs(Date.now() - start.current), 200)
    return () => clearInterval(id)
  }, [])
  return <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>{(ms / 1000).toFixed(1)}s</span>
}

function FileTypeIcon({ mime }: { mime: string }) {
  if (mime.startsWith('image/')) return <ImageIcon size={13} style={{ color: '#8b5cf6' }} />
  if (mime === 'application/pdf') return <FileTextIcon size={13} style={{ color: '#ef4444' }} />
  return <FileIcon size={13} style={{ color: 'var(--accent)' }} />
}

const TABS: { id: Mode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'build',   label: 'Build Visually',        icon: <PencilIcon size={13} />,  desc: 'Start from a blank canvas' },
  { id: 'import',  label: 'Import File',            icon: <UploadIcon size={13} />,  desc: 'YAML · JSON · Markdown' },
  { id: 'analyze', label: 'Learn from Documents',   icon: <FilesIcon size={13} />,   desc: 'Upload multiple files' },
]

const MODAL_TO_MODE: Record<string, Mode> = {
  create: 'build',
  import: 'import',
  upload: 'analyze',
}
const MODE_TO_MODAL: Record<Mode, string> = {
  build: 'create',
  import: 'import',
  analyze: 'upload',
}

export function NewOntologyModal({ onClose }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mode: Mode = MODAL_TO_MODE[searchParams.get('modal') ?? ''] ?? 'build'

  function setMode(m: Mode) {
    router.push(`${pathname}?modal=${MODE_TO_MODAL[m]}`)
  }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Build mode
  const [form, setForm] = useState({ name: '', description: '', domain: '' })

  // Import mode
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importDragging, setImportDragging] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  // Analyze mode
  const [analyzeFiles, setAnalyzeFiles] = useState<File[]>([])
  const [analyzeDragging, setAnalyzeDragging] = useState(false)
  const analyzeRef = useRef<HTMLInputElement>(null)

  const clearError = () => setError(null)

  // ── Build ──────────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/ontologies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const created = await res.json()
      router.push(`/ontology/${created.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    }
  }

  // ── Import ─────────────────────────────────────────────────────────────────

  const onImportDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setImportDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) { setImportFile(f); clearError() }
  }, [])

  const doImport = async () => {
    if (!importFile) return
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', importFile)
      const resp = await fetch('/api/ontologies/import', { method: 'POST', body: fd })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? `Server error ${resp.status}`)
      }
      const ct = resp.headers.get('content-type') ?? ''
      let ontology: { id: string }
      if (ct.includes('text/event-stream')) {
        const { readSSE } = await import('@/lib/sse')
        ontology = await readSSE(resp) as { id: string }
      } else {
        ontology = await resp.json()
      }
      router.push(`/ontology/${ontology.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    }
  }

  // ── Analyze ────────────────────────────────────────────────────────────────

  const addAnalyzeFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming)
    setAnalyzeFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...arr.filter(f => !names.has(f.name))]
    })
    clearError()
  }

  const onAnalyzeDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setAnalyzeDragging(false)
    if (e.dataTransfer.files.length) addAnalyzeFiles(e.dataTransfer.files)
  }, [])

  const doAnalyze = async () => {
    if (analyzeFiles.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      for (const f of analyzeFiles) fd.append('file', f)
      const resp = await fetch('/api/ontologies/upload', { method: 'POST', body: fd })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? `Server error ${resp.status}`)
      }
      const ct = resp.headers.get('content-type') ?? ''
      let ontology: { id: string }
      if (ct.includes('text/event-stream')) {
        const { readSSE } = await import('@/lib/sse')
        ontology = await readSSE(resp) as { id: string }
      } else {
        ontology = await resp.json()
      }
      router.push(`/ontology/${ontology.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const canSubmit = mode === 'build'
    ? form.name.trim().length > 0
    : mode === 'import'
      ? importFile !== null
      : analyzeFiles.length > 0

  const submitLabel = () => {
    if (loading) return null
    if (mode === 'build') return 'Create →'
    if (mode === 'import') return 'Import →'
    return analyzeFiles.length > 1 ? `Analyze ${analyzeFiles.length} files →` : 'Analyze →'
  }

  const handleSubmit = () => {
    if (mode === 'import') doImport()
    else if (mode === 'analyze') doAnalyze()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(15,23,42,0.6)' }}
      onClick={e => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="rounded-xl w-full max-w-lg animate-fade-in flex flex-col"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
            New Ontology
          </h2>
          {!loading && (
            <button onClick={onClose} style={{ color: 'var(--text-dim)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)', padding: '0 6px' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { if (!loading) { setMode(tab.id); clearError() } }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs transition-all"
              style={{
                color: mode === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: `2px solid ${mode === tab.id ? 'var(--accent)' : 'transparent'}`,
                marginBottom: -1,
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5 flex flex-col gap-4">

          {/* ── Build Visually ── */}
          {mode === 'build' && (
            <form id="build-form" onSubmit={handleCreate} className="flex flex-col gap-3">
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
            </form>
          )}

          {/* ── Import File ── */}
          {mode === 'import' && (
            <>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Import your existing ontology file — we'll parse it and build an interactive visual graph.
                You can then explore the structure, edit nodes and relationships in the visual editor,
                and export the result as JSON or YAML.
              </p>
              <div
                onDrop={onImportDrop}
                onDragOver={e => { e.preventDefault(); setImportDragging(true) }}
                onDragLeave={() => setImportDragging(false)}
                onClick={() => !loading && importRef.current?.click()}
                className="rounded-lg flex flex-col items-center justify-center gap-3 transition-all cursor-pointer"
                style={{
                  border: `2px dashed ${importDragging ? 'var(--accent)' : importFile ? 'var(--border2)' : 'var(--border)'}`,
                  background: importDragging ? 'var(--accent-dim)' : 'var(--surface)',
                  minHeight: importFile ? 72 : 140,
                  padding: 20,
                }}
              >
                <input
                  ref={importRef}
                  type="file"
                  accept=".json,.yaml,.yml,.md,.markdown"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) { setImportFile(e.target.files[0]); clearError() } }}
                />
                {!importFile ? (
                  <>
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}>
                      <UploadIcon size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                        Drop your ontology file or click to browse
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        YAML · JSON · Markdown
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex items-center gap-3">
                    <FileIcon size={18} style={{ color: 'var(--accent)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{importFile.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{fmtBytes(importFile.size)} · click to replace</p>
                    </div>
                    {!loading && (
                      <button onClick={e => { e.stopPropagation(); setImportFile(null) }}
                        style={{ color: 'var(--text-dim)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                        <XIcon size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              {loading && (
                <p className="text-center text-xs" style={{ color: 'var(--text-dim)' }}>
                  Parsing your ontology and converting it to the knowledge graph format…
                </p>
              )}
            </>
          )}

          {/* ── Learn from Documents ── */}
          {mode === 'analyze' && (
            <>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Upload several files in the same format — job descriptions, contracts, reports, product specs,
                or any structured text. We'll analyze the content, discover the common structure,
                identify entities and relationships, and automatically generate a taxonomy and ontology
                that reflects how your data is actually organized.
              </p>
              <div
                onDrop={onAnalyzeDrop}
                onDragOver={e => { e.preventDefault(); setAnalyzeDragging(true) }}
                onDragLeave={() => setAnalyzeDragging(false)}
                onClick={() => !loading && analyzeRef.current?.click()}
                className="rounded-lg flex flex-col items-center justify-center gap-3 transition-all cursor-pointer"
                style={{
                  border: `2px dashed ${analyzeDragging ? 'var(--accent)' : analyzeFiles.length > 0 ? 'var(--border2)' : 'var(--border)'}`,
                  background: analyzeDragging ? 'var(--accent-dim)' : 'var(--surface)',
                  minHeight: analyzeFiles.length > 0 ? 72 : 140,
                  padding: 20,
                }}
              >
                <input
                  ref={analyzeRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && addAnalyzeFiles(e.target.files)}
                />
                <div className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}>
                  <PlusIcon size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {analyzeFiles.length > 0 ? 'Drop more files or click to add' : 'Drop documents or click to browse'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    PDF · images · text · JSON · CSV — any format · multiple files
                  </p>
                </div>
              </div>

              {analyzeFiles.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    {analyzeFiles.length} file{analyzeFiles.length > 1 ? 's' : ''} to analyze
                  </p>
                  {analyzeFiles.map(f => (
                    <div key={f.name} className="flex items-center gap-2.5 px-3 py-2 rounded"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <FileTypeIcon mime={f.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{f.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{fmtBytes(f.size)}</p>
                      </div>
                      {!loading && (
                        <button onClick={e => { e.stopPropagation(); setAnalyzeFiles(p => p.filter(x => x.name !== f.name)) }}
                          style={{ color: 'var(--text-dim)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                          <XIcon size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {analyzeFiles.length === 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {['Job descriptions', 'Medical reports', 'Contracts', 'Product sheets', 'Research abstracts'].map(ex => (
                    <span key={ex} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                      {ex}
                    </span>
                  ))}
                </div>
              )}

              {loading && (
                <p className="text-center text-xs" style={{ color: 'var(--text-dim)' }}>
                  Analyzing your documents and extracting the ontology structure…
                </p>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded text-xs"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              <AlertCircleIcon size={12} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5 shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded text-sm transition-opacity"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', opacity: loading ? 0.4 : 1 }}
          >
            Cancel
          </button>
          {mode === 'build' ? (
            <button
              type="submit"
              form="build-form"
              disabled={!canSubmit || loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-all"
              style={{ background: canSubmit ? 'var(--accent)' : 'var(--surface2)', color: canSubmit ? '#000' : 'var(--text-muted)', opacity: canSubmit ? 1 : 0.4 }}
            >
              {loading ? (
                <><span className="inline-block w-3 h-3 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }} />
                  Creating…</>
              ) : 'Create →'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-all"
              style={{ background: canSubmit && !loading ? 'var(--accent)' : 'var(--surface2)', color: canSubmit && !loading ? '#000' : 'var(--text-muted)', opacity: canSubmit ? 1 : 0.4 }}
            >
              {loading ? (
                <><span className="inline-block w-3 h-3 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }} />
                  {mode === 'import' ? 'Importing…' : 'Analyzing…'} <ElapsedTimer /></>
              ) : submitLabel()}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
