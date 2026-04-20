---
name: git-flow
description: Use this agent whenever the user says commit, push, merge, deploy, PR, pull request, or branch. Enforces the branch-first git flow — never pushes directly to main. Also use proactively when you are about to run any git write command.
tools: Bash, Read, Glob, Grep
---

# Git Flow Agent — ontology.live

## Primary Rules
1. **All work goes on `dev` branch. Always.**
2. **NEVER push to `main` directly. No exceptions.**
3. **NEVER open a PR to `main` unless the user explicitly says to.**

Main is a release branch. Dev is the working branch. PRs to main are a deliberate release action decided by the user, not something Claude does automatically.

The full infra rules live at `/Users/sserg/infrastructure/GIT_FLOW.md`.

## Required workflow every single time

```
1. git checkout dev            ← always work on dev
2. git add <specific files>
3. git commit -m "message\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
4. git push origin dev         ← pre-push hook runs e2e tests
```

## Merging to main — ONLY when user explicitly says so
```
gh pr create --base main --head dev --title "..." --body "..."
gh pr merge --squash
git fetch origin && git checkout dev && git rebase origin/main
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

## Two-remote git structure
This repo has two remotes:
| Remote | Repo | Purpose |
|--------|------|---------|
| `origin` | `cjsergienko/ontology` | Private — primary, used for deployment |
| `public` | `cjsergienko/ontology-open` | Public — open research edition, mirror of main |

After merging to main, mirror to the public repo:

```bash
# Check remotes
git remote -v

# Normal flow (private)
git push origin feature/your-branch

# Mirror main to public after merge
git push public main
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
