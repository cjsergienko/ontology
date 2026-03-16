'use client'

import { useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
} from '@xyflow/react'
import type { Ontology, OntologyNode, OntologyEdge, NodeType, EdgeType } from '@/lib/types'
import { NODE_COLORS, NODE_LABELS, EDGE_LABELS } from '@/lib/types'
import { OntologyNodeComponent } from './OntologyNode'
import { NodePanel } from './NodePanel'
import {
  SaveIcon, ArrowLeftIcon, PlusIcon, NetworkIcon,
  BoxIcon, LinkIcon, LayersIcon, ZapIcon, CrownIcon, FilterIcon,
  DownloadIcon,
} from 'lucide-react'
import Link from 'next/link'

const nodeTypes: NodeTypes = {
  ontology: OntologyNodeComponent,
}

interface Props {
  initialOntology: Ontology
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
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: '#334155' },
    style: { stroke: '#334155', strokeWidth: 1.5 },
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

export function OntologyEditor({ initialOntology }: Props) {
  const [ontology, setOntology] = useState(initialOntology)
  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(initialOntology.nodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(initialOntology.edges))
  const [selectedNode, setSelectedNode] = useState<OntologyNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<OntologyEdge | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [addEdgeType, setAddEdgeType] = useState<EdgeType>('relates_to')
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReturnType<typeof import('@xyflow/react').useReactFlow> | null>(null)

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: crypto.randomUUID(),
        label: EDGE_LABELS[addEdgeType],
        data: { type: addEdgeType, label: EDGE_LABELS[addEdgeType] },
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: '#334155' },
        style: { stroke: '#334155', strokeWidth: 1.5 },
      } as Edge
      setEdges(eds => addEdge(newEdge, eds))
    },
    [addEdgeType, setEdges],
  )

  const addNode = useCallback((type: NodeType) => {
    const id = crypto.randomUUID()
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
    setSelectedNode(node.data as unknown as OntologyNode)
    setSelectedEdge(null)
  }, [])

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: (edge.data as { label: string })?.label ?? String(edge.label ?? ''),
      type: (edge.data as { type: EdgeType })?.type ?? 'relates_to',
    })
    setSelectedNode(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [])

  const updateNode = useCallback((updated: OntologyNode) => {
    setNodes(ns =>
      ns.map(n =>
        n.id === updated.id
          ? { ...n, data: { ...updated } }
          : n,
      ),
    )
    setSelectedNode(updated)
  }, [setNodes])

  const deleteNode = useCallback((id: string) => {
    setNodes(ns => ns.filter(n => n.id !== id))
    setEdges(es => es.filter(e => e.source !== id && e.target !== id))
    setSelectedNode(null)
  }, [setNodes, setEdges])

  const deleteEdge = useCallback((id: string) => {
    setEdges(es => es.filter(e => e.id !== id))
    setSelectedEdge(null)
  }, [setEdges])

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

  const exportJSON = useCallback(() => {
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
    const data = { ...ontology, nodes: currentNodes, edges: currentEdges }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ontology.name.replace(/\s+/g, '_').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges, ontology])

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
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
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {nodes.length} nodes · {edges.length} edges
          </span>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <DownloadIcon size={11} />
            Export
          </button>
          <button
            onClick={save}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all"
            style={{
              background: saved ? '#10b981' : saving ? 'var(--surface2)' : 'var(--accent)',
              color: saved || saving ? 'var(--text)' : '#000',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <SaveIcon size={11} />
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
          </button>
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
          <p className="text-xs px-1 mb-2 font-medium" style={{ color: 'var(--text-dim)' }}>
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
                <div className="text-xs leading-tight" style={{ color: 'var(--text-dim)', fontSize: 10 }}>
                  {desc}
                </div>
              </div>
            </button>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

          <p className="text-xs px-1 mb-1 font-medium" style={{ color: 'var(--text-dim)' }}>
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
            onInit={(instance) => setReactFlowInstance(instance as never)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={2}
            deleteKeyCode="Delete"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="#1e2d45"
            />
            <Controls position="bottom-left" />
            <MiniMap
              position="bottom-right"
              nodeColor={(n) => NODE_COLORS[(n.data as unknown as OntologyNode)?.type ?? 'class']}
              maskColor="rgba(8,12,20,0.7)"
            />
          </ReactFlow>

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
    </div>
  )
}
