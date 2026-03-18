# CLAUDE.md — Ontology Builder & AI Foundation Platform

## What This Project Is

This is the **ontology-as-foundation hub** — a visual web tool for designing ontologies, taxonomies, and knowledge graphs that drive AI agent pipelines. The ontology builder itself is at `/Users/sserg/ontology/`. The broader vision: ontologies defined here become the structural backbone for specialized LLM agent clusters across multiple domains.

**Live URL:** https://ontology.live (also accessible at https://hiringaihelp.com)
**Port:** 3900
**PM2 name:** `ontology-builder`
**Tunnel:** `tunnel-ontology-live` → `~/.cloudflared/config-ontology-live.yml`
**Stack:** Next.js 16 (Turbopack, dev mode), React Flow, TypeScript, Tailwind v4
**Data storage:** `/Users/sserg/ontology/data/ontologies.db` (SQLite via better-sqlite3)

---

## Service Commands

```bash
# Status
pm2 status ontology-builder

# Restart
pm2 restart ontology-builder

# Logs
pm2 logs ontology-builder --lines 50

# Run locally (dev)
cd /Users/sserg/ontology && npm run dev -- --port 3900
```

Cloudflare tunnels:
- `tunnel-ontology-live` → `~/.cloudflared/config-ontology-live.yml` (ontology.live)
- `tunnel-hiringaihelp` → `~/.cloudflared/config-hiringaihelp.yml` (hiringaihelp.com, legacy)

---

## Application Structure

```
/Users/sserg/ontology/
├── app/
│   ├── page.tsx                     # Home — ontology list (server component)
│   ├── layout.tsx                   # Root layout
│   ├── globals.css                  # Dark theme + React Flow overrides + Google Fonts
│   ├── ontology/[id]/page.tsx       # Graph editor page (server component)
│   └── api/
│       ├── ontologies/route.ts      # GET list / POST create
│       └── ontologies/[id]/route.ts # GET / PUT / DELETE individual ontology
├── components/
│   ├── OntologyHome.tsx             # Client: home page with create modal
│   ├── OntologyEditor.tsx           # Client: main React Flow graph editor
│   ├── OntologyNode.tsx             # Custom React Flow node component
│   └── NodePanel.tsx                # Client: right-side node/edge editor panel
├── lib/
│   ├── types.ts                     # TypeScript types + NODE_COLORS/NODE_LABELS/EDGE_LABELS
│   └── storage.ts                   # File-based JSON persistence (read/write/delete)
├── data/ontologies/                 # Runtime data — gitignored
├── docs/                            # Architecture & spec docs (see below)
├── hiring/                          # Hiring domain specs
├── landings/                        # Landing page intelligence specs
├── emails/                          # Email generation specs
├── ecosystem.config.cjs             # PM2 config (port 3900, dev mode)
└── next.config.ts                   # allowedDevOrigins for hiringaihelp.com tunnel
```

---

## Ontology Data Model

### Node Types
| Type | Color | Purpose |
|------|-------|---------|
| `class` | `#3b82f6` blue | Core concept or entity |
| `property` | `#10b981` green | Attribute, dimension, or field |
| `value` | `#8b5cf6` purple | Enumerated value or instance |
| `dimension` | `#f59e0b` amber | Axis of variation (taxonomy dimension) |
| `relation` | `#ef4444` red | Named relationship type |
| `constraint` | `#64748b` slate | Rule or logical constraint |

### Edge Types
`is_a` · `has_property` · `has_value` · `relates_to` · `part_of` · `constrains` · `instance_of`

### Storage Format
Each ontology is a JSON file at `data/ontologies/{uuid}.json`:
```json
{
  "id": "uuid",
  "name": "...",
  "description": "...",
  "domain": "hiring|email|compliance|...",
  "createdAt": "ISO",
  "updatedAt": "ISO",
  "nodes": [{ "id", "type", "label", "description", "position", "semantics", "examples", "constraints", "metadata" }],
  "edges": [{ "id", "source", "target", "label", "type" }]
}
```

---

## Existing Ontologies

### JD Creation Taxonomy v2.0
Created from `/Users/sserg/jd_creation_ai/taxonomy/jd_taxonomy_v2.yaml`
- 63 nodes, 63 edges
- Root class: `JobDescription`
- 8 category dimension nodes
- 34 property nodes (all taxonomy dimensions)
- 15 value nodes (7 seniority levels + 8 role families)
- 1 constraint node (`skill_profile_lookup`)

---

## Related Projects (Same Machine)

### hiring — `/Users/sserg/hiring/`
Next.js 15 SaaS app — PM2 `hiring`, port 3500 (not exposed publicly anymore).
- Full job description editor, PDF export, AI conversation
- oRPC API, PostgreSQL, TensorZero, BullMQ

---

## Domain Specifications (in `/docs/`, `/hiring/`, `/emails/`, `/landings/`)

| File | Domain | Status |
|------|--------|--------|
| `hiring/hiring_ontology_v1.0.yaml` | Hiring domain ontology | ✅ Production |
| `hiring/hiring_skills_taxonomy_v1.0.yaml` | Skills taxonomy | ✅ Production |
| `hiring/hiring_interview_taxonomy_v1.0.yaml` | Interview taxonomy | ✅ Production |
| `hiring/JD_GENERATION_PLATFORM_V1.0.md` | JD platform spec | ✅ Spec complete |
| `emails/email_taxonomy_v1.3.yaml` | Email taxonomy (34 dims, 4,707 values) | ✅ Production |
| `emails/EMAIL_CREATION_SYSTEM_COMPLETE_SPEC_V5.md` | Email agent pipeline | ✅ Spec complete |
| `landings/LANDING_PAGE_INTELLIGENCE_LAYER_SPEC_V2.md` | Landing page gen spec | ✅ Spec complete |
| `docs/COMPLIANCE_DOSSIER_*.md` | Compliance dossier pipeline | ✅ Spec complete |
| `FIL_GENERATION_PIPELINE_TECHNICAL_SPECIFICATION_V4.md` | FIL v4.2 pipeline | ✅ Spec complete |
| `FIL_V42_UNIFIED_SPEC_V5.md` | FIL unified spec v5 | ✅ Spec complete |
| `SEMANTIC_FIL_ARCHITECTURE.md` | Semantic FIL architecture | ✅ Spec complete |
| `PROJECT_SUMMARY_ONTOLOGY_TO_AGENTS (9).md` | Ontology-to-agents system | ✅ Architecture final |

---

## The Ontology-as-Foundation Vision

The architectural pattern used across all pipelines:

```
Ontology (YAML / Graph)
    ↓
Router Agent  →  assigns dimension values from ontology
    ↓
N parallel Cluster Agents  →  each cluster gets enriched ontology context
    ↓
Combiner  →  assembles sections
    ↓
Scorer  →  quality validation against ontology constraints
    ↓
Output (JD / Email / FIL / Landing Page)
```

The ontology builder here is the **design surface** for building and evolving these ontologies visually before encoding them as YAML.

---

## Development Workflow

### Adding a new ontology domain
1. Design visually at https://hiringaihelp.com
2. Export JSON from the UI
3. Convert to YAML for use in Python pipelines (jd_creation_ai pattern)
4. Build LangGraph cluster agents around the ontology dimensions

### Modifying the UI
The app runs in dev mode via PM2. Changes to `components/` or `app/` hot-reload automatically.
For production-grade deploy: build with `npm run build` and update ecosystem.config.cjs to use `next start`.

### Important: CSS import order
Google Fonts `@import url(...)` **must** come first in `globals.css` before `@import "tailwindcss"` — Tailwind v4 expands CSS at build time and `@import` after rules is invalid.
