import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getOrCreateUser, seedDemoOntology } from '@/lib/users'
import { PLAN_TEST_EMAIL, PLAN_TEST_NAME } from '@/lib/authHelper'
import type { Plan } from '@/lib/plans'

// Dev-only: configure the plan test user and set test session cookies.
// Used by e2e tests for registration and plan-limit scenarios.
// Sets ontology_test_session=1 (trusted auth bypass) + ontology_plan_user=1
// (flag to route authHelper to e2e-plan@ontology.live instead of the default test user).

const COOKIE_OPTS = {
  maxAge: 3600,
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { plan = 'free', importCount = 0, analyzeCount = 0, fresh = false } =
    (await req.json().catch(() => ({}))) as {
      plan?: Plan
      importCount?: number
      analyzeCount?: number
      fresh?: boolean
    }

  const db = getDb()

  if (fresh) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(PLAN_TEST_EMAIL) as
      | { id: string }
      | undefined
    if (existing) {
      db.prepare('DELETE FROM ontologies WHERE user_id = ?').run(existing.id)
      db.prepare('DELETE FROM users WHERE email = ?').run(PLAN_TEST_EMAIL)
    }
  }

  const { user, isNew } = getOrCreateUser(PLAN_TEST_EMAIL, PLAN_TEST_NAME)

  db.prepare(
    'UPDATE users SET plan = ?, import_count = ?, analyze_count = ? WHERE id = ?',
  ).run(plan, importCount, analyzeCount, user.id)

  if (isNew) {
    seedDemoOntology(user.id)
  }

  const res = NextResponse.json({ ok: true, plan, email: PLAN_TEST_EMAIL })
  res.cookies.set('ontology_test_session', '1', COOKIE_OPTS)
  res.cookies.set('ontology_plan_user', '1', COOKIE_OPTS)
  return res
}

// Clean up: delete plan test user + ontologies and clear cookies
export async function DELETE() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const db = getDb()
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(PLAN_TEST_EMAIL) as
    | { id: string }
    | undefined
  if (user) {
    db.prepare('DELETE FROM ontologies WHERE user_id = ?').run(user.id)
    db.prepare('DELETE FROM users WHERE email = ?').run(PLAN_TEST_EMAIL)
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.delete('ontology_test_session')
  res.cookies.delete('ontology_plan_user')
  return res
}
