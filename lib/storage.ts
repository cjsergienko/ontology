import { getDb } from './db'
import type { Ontology } from './types'

export function listOntologies(): Omit<Ontology, 'nodes' | 'edges'>[] {
  const db = getDb()
  const rows = db.prepare(
    'SELECT id, name, description, domain, created_at, updated_at FROM ontologies ORDER BY updated_at DESC'
  ).all() as { id: string; name: string; description: string; domain: string; created_at: string; updated_at: string }[]
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    domain: r.domain,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
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

export function saveOntology(ontology: Ontology): void {
  const db = getDb()
  const now = new Date().toISOString()
  ontology.updatedAt = now
  db.prepare(`
    INSERT INTO ontologies (id, name, description, domain, nodes, edges, created_at, updated_at)
    VALUES (@id, @name, @description, @domain, @nodes, @edges, @createdAt, @updatedAt)
    ON CONFLICT(id) DO UPDATE SET
      name        = excluded.name,
      description = excluded.description,
      domain      = excluded.domain,
      nodes       = excluded.nodes,
      edges       = excluded.edges,
      updated_at  = excluded.updated_at
  `).run({
    id: ontology.id,
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
