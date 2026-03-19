---
name: api-data
description: Use this agent when working on API routes (app/api/), data storage (lib/storage.ts), types (lib/types.ts), or any backend/data layer task including SQLite, import/upload endpoints, and SSE streaming.
tools: Read, Edit, Write, Glob, Grep, Bash
---

# API & Data Agent — ontology.live

## Storage
- **Database**: SQLite via `better-sqlite3` at `/Users/sserg/ontology/data/ontologies.db`
- **Storage module**: `lib/storage.ts` — all read/write/delete operations
- **Runtime data**: `data/ontologies/` — gitignored JSON files (legacy, migrated to SQLite)

## API routes
| Route | Methods | Purpose |
|-------|---------|---------|
| `app/api/ontologies/route.ts` | GET, POST | List all / create ontology |
| `app/api/ontologies/[id]/route.ts` | GET, PUT, DELETE | Get / update / delete one |
| `app/api/ontologies/import/route.ts` | POST | Parse YAML/JSON/Markdown file → ontology |
| `app/api/ontologies/upload/route.ts` | POST | Analyze multiple docs → generate ontology |
| `app/api/auth/` | — | Auth endpoints (Google OAuth via `auth.ts`) |

## Import endpoint (`/api/ontologies/import`)
- Accepts: `.json`, `.yaml`, `.yml`, `.md`, `.markdown`
- JSON fast path: parses directly without Claude, returns immediately
- YAML/Markdown: calls Claude to convert → streams response as SSE
- Returns: `{ id, name, nodes[], edges[] }` or SSE stream

## Upload endpoint (`/api/ontologies/upload`)
- Accepts: multiple files (any format)
- Analyzes content with Claude, extracts structure, generates ontology
- Always streams via SSE

## SSE helper
`lib/sse.ts` — `readSSE(response)` reads the event stream and returns final ontology object.

## Ontology data model
```typescript
type NodeType = 'class' | 'property' | 'value' | 'dimension' | 'relation' | 'constraint'
type EdgeType = 'is_a' | 'has_property' | 'has_value' | 'relates_to' | 'part_of' | 'constrains' | 'instance_of'

interface OntologyNode {
  id: string
  type: NodeType
  label: string
  description: string
  position: { x: number; y: number }
  semantics?: string
  examples?: string[]
  constraints?: string[]
  metadata?: Record<string, unknown>
}

interface OntologyEdge {
  id: string
  source: string
  target: string
  label: string
  type: EdgeType
}

interface Ontology {
  id: string          // UUID
  name: string
  description: string
  domain: string
  createdAt: string   // ISO
  updatedAt: string   // ISO
  nodes: OntologyNode[]
  edges: OntologyEdge[]
}
```

## Node colors
| Type | Color |
|------|-------|
| class | `#3b82f6` blue |
| property | `#10b981` green |
| value | `#8b5cf6` purple |
| dimension | `#f59e0b` amber |
| relation | `#ef4444` red |
| constraint | `#64748b` slate |

## Auth
- Google OAuth via NextAuth — configured in `auth.ts`
- All `/api/ontologies/*` routes require a valid session
- Dev bypass: `POST /api/auth/test` sets a test session cookie (used by e2e tests)
- Middleware enforces auth on `/dashboard` and `/ontology/*` routes
