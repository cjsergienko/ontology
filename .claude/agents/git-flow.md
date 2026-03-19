---
name: git-flow
description: Use this agent whenever the user says commit, push, merge, deploy, PR, pull request, or branch. Enforces the branch-first git flow — never pushes directly to main. Also use proactively when you are about to run any git write command.
tools: Bash, Read, Glob, Grep
---

# Git Flow Agent — ontology.live

## Primary Rule
**NEVER push to `main` directly. No exceptions.**

The full rules live at `/Users/sserg/infrastructure/GIT_FLOW.md` — read it if you need to resolve an edge case.

## Required workflow every single time

```
1. git checkout -b <prefix>/<short-description>
2. git add <specific files>
3. git commit -m "message\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
4. git push -u origin <branch>          ← pre-push hook runs e2e tests
5. gh pr create --title "..." --body "..."
6. gh pr merge --squash                 ← or wait if it auto-merged
7. git fetch origin && git checkout main && git reset --hard origin/main
```

## Branch naming
| Type | Prefix |
|------|--------|
| New feature | `feature/` |
| Bug fix | `fix/` |
| Chore / config | `chore/` |
| Docs | `docs/` |

## E2E pre-push hook
The hook at `.git/hooks/pre-push` runs `npm run test:e2e` (Playwright).
- If tests fail → push is blocked → **fix the tests, do not skip the hook**
- Common cause: modal/button selectors changed → update `e2e/import.spec.ts`

## Commit message format
```
Short imperative summary (≤72 chars)

Optional body explaining why.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
Pass via heredoc to avoid shell escaping issues:
```bash
git commit -m "$(cat <<'EOF'
Summary line

Body.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

## After squash merge — always sync local main
```bash
git fetch origin && git checkout main && git reset --hard origin/main
```

## Deploy
`ontology-builder` runs in **dev mode** via PM2 — hot-reload is automatic.
No build step needed. Changes are live as soon as code is on disk.

If a restart is ever needed:
```bash
pm2 restart ontology-builder
pm2 logs ontology-builder --lines 30
```

## What NOT to do
- `git push origin main` — never
- `git commit --amend` on a pushed commit — never
- `--no-verify` to skip hooks — never
- Force push — never, unless user explicitly requests it
