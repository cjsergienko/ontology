'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { XIcon, PlayIcon, AlertCircleIcon, ClockIcon } from 'lucide-react'

interface NodeCoverageItem {
  label: string
  type: string
  mentioned: boolean
}

interface NodeCoverage {
  total: number
  mentioned: number
  pct: number
  nodes: NodeCoverageItem[]
}

interface Usage {
  input_tokens: number
  output_tokens: number
  cache_read_tokens: number
  cache_write_tokens: number
  cost_usd: number
}

interface PreviewResult {
  output: string
  duration_ms: number
  usage: Usage
  node_coverage: NodeCoverage
  dimension_map: Record<string, Record<string, string>>
  model: string
}

interface Props {
  ontologyId: string
  ontologyName: string
  onClose: () => void
}

function fmt(n: number): string {
  return n.toLocaleString()
}

function fmtMs(ms: number): string {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${ms}ms`
}

function fmtCost(usd: number): string {
  if (usd < 0.001) return `$${(usd * 1000).toFixed(3)}m`
  return `$${usd.toFixed(4)}`
}

function ElapsedTimer({ running }: { running: boolean }) {
  const [ms, setMs] = useState(0)
  const startRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!running) { setMs(0); return }
    startRef.current = Date.now()
    const id = setInterval(() => setMs(Date.now() - startRef.current), 100)
    return () => clearInterval(id)
  }, [running])

  if (!running) return null
  return (
    <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'var(--accent)' }}>
      <ClockIcon size={10} />
      {fmtMs(ms)}
    </span>
  )
}

const NODE_TYPE_COLORS: Record<string, string> = {
  class: '#3b82f6',
  dimension: '#10b981',
  property: '#8b5cf6',
  concept: '#f59e0b',
  entity: '#06b6d4',
  default: '#64748b',
}

function nodeColor(type: string): string {
  return NODE_TYPE_COLORS[type.toLowerCase()] ?? NODE_TYPE_COLORS.default
}

interface HistoryEntry {
  id: string
  timestamp: number
  prompt: string
  result: PreviewResult
}

const HISTORY_KEY = (id: string) => `preview_history_${id}`
const MAX_HISTORY = 20

function loadHistory(ontologyId: string): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY(ontologyId)) ?? '[]')
  } catch { return [] }
}

function saveHistory(ontologyId: string, entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY(ontologyId), JSON.stringify(entries.slice(0, MAX_HISTORY)))
}

function fmtDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function JDPreviewPanel({ ontologyId, ontologyName, onClose }: Props) {
  const [prompt, setPrompt] = useState('Generate a job description for a senior software engineer at a B2B SaaS startup. Remote, full-time.')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PreviewResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  type Tab = 'output' | 'coverage' | 'dimensions' | 'usage'
  const activeTab = (searchParams.get('tab') as Tab | null) ?? 'output'

  const setActiveTab = useCallback((tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)

  // Load history from localStorage on mount, restore last result
  useEffect(() => {
    const h = loadHistory(ontologyId)
    setHistory(h)
    if (h.length > 0) {
      setResult(h[0].result)
      setPrompt(h[0].prompt)
      setSelectedHistoryId(h[0].id)
    }
  }, [ontologyId])

  const generate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const resp = await fetch(`/api/ontologies/${ontologyId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error || 'Generation failed')
      }
      const data: PreviewResult = await resp.json()
      const entry: HistoryEntry = { id: crypto.randomUUID(), timestamp: Date.now(), prompt, result: data }
      const updated = [entry, ...history]
      setHistory(updated)
      saveHistory(ontologyId, updated)
      setResult(data)
      setSelectedHistoryId(entry.id)
      setActiveTab('output')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const selectHistory = (entry: HistoryEntry) => {
    setResult(entry.result)
    setPrompt(entry.prompt)
    setSelectedHistoryId(entry.id)
    setActiveTab('usage')
  }

  const u = result?.usage
  const totalTokens = u ? u.input_tokens + u.output_tokens : 0
  const outputWords = result?.output ? result.output.split(/\s+/).filter(Boolean).length : 0

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="ml-auto h-full flex flex-col overflow-hidden"
        style={{
          width: 960,
          maxWidth: '95vw',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <PlayIcon size={14} style={{ color: 'var(--accent)' }} />
              <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
                Preview
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{ontologyName}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <XIcon size={14} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: input + quick stats */}
          <div
            className="flex flex-col overflow-y-auto shrink-0"
            style={{ width: 296, borderRight: '1px solid var(--border)', padding: '16px' }}
          >
            <label className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-dim)' }}>PROMPT</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={8}
              className="w-full text-xs rounded px-3 py-2 resize-none mb-4 outline-none"
              placeholder="Enter any prompt to run through this ontology…"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontFamily: 'inherit',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />

            <button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="flex items-center justify-center gap-2 w-full py-2 rounded text-xs font-medium transition-all mb-5"
              style={{
                background: loading ? 'var(--surface2)' : 'var(--accent)',
                color: loading ? 'var(--text-muted)' : '#000',
                opacity: !prompt.trim() ? 0.4 : 1,
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span
                    className="inline-block w-3 h-3 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
                  />
                  <ElapsedTimer running={loading} />
                </>
              ) : (
                <><PlayIcon size={11} /> Generate</>
              )}
            </button>

            {error && (
              <div
                className="flex items-start gap-2 p-3 rounded text-xs mb-4"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
              >
                <AlertCircleIcon size={12} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Quick stats */}
            {result && (
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Words</span>
                  <span className="font-mono" style={{ color: 'var(--text)' }}>{fmt(outputWords)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Time</span>
                  <span className="font-mono" style={{ color: 'var(--text)' }}>{fmtMs(result.duration_ms)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Cost</span>
                  <span className="font-mono" style={{ color: 'var(--accent)' }}>{fmtCost(result.usage.cost_usd)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Tokens</span>
                  <span className="font-mono" style={{ color: 'var(--text)' }}>{fmt(totalTokens)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Node coverage</span>
                  <span className="font-mono" style={{ color: result.node_coverage.pct >= 60 ? '#10b981' : result.node_coverage.pct >= 30 ? '#f59e0b' : 'var(--text-muted)' }}>
                    {result.node_coverage.pct}%
                  </span>
                </div>
                {/* Coverage bar */}
                <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: 'var(--surface2)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${result.node_coverage.pct}%`,
                      background: result.node_coverage.pct >= 60 ? '#10b981' : result.node_coverage.pct >= 30 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <div className="text-xs" style={{ color: 'var(--text-dim)', fontSize: 10 }}>
                  {result.node_coverage.mentioned}/{result.node_coverage.total} nodes mentioned
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-dim)' }}>HISTORY</p>
                <div className="flex flex-col gap-1">
                  {history.map((entry, i) => {
                    const prev = history[i + 1]
                    const cov = entry.result.node_coverage.pct
                    const prevCov = prev?.result.node_coverage.pct
                    const covDelta = prevCov !== undefined ? cov - prevCov : null
                    const words = entry.result.output.split(/\s+/).filter(Boolean).length
                    const prevWords = prev ? prev.result.output.split(/\s+/).filter(Boolean).length : null
                    const wordsDelta = prevWords !== null ? words - prevWords : null
                    const isActive = entry.id === selectedHistoryId
                    return (
                      <button
                        key={entry.id}
                        onClick={() => selectHistory(entry)}
                        className="w-full text-left px-2.5 py-2 rounded transition-all"
                        style={{
                          background: isActive ? 'var(--accent-dim)' : 'var(--surface)',
                          border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                        }}
                      >
                        <p className="text-xs truncate mb-1" style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {entry.prompt}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Node coverage */}
                          <span className="flex items-center gap-1 font-mono" style={{
                            fontSize: 13,
                            color: '#e2e8f0',
                            fontWeight: 700,
                          }}>
                            {cov}%
                            {covDelta !== null && covDelta !== 0 && (
                              <span style={{ color: covDelta > 0 ? '#10b981' : '#ef4444', fontSize: 11 }}>
                                {covDelta > 0 ? '↑' : '↓'}{Math.abs(covDelta)}
                              </span>
                            )}
                          </span>
                          {/* Word count */}
                          <span className="flex items-center gap-1 font-mono" style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 700 }}>
                            {fmt(words)}w
                            {wordsDelta !== null && wordsDelta !== 0 && (
                              <span style={{ color: wordsDelta > 0 ? '#10b981' : '#ef4444', fontSize: 11 }}>
                                {wordsDelta > 0 ? '↑' : '↓'}{Math.abs(wordsDelta)}
                              </span>
                            )}
                          </span>
                          {/* Cost */}
                          <span className="font-mono" style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700 }}>
                            {fmtCost(entry.result.usage.cost_usd)}
                          </span>
                          <span style={{ color: '#4a5568', fontSize: 11, marginLeft: 'auto' }}>
                            {fmtDate(entry.timestamp)}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: tabs + content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {result && (
              <div className="flex items-center gap-1 px-5 pt-3 pb-0 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                {(['output', 'usage', 'dimensions', 'coverage'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-3 py-2 text-xs font-medium transition-all"
                    style={{
                      color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                      borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                      marginBottom: -1,
                    }}
                  >
                    {tab === 'output' ? 'Output' : tab === 'usage' ? '⚡ Usage & Timing' : tab === 'dimensions' ? 'Dimension Map' : '🗂 Node Coverage'}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--text-dim)' }}>
                  <PlayIcon size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">Enter a prompt and click Generate</p>
                  <p className="text-xs mt-1 opacity-60">Claude will use the ontology as structured context</p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--text-dim)' }}>
                  <div
                    className="w-8 h-8 rounded-full border-2 animate-spin mb-4"
                    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                  />
                  <p className="text-sm mb-1">Generating…</p>
                  <p className="text-xs opacity-60">Claude is using the ontology as context</p>
                </div>
              )}

              {result && activeTab === 'output' && (
                <pre className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)', fontFamily: 'inherit' }}>
                  {result.output}
                </pre>
              )}

              {result && activeTab === 'coverage' && (
                <div>
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>ONTOLOGY COVERAGE</span>
                      <span
                        className="text-lg font-mono font-bold"
                        style={{ color: result.node_coverage.pct >= 60 ? '#10b981' : result.node_coverage.pct >= 30 ? '#f59e0b' : '#ef4444' }}
                      >
                        {result.node_coverage.pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${result.node_coverage.pct}%`,
                          background: result.node_coverage.pct >= 60 ? '#10b981' : result.node_coverage.pct >= 30 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text-dim)' }}>
                      {result.node_coverage.mentioned} of {result.node_coverage.total} ontology nodes referenced in output
                    </p>
                  </div>

                  {result.node_coverage.mentioned > 0 ? (
                    <div>
                      <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-dim)' }}>MATCHED NODES</div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.node_coverage.nodes.filter(n => n.mentioned).map(n => (
                          <span
                            key={n.label}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                            style={{
                              background: `${nodeColor(n.type)}18`,
                              color: nodeColor(n.type),
                              border: `1px solid ${nodeColor(n.type)}40`,
                            }}
                          >
                            {n.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                      No ontology nodes were directly referenced in the output. Try a more specific prompt.
                    </p>
                  )}
                </div>
              )}

              {result && activeTab === 'dimensions' && (
                <div>
                  {Object.keys(result.dimension_map).length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                      No dimension map returned. Try generating again.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {Object.entries(result.dimension_map).map(([section, props]) => (
                        <div key={section}>
                          <div
                            className="text-xs font-semibold uppercase tracking-widest mb-2"
                            style={{ color: 'var(--accent)', letterSpacing: '0.1em' }}
                          >
                            {section}
                          </div>
                          <div className="space-y-1">
                            {Object.entries(props).map(([key, val]) => (
                              <div key={key} className="flex items-baseline gap-3 text-xs">
                                <span
                                  className="shrink-0 font-mono"
                                  style={{ color: 'var(--text-muted)', minWidth: 180 }}
                                >
                                  {key}
                                </span>
                                <span style={{ color: 'var(--text-dim)' }}>{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {result && activeTab === 'usage' && (
                <div>
                  {/* Summary cards */}
                  <div className="grid grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'Total time', value: fmtMs(result.duration_ms), sub: 'wall clock' },
                      { label: 'Total cost', value: fmtCost(result.usage.cost_usd), sub: 'API spend', accent: true },
                      { label: 'Total tokens', value: fmt(totalTokens), sub: `${fmt(result.usage.input_tokens)} in + ${fmt(result.usage.output_tokens)} out` },
                      { label: 'Cache hit', value: result.usage.cache_read_tokens > 0 ? `${Math.round((result.usage.cache_read_tokens / (result.usage.input_tokens + result.usage.cache_read_tokens)) * 100)}%` : '—', sub: `${fmt(result.usage.cache_read_tokens)} saved tokens` },
                    ].map(c => (
                      <div key={c.label} className="p-3 rounded" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
                        <div className="text-lg font-mono font-bold mb-0.5" style={{ color: c.accent ? 'var(--accent)' : 'var(--text)' }}>{c.value}</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: 10 }}>{c.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Extra metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Output word count', value: fmt(outputWords), sub: 'generated text' },
                      { label: 'Output/Input ratio', value: result.usage.input_tokens > 0 ? (result.usage.output_tokens / result.usage.input_tokens).toFixed(2) : '—', sub: 'tokens generated per input token' },
                      { label: 'Cache writes', value: fmt(result.usage.cache_write_tokens), sub: 'tokens stored for reuse' },
                    ].map(c => (
                      <div key={c.label} className="p-3 rounded" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
                        <div className="text-base font-mono font-bold mb-0.5" style={{ color: 'var(--text)' }}>{c.value}</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: 10 }}>{c.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Breakdown table */}
                  <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-dim)' }}>PER-STAGE BREAKDOWN</div>
                  {(() => {
                    const { input_tokens, output_tokens, cache_read_tokens, cache_write_tokens } = result.usage
                    const INPUT_PRICE = 3.0, OUTPUT_PRICE = 15.0, CACHE_READ_PRICE = 0.30, CACHE_WRITE_PRICE = 3.75
                    const contextTokens = cache_write_tokens > 0 ? cache_write_tokens : cache_read_tokens
                    const contextCost = cache_write_tokens > 0
                      ? (cache_write_tokens / 1e6) * CACHE_WRITE_PRICE
                      : (cache_read_tokens / 1e6) * CACHE_READ_PRICE
                    const promptCost = (input_tokens / 1e6) * INPUT_PRICE
                    const outputCost = (output_tokens / 1e6) * OUTPUT_PRICE

                    const sonnetBadge = (
                      <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(234,179,8,0.15)', color: '#fbbf24' }}>sonnet</span>
                    )
                    const dash = <span style={{ color: 'var(--text-dim)' }}>—</span>

                    const rows: { stage: string; time: React.ReactNode; input: React.ReactNode; output: React.ReactNode; cacheWrite: React.ReactNode; cacheRead: React.ReactNode; cost: number }[] = [
                      {
                        stage: cache_write_tokens > 0 ? 'Ontology Context (write)' : 'Ontology Context (hit)',
                        time: dash, input: dash, output: dash,
                        cacheWrite: cache_write_tokens > 0 ? <span className="font-mono" style={{ color: '#f59e0b' }}>{fmt(cache_write_tokens)}</span> : dash,
                        cacheRead: cache_read_tokens > 0 ? <span className="font-mono" style={{ color: '#10b981' }}>{fmt(cache_read_tokens)}</span> : dash,
                        cost: contextCost,
                      },
                      {
                        stage: 'User Prompt',
                        time: dash,
                        input: <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{fmt(input_tokens)}</span>,
                        output: dash, cacheWrite: dash, cacheRead: dash,
                        cost: promptCost,
                      },
                      {
                        stage: 'Generation',
                        time: <span className="font-mono" style={{ color: 'var(--text)' }}>{fmtMs(result.duration_ms)}</span>,
                        input: dash,
                        output: <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{fmt(output_tokens)}</span>,
                        cacheWrite: dash, cacheRead: dash,
                        cost: outputCost,
                      },
                    ]

                    return (
                      <div className="rounded overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                              {['Stage', 'Model', 'Time', 'Input', 'Output', 'Cache write', 'Cache read', 'Cost'].map(h => (
                                <th key={h} className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, i) => (
                              <tr key={row.stage} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <td className="px-3 py-2 font-medium" style={{ color: 'var(--text)' }}>{row.stage}</td>
                                <td className="px-3 py-2">{sonnetBadge}</td>
                                <td className="px-3 py-2">{row.time}</td>
                                <td className="px-3 py-2">{row.input}</td>
                                <td className="px-3 py-2">{row.output}</td>
                                <td className="px-3 py-2">{row.cacheWrite}</td>
                                <td className="px-3 py-2">{row.cacheRead}</td>
                                <td className="px-3 py-2 font-mono" style={{ color: 'var(--accent)' }}>{fmtCost(row.cost)}</td>
                              </tr>
                            ))}
                            <tr style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                              <td className="px-3 py-2 font-semibold" style={{ color: 'var(--text)' }} colSpan={2}>Total</td>
                              <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--text)' }}>{fmtMs(result.duration_ms)}</td>
                              <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--text)' }}>{fmt(input_tokens)}</td>
                              <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--text)' }}>{fmt(output_tokens)}</td>
                              <td className="px-3 py-2 font-mono font-semibold" style={{ color: '#f59e0b' }}>{fmt(cache_write_tokens)}</td>
                              <td className="px-3 py-2 font-mono font-semibold" style={{ color: '#10b981' }}>{fmt(cache_read_tokens)}</td>
                              <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--accent)' }}>{fmtCost(result.usage.cost_usd)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )
                  })()}

                  <p className="text-xs mt-3" style={{ color: 'var(--text-dim)', fontSize: 10 }}>
                    Pricing: Sonnet $3/$15 per MTok in/out · Cache reads $0.30/MTok · Cache writes $3.75/MTok
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
