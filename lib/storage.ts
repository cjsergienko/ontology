import { getDb } from './db'
import type { Ontology, NodeType } from './types'

export interface OntologyListItem {
  id: string
  name: string
  description: string
  domain: string
  createdAt: string
  updatedAt: string
  nodeCount: number
  edgeCount: number
  dimensions: number
  classes: number
  properties: number
  thumbnail: { type: NodeType; x: number; y: number }[]
  thumbnailEdges: [number, number][]
}

export function listOntologies(): OntologyListItem[] {
  const db = getDb()
  const rows = db.prepare(
    'SELECT id, name, description, domain, nodes, edges, created_at, updated_at FROM ontologies ORDER BY updated_at DESC'
  ).all() as {
    id: string; name: string; description: string; domain: string;
    nodes: string; edges: string; created_at: string; updated_at: string
  }[]

  return rows.map(r => {
    const nodes: { id: string; type: NodeType; position: { x: number; y: number } }[] =
      JSON.parse(r.nodes || '[]')
    const edges: { source: string; target: string }[] =
      JSON.parse(r.edges || '[]')

    const xs = nodes.map(n => n.position.x)
    const ys = nodes.map(n => n.position.y)
    const minX = xs.length ? Math.min(...xs) : 0
    const maxX = xs.length ? Math.max(...xs) : 1
    const minY = ys.length ? Math.min(...ys) : 0
    const maxY = ys.length ? Math.max(...ys) : 1
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1

    const thumbNodes = nodes.slice(0, 80)
    const thumbnail = thumbNodes.map(n => ({
      type: n.type,
      x: (n.position.x - minX) / rangeX,
      y: (n.position.y - minY) / rangeY,
    }))

    const idToIdx = new Map(thumbNodes.map((n, i) => [n.id, i]))
    const thumbnailEdges: [number, number][] = []
    for (const e of edges) {
      const si = idToIdx.get(e.source)
      const ti = idToIdx.get(e.target)
      if (si !== undefined && ti !== undefined) {
        thumbnailEdges.push([si, ti])
        if (thumbnailEdges.length >= 120) break
      }
    }

    return {
      id: r.id,
      name: r.name,
      description: r.description,
      domain: r.domain,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      dimensions: nodes.filter(n => n.type === 'dimension').length,
      classes: nodes.filter(n => n.type === 'class').length,
      properties: nodes.filter(n => n.type === 'property').length,
      thumbnail,
      thumbnailEdges,
    }
  })
}

export function getOntology(id: string): Ontology | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM ontologies WHERE id = ?').get(id) as {
    id: string; name: string; description: string; domain: string;
    nodes: string; edges: string; created_at: string; updated_at: string
  } | undefined
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    domain: row.domain,
    nodes: JSON.parse(row.nodes),
    edges: JSON.parse(row.edges),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function saveOntology(ontology: Ontology, userId?: string): void {
  const db = getDb()
  const now = new Date().toISOString()
  ontology.updatedAt = now
  db.prepare(`
    INSERT INTO ontologies (id, user_id, name, description, domain, nodes, edges, created_at, updated_at)
    VALUES (@id, @userId, @name, @description, @domain, @nodes, @edges, @createdAt, @updatedAt)
    ON CONFLICT(id) DO UPDATE SET
      name        = excluded.name,
      description = excluded.description,
      domain      = excluded.domain,
      nodes       = excluded.nodes,
      edges       = excluded.edges,
      updated_at  = excluded.updated_at
  `).run({
    id: ontology.id,
    userId: userId ?? null,
    name: ontology.name,
    description: ontology.description,
    domain: ontology.domain,
    nodes: JSON.stringify(ontology.nodes),
    edges: JSON.stringify(ontology.edges),
    createdAt: ontology.createdAt,
    updatedAt: ontology.updatedAt,
  })
}

export function deleteOntology(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM ontologies WHERE id = ?').run(id)
  return result.changes > 0
}
