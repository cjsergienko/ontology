'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileJsonIcon, XIcon, FileIcon, AlertCircleIcon } from 'lucide-react'

interface Props {
  onClose: () => void
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

export function ImportOntologyModal({ onClose }: Props) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const setFileWithReset = (f: File) => { setFile(f); setError(null) }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFileWithReset(f)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const doImport = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
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
              Upload Ontology File
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Import an existing ontology — JSON, XML, OWL, Markdown, YAML, or any structured format
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
              border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--border2)' : 'var(--border)'}`,
              background: dragging ? 'var(--accent-dim)' : 'var(--surface)',
              minHeight: file ? 80 : 140,
              padding: '20px',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".json,.xml,.owl,.md,.markdown,.yaml,.yml,.ttl,.rdf,.txt"
              className="hidden"
              onChange={e => e.target.files?.[0] && setFileWithReset(e.target.files[0])}
            />
            {!file ? (
              <>
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}
                >
                  <FileJsonIcon size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Drop your ontology file or click to browse
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    JSON · XML · OWL · Markdown · YAML · Turtle · RDF
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full flex items-center gap-3">
                <FileIcon size={18} style={{ color: 'var(--accent)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{fmtBytes(file.size)} · click to replace</p>
                </div>
                {!loading && (
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    style={{ color: 'var(--text-dim)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                  >
                    <XIcon size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

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
              onClick={doImport}
              disabled={!file || loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-all"
              style={{
                background: !file || loading ? 'var(--surface2)' : 'var(--accent)',
                color: !file || loading ? 'var(--text-muted)' : '#000',
                border: '1px solid transparent',
                opacity: !file ? 0.4 : 1,
              }}
            >
              {loading ? (
                <>
                  <span
                    className="inline-block w-3 h-3 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
                  />
                  Importing… <ElapsedTimer />
                </>
              ) : (
                <>
                  <FileJsonIcon size={13} />
                  Import Ontology
                </>
              )}
            </button>
          </div>

          {loading && (
            <p className="text-center text-xs" style={{ color: 'var(--text-dim)' }}>
              Claude is parsing your ontology file and converting it to the knowledge graph format…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
