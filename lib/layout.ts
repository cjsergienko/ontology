import dagre from '@dagrejs/dagre'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import type { Node, Edge } from '@xyflow/react'
import type { OntologyNode } from './types'

const NODE_WIDTH = 200
const NODE_HEIGHT = 60
const COLLISION_RADIUS = Math.sqrt(NODE_WIDTH ** 2 + NODE_HEIGHT ** 2) / 2 + 60

export type LayoutKind = 'force' | 'spring' | 'forceatlas2' | 'tree-tb' | 'tree-lr' | 'circular'

export const LAYOUT_OPTIONS: { kind: LayoutKind; label: string; description: string }[] = [
  { kind: 'force',       label: 'Force',        description: 'd3-force physics — main entity pinned at center' },
  { kind: 'spring',      label: 'Spring',        description: 'Fruchterman-Reingold — balanced edge lengths' },
  { kind: 'forceatlas2', label: 'ForceAtlas2',   description: 'Degree-weighted forces — highlights clusters' },
  { kind: 'tree-tb',     label: 'Tree ↓',        description: 'Hierarchical top-to-bottom (Dagre)' },
  { kind: 'tree-lr',     label: 'Tree →',        description: 'Hierarchical left-to-right (Dagre)' },
  { kind: 'circular',    label: 'Circular',      description: 'Concentric rings by node type' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDegreeMap(nodes: Node[], edges: Edge[]): Map<string, number> {
  const deg = new Map<string, number>()
  for (const n of nodes) deg.set(n.id, 0)
  for (const e of edges) {
    deg.set(e.source, (deg.get(e.source) ?? 0) + 1)
    deg.set(e.target, (deg.get(e.target) ?? 0) + 1)
  }
  return deg
}

function highestDegree(nodes: Node[], edges: Edge[]): string | null {
  const deg = buildDegreeMap(nodes, edges)
  let best: string | null = null, bestDeg = -1
  for (const [id, d] of deg) { if (d > bestDeg) { bestDeg = d; best = id } }
  return best
}

function validEdges(nodes: Node[], edges: Edge[]): Edge[] {
  const ids = new Set(nodes.map(n => n.id))
  return edges.filter(e => ids.has(e.source) && ids.has(e.target))
}

// ── d3-force layout ───────────────────────────────────────────────────────────

interface SimNode { id: string; x: number; y: number; fx?: number | null; fy?: number | null }

function forceLayout(nodes: Node[], edges: Edge[]): Node[] {
  const mainId = highestDegree(nodes, edges)
  const simNodes: SimNode[] = nodes.map(n => ({
    id: n.id, x: 0, y: 0,
    fx: n.id === mainId ? 0 : null,
    fy: n.id === mainId ? 0 : null,
  }))
  const simLinks = validEdges(nodes, edges).map(e => ({ source: e.source, target: e.target }))

  forceSimulation(simNodes as never)
    .force('link', forceLink(simLinks as never).id((d: unknown) => (d as SimNode).id).distance(320).strength(0.4))
    .force('charge', forceManyBody().strength(-1200))
    .force('center', forceCenter(0, 0))
    .force('collide', forceCollide(COLLISION_RADIUS))
    .stop().tick(300)

  const pos = new Map(simNodes.map(n => [n.id, { x: n.x, y: n.y }]))
  return nodes.map(n => ({ ...n, position: { x: (pos.get(n.id)?.x ?? 0) - NODE_WIDTH / 2, y: (pos.get(n.id)?.y ?? 0) - NODE_HEIGHT / 2 } }))
}

// ── Fruchterman-Reingold (spring_layout) ──────────────────────────────────────
// Ref: https://networkx.org/documentation/stable/reference/drawing.html
// Nodes repel with k²/d, edges attract with d²/k; temperature cools each iter.

function springLayout(nodes: Node[], edges: Edge[], iterations = 100): Node[] {
  const n = nodes.length
  const k = Math.sqrt((2400 * 2400) / n)   // optimal pairwise distance

  // Seed positions on a circle so the algorithm starts spread out
  const pos = new Map<string, { x: number; y: number }>()
  nodes.forEach((node, i) => {
    const a = (2 * Math.PI * i) / n
    pos.set(node.id, { x: k * Math.cos(a), y: k * Math.sin(a) })
  })

  let t = 0.15 * k * Math.sqrt(n)          // initial temperature
  const cooling = t / (iterations + 1)
  const ev = validEdges(nodes, edges)

  for (let iter = 0; iter < iterations; iter++) {
    const disp = new Map<string, { x: number; y: number }>()
    for (const node of nodes) disp.set(node.id, { x: 0, y: 0 })

    // Repulsive forces between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const u = nodes[i], v = nodes[j]
        const pu = pos.get(u.id)!, pv = pos.get(v.id)!
        const dx = pu.x - pv.x, dy = pu.y - pv.y
        const d = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01)
        const f = (k * k) / d
        const nx = (dx / d) * f, ny = (dy / d) * f
        const du = disp.get(u.id)!, dv = disp.get(v.id)!
        du.x += nx; du.y += ny
        dv.x -= nx; dv.y -= ny
      }
    }

    // Attractive forces along edges
    for (const e of ev) {
      const pu = pos.get(e.source)!, pv = pos.get(e.target)!
      const dx = pu.x - pv.x, dy = pu.y - pv.y
      const d = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01)
      const f = (d * d) / k
      const nx = (dx / d) * f, ny = (dy / d) * f
      const ds = disp.get(e.source)!, dt = disp.get(e.target)!
      ds.x -= nx; ds.y -= ny
      dt.x += nx; dt.y += ny
    }

    // Apply displacements, clamped by temperature
    for (const node of nodes) {
      const d = disp.get(node.id)!
      const len = Math.max(Math.sqrt(d.x * d.x + d.y * d.y), 0.01)
      const clamp = Math.min(len, t)
      const p = pos.get(node.id)!
      p.x += (d.x / len) * clamp
      p.y += (d.y / len) * clamp
    }

    t = Math.max(t - cooling, 0.01)
  }

  return nodes.map(n => {
    const p = pos.get(n.id)!
    return { ...n, position: { x: p.x - NODE_WIDTH / 2, y: p.y - NODE_HEIGHT / 2 } }
  })
}

// ── ForceAtlas2 ───────────────────────────────────────────────────────────────
// Ref: https://networkx.org/documentation/stable/reference/drawing.html
// Degree-weighted repulsion, linear attraction, global gravity.
// Each node has an adaptive speed to prevent oscillation (swing damping).

function forceAtlas2Layout(
  nodes: Node[],
  edges: Edge[],
  {
    iterations = 200,
    scalingRatio = 2.0,
    gravity = 1.0,
    linLog = false,
  } = {},
): Node[] {
  const n = nodes.length
  const deg = buildDegreeMap(nodes, edges)
  const ev = validEdges(nodes, edges)

  // Seed on a circle
  const pos = new Map<string, { x: number; y: number }>()
  const vel = new Map<string, { x: number; y: number }>()
  const swg = new Map<string, number>()
  nodes.forEach((node, i) => {
    const a = (2 * Math.PI * i) / n
    const r = 400
    pos.set(node.id, { x: r * Math.cos(a), y: r * Math.sin(a) })
    vel.set(node.id, { x: 0, y: 0 })
    swg.set(node.id, 0)
  })

  const speed = new Map<string, number>()
  for (const node of nodes) speed.set(node.id, 1.0)

  for (let iter = 0; iter < iterations; iter++) {
    const force = new Map<string, { x: number; y: number }>()
    for (const node of nodes) force.set(node.id, { x: 0, y: 0 })

    // Repulsion: Fr = scalingRatio * (d(u)+1) * (d(v)+1) / dist
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const u = nodes[i], v = nodes[j]
        const pu = pos.get(u.id)!, pv = pos.get(v.id)!
        const dx = pu.x - pv.x, dy = pu.y - pv.y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01)
        const du = (deg.get(u.id) ?? 0) + 1
        const dv = (deg.get(v.id) ?? 0) + 1
        const f = scalingRatio * du * dv / dist
        const nx = (dx / dist) * f, ny = (dy / dist) * f
        const fu = force.get(u.id)!, fv = force.get(v.id)!
        fu.x += nx; fu.y += ny
        fv.x -= nx; fv.y -= ny
      }
    }

    // Attraction: Fa = dist  (linLog: log(1+dist))
    for (const e of ev) {
      const pu = pos.get(e.source)!, pv = pos.get(e.target)!
      const dx = pv.x - pu.x, dy = pv.y - pu.y
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01)
      const f = linLog ? Math.log(1 + dist) : dist
      const nx = (dx / dist) * f, ny = (dy / dist) * f
      const fs = force.get(e.source)!, ft = force.get(e.target)!
      fs.x += nx; fs.y += ny
      ft.x -= nx; ft.y -= ny
    }

    // Gravity toward center: Fg = gravity * (d(u)+1) * distance_from_center
    for (const node of nodes) {
      const p = pos.get(node.id)!
      const dist = Math.max(Math.sqrt(p.x * p.x + p.y * p.y), 0.01)
      const d = (deg.get(node.id) ?? 0) + 1
      const f = gravity * d
      const fo = force.get(node.id)!
      fo.x -= (p.x / dist) * f
      fo.y -= (p.y / dist) * f
    }

    // Adaptive speed with swing damping
    for (const node of nodes) {
      const fo = force.get(node.id)!
      const pv = vel.get(node.id)!
      // swing = magnitude of force change (oscillation detector)
      const sx = fo.x - pv.x, sy = fo.y - pv.y
      const swing = Math.sqrt(sx * sx + sy * sy)
      swg.set(node.id, swing)
      // speed inversely proportional to swing
      const sp = Math.max(0.01, Math.min(speed.get(node.id)! * 0.9 + 0.1 / (1 + swing), 10))
      speed.set(node.id, sp)
      vel.set(node.id, { x: fo.x, y: fo.y })
      const p = pos.get(node.id)!
      const flen = Math.max(Math.sqrt(fo.x * fo.x + fo.y * fo.y), 0.01)
      const step = Math.min(sp, flen) / flen
      p.x += fo.x * step
      p.y += fo.y * step
    }
  }

  return nodes.map(n => {
    const p = pos.get(n.id)!
    return { ...n, position: { x: p.x - NODE_WIDTH / 2, y: p.y - NODE_HEIGHT / 2 } }
  })
}

// ── Dagre hierarchical ────────────────────────────────────────────────────────

function dagreLayout(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR'): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 120, ranksep: 220, marginx: 80, marginy: 80 })
  for (const n of nodes) g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  for (const e of edges) g.setEdge(e.source, e.target)
  dagre.layout(g)
  return nodes.map(n => {
    const { x, y } = g.node(n.id)
    return { ...n, position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 } }
  })
}

// ── Circular (concentric rings by type) ───────────────────────────────────────

const TYPE_RING: Record<string, number> = {
  class: 0, dimension: 1, relation: 2, property: 3, constraint: 4, value: 5,
}

function circularLayout(nodes: Node[], _edges: Edge[]): Node[] {
  const rings = new Map<number, Node[]>()
  for (const n of nodes) {
    const ring = TYPE_RING[(n.data as unknown as OntologyNode)?.type ?? 'class'] ?? 3
    if (!rings.has(ring)) rings.set(ring, [])
    rings.get(ring)!.push(n)
  }
  const result: Node[] = []
  for (const [ring, rNodes] of [...rings.entries()].sort(([a], [b]) => a - b)) {
    const r = Math.max(320 + ring * 320, (rNodes.length * 320) / (2 * Math.PI))
    const step = (2 * Math.PI) / rNodes.length
    rNodes.forEach((n, i) => {
      const a = step * i + ring * 0.3
      result.push({ ...n, position: { x: r * Math.cos(a) - NODE_WIDTH / 2, y: r * Math.sin(a) - NODE_HEIGHT / 2 } })
    })
  }
  return result
}

// ── Public entry point ────────────────────────────────────────────────────────

export function applyLayout(nodes: Node[], edges: Edge[], kind: LayoutKind): Node[] {
  if (nodes.length === 0) return nodes
  switch (kind) {
    case 'force':       return forceLayout(nodes, edges)
    case 'spring':      return springLayout(nodes, edges)
    case 'forceatlas2': return forceAtlas2Layout(nodes, edges)
    case 'tree-tb':     return dagreLayout(nodes, edges, 'TB')
    case 'tree-lr':     return dagreLayout(nodes, edges, 'LR')
    case 'circular':    return circularLayout(nodes, edges)
  }
}
