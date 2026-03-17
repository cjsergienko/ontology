'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadIcon, XIcon, FileIcon, FileTextIcon, ImageIcon, AlertCircleIcon, PlusIcon } from 'lucide-react'

interface Props {
  onClose: () => void
}

function FileTypeIcon({ mime }: { mime: string }) {
  if (mime.startsWith('image/')) return <ImageIcon size={14} style={{ color: '#8b5cf6' }} />
  if (mime === 'application/pdf') return <FileTextIcon size={14} style={{ color: '#ef4444' }} />
  return <FileIcon size={14} style={{ color: 'var(--accent)' }} />
}

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

export function UploadOntologyModal({ onClose }: Props) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming)
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...arr.filter(f => !names.has(f.name))]
    })
    setError(null)
  }

  const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name))

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const analyze = async () => {
    if (files.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      for (const f of files) fd.append('file', f)
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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(8,12,20,0.85)' }}
      onClick={e => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="rounded-xl w-full max-w-lg animate-fade-in"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4">
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
              Build Ontology from Examples
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Upload examples of the same document type — Claude will extract the generative ontology
            </p>
          </div>
          {!loading && (
            <button onClick={onClose} style={{ color: 'var(--text-dim)' }}>
              <XIcon size={16} />
            </button>
          )}
        </div>

        <div className="px-7 pb-7 flex flex-col gap-4">
          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !loading && inputRef.current?.click()}
            className="rounded-lg flex flex-col items-center justify-center gap-3 transition-all cursor-pointer"
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : files.length > 0 ? 'var(--border2)' : 'var(--border)'}`,
              background: dragging ? 'var(--accent-dim)' : 'var(--surface)',
              minHeight: files.length > 0 ? 80 : 140,
              padding: '20px',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => e.target.files && addFiles(e.target.files)}
            />
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}
            >
              <PlusIcon size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {files.length > 0 ? 'Drop more examples or click to add' : 'Drop example documents or click to browse'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                PDF, images, text, JSON, CSV — any format · multiple files welcome
              </p>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
                {files.length} example{files.length > 1 ? 's' : ''} to analyze
              </p>
              {files.map(f => (
                <div
                  key={f.name}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <FileTypeIcon mime={f.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{f.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{fmtBytes(f.size)}</p>
                  </div>
                  {!loading && (
                    <button
                      onClick={e => { e.stopPropagation(); removeFile(f.name) }}
                      className="shrink-0 p-0.5 rounded transition-colors"
                      style={{ color: 'var(--text-dim)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                      <XIcon size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Hint when no files */}
          {files.length === 0 && (
            <div className="flex flex-wrap gap-1.5">
              {['3× job descriptions', '2× medical reports', '5× contracts', 'Product sheets', 'Research abstracts'].map(ex => (
                <span
                  key={ex}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}
                >
                  {ex}
                </span>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 p-3 rounded text-xs"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              <AlertCircleIcon size={12} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded text-sm transition-opacity"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                opacity: loading ? 0.4 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={analyze}
              disabled={files.length === 0 || loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-all"
              style={{
                background: files.length === 0 || loading ? 'var(--surface2)' : 'var(--accent)',
                color: files.length === 0 || loading ? 'var(--text-muted)' : '#000',
                border: '1px solid transparent',
                opacity: files.length === 0 ? 0.4 : 1,
              }}
            >
              {loading ? (
                <>
                  <span
                    className="inline-block w-3 h-3 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
                  />
                  Analyzing… <ElapsedTimer />
                </>
              ) : (
                <>
                  <UploadIcon size={13} />
                  {files.length > 1 ? `Analyze ${files.length} Examples` : 'Analyze Example'}
                </>
              )}
            </button>
          </div>

          {loading && (
            <p className="text-center text-xs" style={{ color: 'var(--text-dim)' }}>
              Claude is analyzing your examples and extracting the generative ontology…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
