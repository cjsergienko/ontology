import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import type { Ontology } from './types'

const DATA_DIR = path.join(process.cwd(), 'data', 'ontologies')

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

export function listOntologies(): Omit<Ontology, 'nodes' | 'edges'>[] {
  ensureDir()
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
  return files.map(f => {
    const data = JSON.parse(readFileSync(path.join(DATA_DIR, f), 'utf-8')) as Ontology
    const { nodes: _n, edges: _e, ...meta } = data
    return meta
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getOntology(id: string): Ontology | null {
  ensureDir()
  const file = path.join(DATA_DIR, `${id}.json`)
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf-8')) as Ontology
}

export function saveOntology(ontology: Ontology): void {
  ensureDir()
  ontology.updatedAt = new Date().toISOString()
  writeFileSync(path.join(DATA_DIR, `${ontology.id}.json`), JSON.stringify(ontology, null, 2))
}

export function deleteOntology(id: string): boolean {
  const file = path.join(DATA_DIR, `${id}.json`)
  if (!existsSync(file)) return false
  const { unlinkSync } = require('fs')
  unlinkSync(file)
  return true
}
