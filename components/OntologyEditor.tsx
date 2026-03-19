'use client'

function uuid(): string {
  try { return crypto.randomUUID() } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
  }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
  ReactFlowProvider,
} from '@xyflow/react'
import type { Ontology, OntologyNode, OntologyEdge, NodeType, EdgeType } from '@/lib/types'
import { NODE_COLORS, NODE_LABELS, EDGE_LABELS } from '@/lib/types'
import { OntologyNodeComponent } from './OntologyNode'
import { NodePanel } from './NodePanel'
import {
  SaveIcon, ArrowLeftIcon, NetworkIcon,
  BoxIcon, LinkIcon, LayersIcon, ZapIcon, CrownIcon, FilterIcon,
  DownloadIcon, PlayIcon,
} from 'lucide-react'
import Link from 'next/link'
import { stringify as yamlStringify } from 'yaml'
import { JDPreviewPanel } from './JDPreviewPanel'
import { applyLayout, LAYOUT_OPTIONS, type LayoutKind } from '@/lib/layout'

const nodeTypes: NodeTypes = {
  ontology: OntologyNodeComponent,
}

function LayoutIcon({ kind }: { kind: string }) {
  switch (kind) {
    case 'force': return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" fill="currentColor"/>
        <circle cx="8" cy="1.5" r="1.3" fill="currentColor" opacity="0.6"/>
        <circle cx="14.5" cy="8" r="1.3" fill="currentColor" opacity="0.6"/>
        <circle cx="8" cy="14.5" r="1.3" fill="currentColor" opacity="0.6"/>
        <circle cx="1.5" cy="8" r="1.3" fill="currentColor" opacity="0.6"/>
        <line x1="8" y1="5.5" x2="8" y2="2.8" stroke="currentColor" strokeWidth="1" opacity="0.45"/>
        <line x1="10.5" y1="8" x2="13.2" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.45"/>
        <line x1="8" y1="10.5" x2="8" y2="13.2" stroke="currentColor" strokeWidth="1" opacity="0.45"/>
        <line x1="5.5" y1="8" x2="2.8" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.45"/>
      </svg>
    )
    case 'spring': return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="2.5" r="1.5" fill="currentColor"/>
        <circle cx="13.5" cy="12" r="1.5" fill="currentColor" opacity="0.8"/>
        <circle cx="2.5" cy="12" r="1.5" fill="currentColor" opacity="0.8"/>
        <circle cx="8" cy="8.5" r="1.2" fill="currentColor" opacity="0.55"/>
        <line x1="8" y1="2.5" x2="13.5" y2="12" stroke="currentColor" strokeWidth="0.9" opacity="0.35"/>
        <line x1="8" y1="2.5" x2="2.5" y2="12" stroke="currentColor" strokeWidth="0.9" opacity="0.35"/>
        <line x1="13.5" y1="12" x2="2.5" y2="12" stroke="currentColor" strokeWidth="0.9" opacity="0.35"/>
        <line x1="8" y1="2.5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="0.9" opacity="0.35"/>
        <line x1="8" y1="8.5" x2="13.5" y2="12" stroke="currentColor" strokeWidth="0.9" opacity="0.35"/>
        <line x1="8" y1="8.5" x2="2.5" y2="12" stroke="currentColor" strokeWidth="0.9" opacity="0.35"/>
      </svg>
    )
    case 'tree-tb': return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="2" r="1.5" fill="currentColor"/>
        <circle cx="3.5" cy="7.5" r="1.3" fill="currentColor" opacity="0.8"/>
        <circle cx="12.5" cy="7.5" r="1.3" fill="currentColor" opacity="0.8"/>
        <circle cx="1.5" cy="13.5" r="1.1" fill="currentColor" opacity="0.6"/>
        <circle cx="5.5" cy="13.5" r="1.1" fill="currentColor" opacity="0.6"/>
        <circle cx="12.5" cy="13.5" r="1.1" fill="currentColor" opacity="0.6"/>
        <line x1="8" y1="3.5" x2="3.5" y2="6.2" stroke="currentColor" strokeWidth="0.9" opacity="0.45"/>
        <line x1="8" y1="3.5" x2="12.5" y2="6.2" stroke="currentColor" strokeWidth="0.9" opacity="0.45"/>
        <line x1="3.5" y1="8.8" x2="1.5" y2="12.4" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
        <line x1="3.5" y1="8.8" x2="5.5" y2="12.4" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
        <line x1="12.5" y1="8.8" x2="12.5" y2="12.4" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      </svg>
    )
    case 'tree-lr': return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="2" cy="8" r="1.5" fill="currentColor"/>
        <circle cx="7.5" cy="3.5" r="1.3" fill="currentColor" opacity="0.8"/>
        <circle cx="7.5" cy="12.5" r="1.3" fill="currentColor" opacity="0.8"/>
        <circle cx="13.5" cy="1.5" r="1.1" fill="currentColor" opacity="0.6"/>
        <circle cx="13.5" cy="5.5" r="1.1" fill="currentColor" opacity="0.6"/>
        <circle cx="13.5" cy="12.5" r="1.1" fill="currentColor" opacity="0.6"/>
        <line x1="3.5" y1="8" x2="6.2" y2="3.5" stroke="currentColor" strokeWidth="0.9" opacity="0.45"/>
        <line x1="3.5" y1="8" x2="6.2" y2="12.5" stroke="currentColor" strokeWidth="0.9" opacity="0.45"/>
        <line x1="8.8" y1="3.5" x2="12.4" y2="1.5" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
        <line x1="8.8" y1="3.5" x2="12.4" y2="5.5" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
        <line x1="8.8" y1="12.5" x2="12.4" y2="12.5" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
      </svg>
    )
    case 'circular': return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="1.8" r="1.3" fill="currentColor"/>
        <circle cx="13.5" cy="5" r="1.3" fill="currentColor" opacity="0.85"/>
        <circle cx="13.5" cy="11" r="1.3" fill="currentColor" opacity="0.7"/>
        <circle cx="8" cy="14.2" r="1.3" fill="currentColor" opacity="0.6"/>
        <circle cx="2.5" cy="11" r="1.3" fill="currentColor" opacity="0.7"/>
        <circle cx="2.5" cy="5" r="1.3" fill="currentColor" opacity="0.85"/>
        <circle cx="8" cy="8" r="1.8" fill="currentColor" opacity="0.25"/>
      </svg>
    )
    default: return null
  }
}

interface Props {
  initialOntology: Ontology
}

export function OntologyEditor(props: Props) {
  return (
    <ReactFlowProvider>
      <OntologyEditorInner {...props} />
    </ReactFlowProvider>
  )
}

function toFlowNodes(nodes: OntologyNode[]): Node[] {
  return nodes.map(n => ({
    id: n.id,
    type: 'ontology',
    position: n.position,
    data: { ...n },
    selected: false,
  }))
}

function toFlowEdges(edges: OntologyEdge[]): Edge[] {
  return edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label || EDGE_LABELS[e.type as EdgeType] || e.type,
    data: { type: e.type, label: e.label },
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: '#94a3b8' },
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
  }))
}

const NODE_TYPE_OPTIONS: { type: NodeType; icon: React.ReactNode; desc: string }[] = [
  { type: 'class', icon: <CrownIcon size={12} />, desc: 'Core concept or entity' },
  { type: 'property', icon: <LayersIcon size={12} />, desc: 'Attribute or field' },
  { type: 'value', icon: <BoxIcon size={12} />, desc: 'Enumerated value or instance' },
  { type: 'dimension', icon: <ZapIcon size={12} />, desc: 'Axis of variation' },
  { type: 'relation', icon: <LinkIcon size={12} />, desc: 'Named relationship' },
  { type: 'constraint', icon: <FilterIcon size={12} />, desc: 'Rule or constraint' },
]

const EDGE_TYPE_OPTIONS: EdgeType[] = ['is_a', 'has_property', 'has_value', 'relates_to', 'part_of', 'constrains', 'instance_of']

function OntologyEditorInner({ initialOntology }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { fitView } = useReactFlow()

  const [ontology, setOntology] = useState(initialOntology)
  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(initialOntology.nodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(initialOntology.edges))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [addEdgeType, setAddEdgeType] = useState<EdgeType>('relates_to')
  const [downloadOpen, setDownloadOpen] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // URL-derived UI state
  const previewOpen = searchParams.get('panel') === 'preview'
  const selectedNodeId = searchParams.get('node')
  const selectedEdgeId = searchParams.get('edge')

  const selectedNode = selectedNodeId
    ? (nodes.find(n => n.id === selectedNodeId)?.data as unknown as OntologyNode) ?? null
    : null
  const selectedEdge = selectedEdgeId
    ? (() => {
        const e = edges.find(e => e.id === selectedEdgeId)
        if (!e) return null
        return {
          id: e.id, source: e.source, target: e.target,
          label: (e.data as { label: string })?.label ?? String(e.label ?? ''),
          type: (e.data as { type: EdgeType })?.type ?? 'relates_to',
        } as OntologyEdge
      })()
    : null

  // Update one or more URL params without adding history entries
  const setParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k)
      else params.set(k, v)
    }
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`)
  }, [searchParams, pathname, router])

  const activeLayout = (searchParams.get('layout') as LayoutKind | null) ?? 'spring'

  const autoLayout = useCallback((kind: LayoutKind) => {
    setParams({ layout: kind })
    setNodes(ns => {
      const laid = applyLayout(ns, edges, kind)
      setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50)
      return laid
    })
  }, [edges, fitView, setNodes, setParams])

  // Auto-layout on first mount using URL-persisted kind
  useEffect(() => {
    if (initialOntology.nodes.length > 0) {
      setTimeout(() => autoLayout(activeLayout), 100)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: uuid(),
        label: EDGE_LABELS[addEdgeType],
        data: { type: addEdgeType, label: EDGE_LABELS[addEdgeType] },
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: '#94a3b8' },
        style: { stroke: '#94a3b8', strokeWidth: 1.5 },
      } as Edge
      setEdges(eds => addEdge(newEdge, eds))
    },
    [addEdgeType, setEdges],
  )

  const addNode = useCallback((type: NodeType) => {
    const id = uuid()
    const center = reactFlowWrapper.current
      ? { x: reactFlowWrapper.current.clientWidth / 2 - 80, y: reactFlowWrapper.current.clientHeight / 2 - 30 }
      : { x: 300, y: 200 }

    const newNode: Node = {
      id,
      type: 'ontology',
      position: center,
      data: {
        id,
        type,
        label: `New ${NODE_LABELS[type]}`,
        description: '',
        position: center,
        semantics: '',
        examples: [],
        constraints: [],
        metadata: {},
      },
    }
    setNodes(ns => [...ns, newNode])
  }, [setNodes, reactFlowWrapper])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setParams({ node: node.id, edge: null })
  }, [setParams])

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setParams({ edge: edge.id, node: null })
  }, [setParams])

  const onPaneClick = useCallback(() => {
    setParams({ node: null, edge: null })
  }, [setParams])

  const updateNode = useCallback((updated: OntologyNode) => {
    setNodes(ns => ns.map(n => n.id === updated.id ? { ...n, data: { ...updated } } : n))
    // node stays selected; URL unchanged
  }, [setNodes])

  const deleteNode = useCallback((id: string) => {
    setNodes(ns => ns.filter(n => n.id !== id))
    setEdges(es => es.filter(e => e.source !== id && e.target !== id))
    setParams({ node: null })
  }, [setNodes, setEdges, setParams])

  const deleteEdge = useCallback((id: string) => {
    setEdges(es => es.filter(e => e.id !== id))
    setParams({ edge: null })
  }, [setEdges, setParams])

  const save = useCallback(async () => {
    setSaving(true)
    const currentNodes: OntologyNode[] = nodes.map(n => ({
      ...(n.data as unknown as OntologyNode),
      position: n.position,
    }))
    const currentEdges: OntologyEdge[] = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: (e.data as { label: string })?.label ?? String(e.label ?? ''),
      type: ((e.data as { type: EdgeType })?.type) ?? 'relates_to',
    }))
    const updated = { ...ontology, nodes: currentNodes, edges: currentEdges }
    await fetch(`/api/ontologies/${ontology.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setOntology(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [nodes, edges, ontology])

  const buildExportData = useCallback(() => {
    const currentNodes: OntologyNode[] = nodes.map(n => ({
      ...(n.data as unknown as OntologyNode),
      position: n.position,
    }))
    const currentEdges: OntologyEdge[] = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: (e.data as { label: string })?.label ?? String(e.label ?? ''),
      type: ((e.data as { type: EdgeType })?.type) ?? 'relates_to',
    }))
    return { ...ontology, nodes: currentNodes, edges: currentEdges }
  }, [nodes, edges, ontology])

  const downloadFile = useCallback((content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setDownloadOpen(false)
  }, [])

  const exportJSON = useCallback(() => {
    const data = buildExportData()
    const slug = ontology.name.replace(/\s+/g, '_').toLowerCase()
    downloadFile(JSON.stringify(data, null, 2), `${slug}.json`, 'application/json')
  }, [buildExportData, downloadFile, ontology.name])

  const exportYAML = useCallback(() => {
    const data = buildExportData()
    const slug = ontology.name.replace(/\s+/g, '_').toLowerCase()
    downloadFile(yamlStringify(data), `${slug}.yaml`, 'text/yaml')
  }, [buildExportData, downloadFile, ontology.name])

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 24px rgba(0,0,0,0.08)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--border)', padding: '0 12px', height: 56 }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <ArrowLeftIcon size={12} />
            Back
          </Link>
          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <div className="flex items-center gap-2">
            <NetworkIcon size={14} style={{ color: 'var(--accent)' }} />
            <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
              {ontology.name}
            </span>
            {ontology.domain && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                {ontology.domain}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {nodes.length} nodes · {edges.length} edges
          </span>
          <button
            onClick={() => setParams({ panel: 'preview' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)' }}
          >
            <PlayIcon size={11} />
            Try
          </button>
          <button
            onClick={save}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all"
            style={{
              background: saved ? 'rgba(16,185,129,0.15)' : 'var(--accent-dim)',
              border: `1px solid ${saved ? '#10b981' : 'var(--accent)'}`,
              color: saved ? '#10b981' : 'var(--accent)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <SaveIcon size={11} />
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
          </button>
          <div className="relative">
            <button
              onClick={() => setDownloadOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{ background: 'var(--accent)', border: '1px solid var(--accent)', color: '#000' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <DownloadIcon size={11} />
              Download
            </button>
            {downloadOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDownloadOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50"
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', minWidth: 160 }}
                >
                  {[
                    { label: 'JSON', desc: 'Ontology + graph data', fn: exportJSON },
                    { label: 'YAML', desc: 'Human-readable taxonomy', fn: exportYAML },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={opt.fn}
                      className="w-full flex flex-col items-start px-3 py-2.5 text-left transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{opt.label}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left palette */}
        <aside
          className="flex flex-col gap-1 p-3 shrink-0"
          style={{
            width: 200,
            borderRight: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <p className="text-xs px-1 mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>
            ADD NODE
          </p>
          {NODE_TYPE_OPTIONS.map(({ type, icon, desc }) => (
            <button
              key={type}
              onClick={() => addNode(type)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-all group"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--surface2)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <span
                className="flex items-center justify-center w-5 h-5 rounded shrink-0"
                style={{ background: `${NODE_COLORS[type]}20`, color: NODE_COLORS[type] }}
              >
                {icon}
              </span>
              <div>
                <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                  {NODE_LABELS[type]}
                </div>
                <div className="text-xs leading-tight" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                  {desc}
                </div>
              </div>
            </button>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

          <p className="text-xs px-1 mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>
            CONNECT AS
          </p>
          {EDGE_TYPE_OPTIONS.map(type => (
            <button
              key={type}
              onClick={() => setAddEdgeType(type)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-all"
              style={{
                background: addEdgeType === type ? 'var(--accent-dim)' : 'transparent',
                border: `1px solid ${addEdgeType === type ? 'var(--accent)' : 'transparent'}`,
                color: addEdgeType === type ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <div
                className="w-3 h-px"
                style={{ background: addEdgeType === type ? 'var(--accent)' : 'var(--text-dim)' }}
              />
              {EDGE_LABELS[type]}
            </button>
          ))}
        </aside>

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}

            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={2}
            deleteKeyCode="Delete"
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="#e2e8f0"
            />
            <Controls position="bottom-left" />
            <MiniMap
              position="bottom-right"
              nodeColor={(n) => NODE_COLORS[(n.data as unknown as OntologyNode)?.type ?? 'class']}
              maskColor="rgba(241,245,249,0.7)"
            />
          </ReactFlow>

          {/* Layout picker */}
          <div style={{
            position: 'absolute', top: 12, right: 12, zIndex: 10,
            display: 'flex', flexDirection: 'column', gap: 3,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 3,
          }}>
            {LAYOUT_OPTIONS.map(opt => (
              <button
                key={opt.kind}
                onClick={() => autoLayout(opt.kind)}
                title={`${opt.label} — ${opt.description}`}
                style={{
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 5, border: 'none',
                  background: opt.kind === activeLayout ? 'var(--accent-dim)' : 'transparent',
                  color: opt.kind === activeLayout ? 'var(--accent)' : 'var(--text-dim)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (opt.kind !== activeLayout) e.currentTarget.style.background = 'var(--surface2)'
                  if (opt.kind !== activeLayout) e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={e => {
                  if (opt.kind !== activeLayout) e.currentTarget.style.background = 'transparent'
                  if (opt.kind !== activeLayout) e.currentTarget.style.color = 'var(--text-dim)'
                }}
              >
                <LayoutIcon kind={opt.kind} />
              </button>
            ))}
          </div>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ color: 'var(--text-dim)' }}
            >
              <NetworkIcon size={40} className="mb-3 animate-glow" />
              <p className="font-display text-sm">Start adding nodes from the left panel</p>
              <p className="text-xs mt-1" style={{ fontSize: 11 }}>Drag to move · Connect handles to link</p>
            </div>
          )}
        </div>

        {/* Right panel */}
        {(selectedNode || selectedEdge) && (
          <NodePanel
            node={selectedNode}
            edge={selectedEdge}
            onUpdateNode={updateNode}
            onDeleteNode={deleteNode}
            onDeleteEdge={deleteEdge}
          />
        )}
      </div>

      {previewOpen && (
        <JDPreviewPanel
          ontologyId={ontology.id}
          ontologyName={ontology.name}
          onClose={() => setParams({ panel: null })}
        />
      )}
    </div>
  )
}
