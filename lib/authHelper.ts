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
      const { user } = getOrCreateUser(TEST_EMAIL, TEST_NAME)
      // Ensure test user has pro plan so import/analyze limits don't block tests
      if (user.plan === 'free') {
        const { getDb } = await import('@/lib/db')
        getDb().prepare(`UPDATE users SET plan = 'pro' WHERE email = ?`).run(TEST_EMAIL)
      }
      return { email: user.email, name: user.name, userId: user.id }
    }
  }

  return null
}
