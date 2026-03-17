import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import type { Node, Edge } from '@xyflow/react'

const NODE_WIDTH = 200
const NODE_HEIGHT = 60
const COLLISION_RADIUS = Math.sqrt(NODE_WIDTH ** 2 + NODE_HEIGHT ** 2) / 2 + 20

interface SimNode {
  id: string
  x: number
  y: number
}

interface SimLink {
  source: string
  target: string
}

export function applyForceLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes

  const simNodes: SimNode[] = nodes.map(n => ({ id: n.id, x: 0, y: 0 }))
  const simLinks: SimLink[] = edges
    .filter(e => nodes.some(n => n.id === e.source) && nodes.some(n => n.id === e.target))
    .map(e => ({ source: e.source, target: e.target }))

  const simulation = forceSimulation(simNodes as never)
    .force('link', forceLink(simLinks as never).id((d: unknown) => (d as SimNode).id).distance(180).strength(0.5))
    .force('charge', forceManyBody().strength(-600))
    .force('center', forceCenter(0, 0))
    .force('collide', forceCollide(COLLISION_RADIUS))
    .stop()

  // Run synchronously to convergence
  simulation.tick(300)

  const posById = new Map(simNodes.map(n => [n.id, { x: n.x, y: n.y }]))

  return nodes.map(node => {
    const pos = posById.get(node.id) ?? { x: 0, y: 0 }
    return {
      ...node,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
    }
  })
}
