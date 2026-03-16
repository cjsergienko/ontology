'use client'

import { useState, useEffect } from 'react'
import type { OntologyNode, OntologyEdge, NodeType, EdgeType } from '@/lib/types'
import { NODE_COLORS, NODE_LABELS, EDGE_LABELS } from '@/lib/types'
import { TrashIcon, PlusIcon, XIcon } from 'lucide-react'

interface Props {
  node: OntologyNode | null
  edge: OntologyEdge | null
  onUpdateNode: (node: OntologyNode) => void
  onDeleteNode: (id: string) => void
  onDeleteEdge: (id: string) => void
}

const inputStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border2)',
  borderRadius: 6,
  padding: '6px 10px',
  color: 'var(--text)',
  fontSize: 12,
  fontFamily: 'JetBrains Mono, monospace',
  outline: 'none',
  width: '100%',
}

const labelStyle = {
  fontSize: 10,
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: 5,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
}

export function NodePanel({ node, edge, onUpdateNode, onDeleteNode, onDeleteEdge }: Props) {
  const [form, setForm] = useState<OntologyNode | null>(null)
  const [newExample, setNewExample] = useState('')
  const [newConstraint, setNewConstraint] = useState('')
  const [newMetaKey, setNewMetaKey] = useState('')
  const [newMetaVal, setNewMetaVal] = useState('')

  useEffect(() => {
    if (node) setForm({ ...node })
  }, [node?.id])

  if (edge) {
    return (
      <aside
        className="flex flex-col animate-fade-in"
        style={{
          width: 300,
          borderLeft: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: 16,
          overflowY: 'auto',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Edge
          </span>
          <button
            onClick={() => onDeleteEdge(edge.id)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all"
            style={{ color: '#ef4444', border: '1px solid #ef444430' }}
          >
            <TrashIcon size={11} />
            Delete
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <div className="mb-2">
            <span style={labelStyle}>Type</span>
            <span style={{ color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
              {EDGE_LABELS[edge.type as EdgeType] ?? edge.type}
            </span>
          </div>
          <div className="mb-2">
            <span style={labelStyle}>Label</span>
            <span style={{ color: 'var(--text)' }}>{edge.label || '—'}</span>
          </div>
          <div className="mb-2">
            <span style={labelStyle}>Source → Target</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{edge.source} → {edge.target}</span>
          </div>
        </div>
      </aside>
    )
  }

  if (!form) return null

  const color = NODE_COLORS[form.type as NodeType]

  const update = (field: Partial<OntologyNode>) => {
    const updated = { ...form, ...field }
    setForm(updated)
    onUpdateNode(updated)
  }

  const addExample = () => {
    if (!newExample.trim()) return
    update({ examples: [...(form.examples ?? []), newExample.trim()] })
    setNewExample('')
  }

  const removeExample = (i: number) => {
    const ex = [...(form.examples ?? [])]
    ex.splice(i, 1)
    update({ examples: ex })
  }

  const addConstraint = () => {
    if (!newConstraint.trim()) return
    update({ constraints: [...(form.constraints ?? []), newConstraint.trim()] })
    setNewConstraint('')
  }

  const removeConstraint = (i: number) => {
    const cs = [...(form.constraints ?? [])]
    cs.splice(i, 1)
    update({ constraints: cs })
  }

  const addMeta = () => {
    if (!newMetaKey.trim()) return
    update({ metadata: { ...(form.metadata ?? {}), [newMetaKey.trim()]: newMetaVal.trim() } })
    setNewMetaKey('')
    setNewMetaVal('')
  }

  const removeMeta = (k: string) => {
    const m = { ...(form.metadata ?? {}) }
    delete m[k]
    update({ metadata: m })
  }

  return (
    <aside
      className="flex flex-col animate-fade-in"
      style={{
        width: 300,
        borderLeft: '1px solid var(--border)',
        background: 'var(--surface)',
        overflowY: 'auto',
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${color}30` }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: color, boxShadow: `0 0 6px ${color}`,
            }}
          />
          <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
            {NODE_LABELS[form.type as NodeType]}
          </span>
        </div>
        <button
          onClick={() => onDeleteNode(form.id)}
          className="p-1 rounded transition-all"
          style={{ color: 'var(--text-dim)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          <TrashIcon size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4 overflow-y-auto">
        {/* Type selector */}
        <div>
          <label style={labelStyle}>Type</label>
          <select
            value={form.type}
            onChange={e => update({ type: e.target.value as NodeType })}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {Object.entries(NODE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Label */}
        <div>
          <label style={labelStyle}>Label</label>
          <input
            value={form.label}
            onChange={e => update({ label: e.target.value })}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = color)}
            onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description}
            onChange={e => update({ description: e.target.value })}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => (e.target.style.borderColor = color)}
            onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
          />
        </div>

        {/* Semantics */}
        <div>
          <label style={labelStyle}>Semantics</label>
          <textarea
            value={form.semantics ?? ''}
            onChange={e => update({ semantics: e.target.value })}
            rows={3}
            placeholder="Semantic meaning, signals, context..."
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => (e.target.style.borderColor = color)}
            onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
          />
        </div>

        {/* Examples */}
        <div>
          <label style={labelStyle}>Examples</label>
          <div className="flex flex-col gap-1 mb-2">
            {(form.examples ?? []).map((ex, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="flex-1 px-2 py-1 rounded text-xs"
                  style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
                >
                  {ex}
                </span>
                <button onClick={() => removeExample(i)} style={{ color: 'var(--text-dim)' }}>
                  <XIcon size={11} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              value={newExample}
              onChange={e => setNewExample(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addExample()}
              placeholder="Add example..."
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={addExample}
              className="px-2 py-1 rounded text-xs"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}
            >
              <PlusIcon size={11} />
            </button>
          </div>
        </div>

        {/* Constraints */}
        <div>
          <label style={labelStyle}>Constraints</label>
          <div className="flex flex-col gap-1 mb-2">
            {(form.constraints ?? []).map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="flex-1 px-2 py-1 rounded text-xs"
                  style={{ background: 'var(--surface2)', color: '#f59e0b', border: '1px solid #f59e0b20' }}
                >
                  {c}
                </span>
                <button onClick={() => removeConstraint(i)} style={{ color: 'var(--text-dim)' }}>
                  <XIcon size={11} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              value={newConstraint}
              onChange={e => setNewConstraint(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addConstraint()}
              placeholder="Add constraint..."
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={addConstraint}
              className="px-2 py-1 rounded text-xs"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}
            >
              <PlusIcon size={11} />
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div>
          <label style={labelStyle}>Metadata</label>
          <div className="flex flex-col gap-1 mb-2">
            {Object.entries(form.metadata ?? {}).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span
                  className="flex-1 px-2 py-1 rounded text-xs flex justify-between"
                  style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
                >
                  <span style={{ color: 'var(--teal)' }}>{k}</span>
                  <span>{v}</span>
                </span>
                <button onClick={() => removeMeta(k)} style={{ color: 'var(--text-dim)' }}>
                  <XIcon size={11} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              value={newMetaKey}
              onChange={e => setNewMetaKey(e.target.value)}
              placeholder="key"
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              value={newMetaVal}
              onChange={e => setNewMetaVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMeta()}
              placeholder="value"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={addMeta}
              className="px-2 py-1 rounded"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}
            >
              <PlusIcon size={11} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
