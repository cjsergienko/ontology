/**
 * Unified auth check for API routes.
 * In dev/test, accepts the `ontology_test_session` cookie set by /api/auth/test.
 * In production, only accepts a real NextAuth session.
 */
import { auth } from '@/auth'
import { cookies } from 'next/headers'
import { getOrCreateUser } from '@/lib/users'

const TEST_EMAIL = 'e2e@ontology.live'
const TEST_NAME = 'E2E Test User'

export const PLAN_TEST_EMAIL = 'e2e-plan@ontology.live'
export const PLAN_TEST_NAME = 'E2E Plan Test User'

export async function getSessionUser(): Promise<{ email: string; name: string; userId: string } | null> {
  // 1. Real NextAuth session
  const session = await auth()
  if (session?.user?.email) {
    const { user } = getOrCreateUser(session.user.email, session.user.name ?? '')
    return { email: user.email, name: user.name, userId: user.id }
  }

  // 2. Dev-only test session cookie
  if (process.env.NODE_ENV !== 'production') {
    const jar = await cookies()
    if (jar.get('ontology_test_session')?.value === '1') {
      // ontology_plan_user=1 → plan/limit test user (keeps whatever plan is in DB)
      if (jar.get('ontology_plan_user')?.value === '1') {
        const { user } = getOrCreateUser(PLAN_TEST_EMAIL, PLAN_TEST_NAME)
        return { email: user.email, name: user.name, userId: user.id }
      }
      // Default main test user → auto-upgraded to pro so import/analyze don't block tests
      const { user } = getOrCreateUser(TEST_EMAIL, TEST_NAME)
      if (user.plan === 'free') {
        const { getDb } = await import('@/lib/db')
        getDb().prepare(`UPDATE users SET plan = 'pro' WHERE email = ?`).run(TEST_EMAIL)
      }
      return { email: user.email, name: user.name, userId: user.id }
    }
  }

  return null
}
