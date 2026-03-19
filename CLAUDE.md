# CLAUDE.md — ontology.live

## What This Project Is
Visual web tool for designing ontologies, taxonomies, and knowledge graphs that drive AI agent pipelines.

**Live URL:** https://ontology.live
**Port:** 3900
**PM2 name:** `ontology-builder`
**Tunnel:** `tunnel-ontology-live` → `~/.cloudflared/config-ontology-live.yml`
**Stack:** Next.js 16 (Turbopack, dev mode), React Flow, TypeScript, Tailwind v4
**Data:** SQLite at `/Users/sserg/ontology/data/ontologies.db` (better-sqlite3)
**Git repo:** `cjsergienko/ontology`

---

## Sub-Agents (read these for specialized work)

| Agent | File | Use when... |
|-------|------|-------------|
| **git-flow** | `.claude/agents/git-flow.md` | commit · push · merge · deploy · PR |
| **ui-components** | `.claude/agents/ui-components.md` | editing components/, CSS, design tokens, React Flow |
| **api-data** | `.claude/agents/api-data.md` | API routes, storage, types, SSE, import/upload |
| **e2e-testing** | `.claude/agents/e2e-testing.md` | writing or fixing Playwright tests |

---

## Service Commands
```bash
pm2 status ontology-builder
pm2 restart ontology-builder
pm2 logs ontology-builder --lines 50
cd /Users/sserg/ontology && npm run dev -- --port 3900
```

---

## Application Structure
```
app/
  page.tsx                    # Landing page
  layout.tsx                  # Root layout (SiteHeader + SiteFooter)
  globals.css                 # Dark theme, CSS vars, React Flow overrides
  dashboard/page.tsx          # Dashboard (ontology list)
  ontology/[id]/page.tsx      # Graph editor
  api/ontologies/             # REST API routes
components/
  OntologyHome.tsx            # Dashboard UI
  OntologyEditor.tsx          # Graph editor + toolbar
  NewOntologyModal.tsx        # Unified 3-tab create modal
  OntologyNode.tsx            # React Flow node
  NodePanel.tsx               # Node/edge property panel
  LandingPage.tsx             # Marketing page
  SiteHeader.tsx / SiteFooter.tsx
lib/
  types.ts                    # NodeType, EdgeType, Ontology interfaces
  storage.ts                  # SQLite read/write
  layout.ts                   # Graph layout algorithms
  sse.ts                      # SSE streaming helper
e2e/                          # Playwright tests (run on pre-push hook)
```

---

## Git Flow (summary — full rules in `.claude/agents/git-flow.md`)
**Never push to `main` directly.** Always:
1. `git checkout -b feature/name`
2. commit → push → `gh pr create` → `gh pr merge --squash`
3. `git fetch origin && git checkout main && git reset --hard origin/main`

Full rules also at: `/Users/sserg/infrastructure/GIT_FLOW.md`

---

## Related Projects (same machine, separate codebases)
- `hiring` — `/Users/sserg/hiring/` — port 3500
- `hiringaihelp.com` — `/Users/sserg/hiringaihelp/` — **never touch from this project**
