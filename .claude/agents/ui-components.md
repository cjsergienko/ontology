---
name: ui-components
description: Use this agent when working on React components in components/, app/, or any UI/styling task. Knows the design system, CSS variables, component patterns, and React Flow specifics for ontology.live.
tools: Read, Edit, Write, Glob, Grep, Bash
---

# UI Components Agent — ontology.live

## Stack
- Next.js 16 (App Router, Turbopack, dev mode)
- React Flow (`@xyflow/react`) for the graph canvas
- Tailwind v4 (utility classes) + inline styles for dynamic values
- CSS variables defined in `app/globals.css`

## Design tokens (CSS variables)
```css
--bg:          #0a0d18   /* page background */
--surface:     #0d1224   /* card/input background */
--surface2:    #111827   /* elevated surface (modals) */
--border:      rgba(99,102,241,0.12)
--border2:     rgba(99,102,241,0.2)
--accent:      #f59e0b   /* amber — primary action */
--accent-dim:  rgba(245,158,11,0.1)
--text:        #f1f5f9
--text-muted:  #94a3b8
--text-dim:    #475569
```

## Fonts
- **Syne** — headings, brand, buttons (`font-display` class)
- **JetBrains Mono** — labels, metadata, code-like UI elements

## Key components
| File | Purpose |
|------|---------|
| `OntologyEditor.tsx` | Main React Flow graph editor, toolbar, layout icons |
| `OntologyHome.tsx` | Dashboard list, capability tiles, modal trigger |
| `NewOntologyModal.tsx` | Unified 3-tab modal (Build / Import / Analyze) |
| `OntologyNode.tsx` | Custom React Flow node renderer |
| `NodePanel.tsx` | Right-side node/edge property editor |
| `CapabilityTiles.tsx` | Action tiles on dashboard and landing page |
| `SiteHeader.tsx` | Global header — conditional padding per route |
| `SiteFooter.tsx` | Global footer — conditional padding per route |
| `LandingPage.tsx` | Marketing landing page with animated HeroGraph SVG |

## Padding conventions
| Page | Header padding | Footer padding |
|------|---------------|----------------|
| `/` (landing) | `0 40px` | `40px 40px` |
| `/dashboard` | `0 40px` (inner header `14px 40px`) | `14px 40px` |
| `/ontology/*` | `0 14px` | `14px 12px` |

## Modal tab → URL param mapping
| Tab | `?modal=` value |
|-----|----------------|
| Build Visually | `create` |
| Import File | `import` |
| Learn from Documents | `upload` |

## React Flow notes
- Layout algorithms: `force` (default/spring), `tree-tb`, `tree-lr`, `circular`
- Layout code: `lib/layout.ts`
- Layout icons: absolute-positioned strip at `top: 12, right: 12` inside canvas div
- `proOptions={{ hideAttribution: true }}` on `<ReactFlow>`

## Styling rules
- Use inline styles for values that depend on JS state or CSS variables
- Use Tailwind classes for structural layout (flex, grid, gap, padding steps)
- Never use Tailwind `@apply` — Tailwind v4 doesn't support it in `.tsx`
- `@import url(...)` for Google Fonts **must** be first line in `globals.css`
- Landing page body override uses `:has(> main > .landing-page)` selector
- Dashboard body override uses `:has(> main > .dashboard-page)` selector
