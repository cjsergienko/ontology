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
| `app/api/ontologies/route.ts` | GET, POST | List user's own / create ontology |
| `app/api/ontologies/[id]/route.ts` | GET, PUT, DELETE | Get / update / delete one |
| `app/api/ontologies/import/route.ts` | POST | Parse YAML/JSON/Markdown file → ontology (token-gated) |
| `app/api/ontologies/upload/route.ts` | POST | Analyze multiple docs → generate ontology |
| `app/api/ontologies/[id]/preview/route.ts` | POST | Generate document from ontology via Claude (token-gated) |
| `app/api/contact/route.ts` | POST | Send token-limit contact request to contact@ontology.live |
| `app/api/users/me/route.ts` | GET | Current user plan + usage |
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

## Auth & users
- Google OAuth via NextAuth — configured in `auth.ts`
- Open to all Google accounts (no allowlist)
- All `/api/ontologies/*` routes require a valid session
- Auth helper: `lib/authHelper.ts` — `getSessionUser()` — accepts both NextAuth session and dev test cookie
- Dev bypass: `POST /api/auth/test` sets `ontology_test_session=1` cookie (used by e2e tests only)
- On first sign-in: user row created in `users` table + demo ontology copied + registration email sent

## Users & AI quota (`lib/users.ts`)
- No paid plans — all registered users have equal open access
- **AI quota:** `TOKEN_LIMIT = 3000` output tokens per user (lifetime, not monthly)
- `lib/users.ts` — `getOrCreateUser`, `canUseAI`, `incrementTokensUsed`, `countUserOntologies`, `seedDemoOntology`
- Quota enforced server-side in `/preview` and `/import` routes — returns **HTTP 402** when limit hit
- `users.tokens_used` column tracks cumulative output tokens consumed
- On 402: UI shows `TokenLimitModal` with a contact form that POSTs to `/api/contact`

## Notifications (`lib/notify.ts`)
- `sendRegistrationEmail` — fires on new user first sign-in → to `NOTIFY_EMAIL` (default `ssergienko@pivotsdoo.com`)
- `sendContactEmail` — fires when user hits token limit and submits contact form → to `contact@ontology.live`
- Uses **Gmail API** (same OAuth pattern as pivots-crm): refresh token → access token → `gmail.send`
- Config files: symlinked from `pivots-crm/config/` into `ontology/config/` (gitignored)
  - `config/gmail-credentials.json` — OAuth client credentials
  - `config/gmail-token-ssergienko.json` — refresh token for ssergienko@pivotsdoo.com sender
- If config files missing, skips silently (non-fatal)

## Ontologies are user-scoped
- `listOntologies(userId?)` filters by `user_id` — users see only their own
- `saveOntology(ontology, userId?)` records owner on create/import/analyze
- `/ontology/[id]` page: unauthenticated users can only view `DEMO_ONTOLOGY_ID` (read-only)
