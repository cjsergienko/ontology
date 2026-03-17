import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'

// Node dimensions — must match the rendered OntologyNode size
const NODE_WIDTH = 200
const NODE_HEIGHT = 60

export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB',
): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    nodesep: 60,   // horizontal gap between nodes in same rank
    ranksep: 100,  // vertical gap between ranks
    marginx: 40,
    marginy: 40,
  })

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  return nodes.map(node => {
    const { x, y } = g.node(node.id)
    // Dagre gives center coordinates; React Flow uses top-left
    return {
      ...node,
      position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
    }
  })
}
