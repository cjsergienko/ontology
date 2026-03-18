/**
 * One-time migration: import all JSON files from data/ontologies/ into SQLite.
 * Run with: npx tsx scripts/migrate-json-to-sqlite.ts
 */
import { readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'
import { getDb } from '../lib/db'

const DATA_DIR = path.join(process.cwd(), 'data', 'ontologies')
if (!existsSync(DATA_DIR)) {
  console.log('No data/ontologies/ directory found — nothing to migrate.')
  process.exit(0)
}

const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
if (files.length === 0) {
  console.log('No JSON files found — nothing to migrate.')
  process.exit(0)
}

const db = getDb()
const insert = db.prepare(`
  INSERT OR IGNORE INTO ontologies (id, name, description, domain, nodes, edges, created_at, updated_at)
  VALUES (@id, @name, @description, @domain, @nodes, @edges, @createdAt, @updatedAt)
`)

let migrated = 0
for (const file of files) {
  try {
    const data = JSON.parse(readFileSync(path.join(DATA_DIR, file), 'utf-8'))
    insert.run({
      id: data.id,
      name: data.name,
      description: data.description ?? '',
      domain: data.domain ?? 'general',
      nodes: JSON.stringify(data.nodes ?? []),
      edges: JSON.stringify(data.edges ?? []),
      createdAt: data.createdAt ?? new Date().toISOString(),
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    })
    console.log(`✓ ${file} — ${data.name}`)
    migrated++
  } catch (e) {
    console.error(`✗ ${file}: ${e}`)
  }
}

console.log(`\nMigrated ${migrated}/${files.length} ontologies.`)
