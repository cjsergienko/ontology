import { getDb } from './db'
import { getPlanLimits, DEMO_ONTOLOGY_ID, type Plan } from './plans'
import { randomUUID } from 'crypto'

export interface DbUser {
  id: string
  email: string
  name: string
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  import_count: number
  analyze_count: number
  billing_period_start: string | null
  created_at: string
}

export function getOrCreateUser(email: string, name: string): { user: DbUser; isNew: boolean } {
  const db = getDb()
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DbUser | undefined
  if (!user) {
    const id = randomUUID()
    const now = new Date().toISOString()
    db.prepare(`
      INSERT INTO users (id, email, name, plan, import_count, analyze_count, created_at)
      VALUES (?, ?, ?, 'free', 0, 0, ?)
    `).run(id, email, name, now)
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser
    return { user, isNew: true }
  }
  return { user, isNew: false }
}

export function getUserByEmail(email: string): DbUser | null {
  return (getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as DbUser) ?? null
}

export function getUserById(id: string): DbUser | null {
  return (getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser) ?? null
}

export function getUserPlan(email: string): Plan {
  const user = getUserByEmail(email)
  return (user?.plan as Plan) ?? 'free'
}

/** Reset monthly counters if billing period has rolled over */
function maybeResetCounters(user: DbUser): DbUser {
  if (!user.billing_period_start) return user
  const start = new Date(user.billing_period_start)
  const now = new Date()
  const monthsElapsed =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  if (monthsElapsed >= 1) {
    getDb().prepare(`
      UPDATE users SET import_count = 0, analyze_count = 0,
        billing_period_start = ? WHERE id = ?
    `).run(new Date().toISOString(), user.id)
    return { ...user, import_count: 0, analyze_count: 0 }
  }
  return user
}

export function canImport(email: string): boolean {
  const user = getUserByEmail(email)
  if (!user) return false
  const u = maybeResetCounters(user)
  const limit = getPlanLimits(u.plan as Plan).importsPerMonth
  if (limit === 0) return false
  if (limit === -1) return true
  return u.import_count < limit
}

export function canAnalyze(email: string): boolean {
  const user = getUserByEmail(email)
  if (!user) return false
  const u = maybeResetCounters(user)
  const limit = getPlanLimits(u.plan as Plan).analyzePerMonth
  if (limit === 0) return false
  if (limit === -1) return true
  return u.analyze_count < limit
}

export function incrementImportCount(email: string) {
  getDb().prepare('UPDATE users SET import_count = import_count + 1 WHERE email = ?').run(email)
}

export function incrementAnalyzeCount(email: string) {
  getDb().prepare('UPDATE users SET analyze_count = analyze_count + 1 WHERE email = ?').run(email)
}

export function updateUserPlan(
  email: string,
  plan: Plan,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
) {
  getDb().prepare(`
    UPDATE users SET plan = ?, stripe_customer_id = ?, stripe_subscription_id = ?,
      billing_period_start = ? WHERE email = ?
  `).run(plan, stripeCustomerId, stripeSubscriptionId, new Date().toISOString(), email)
}

export function countUserOntologies(userId: string): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as cnt FROM ontologies WHERE user_id = ?')
    .get(userId) as { cnt: number }
  return row.cnt
}

/** Copy the demo ontology for a newly registered user so their dashboard isn't empty. */
export function seedDemoOntology(userId: string): void {
  const db = getDb()
  const demo = db.prepare('SELECT * FROM ontologies WHERE id = ?').get(DEMO_ONTOLOGY_ID) as {
    name: string; description: string; domain: string; nodes: string; edges: string
  } | undefined
  if (!demo) return
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO ontologies (id, user_id, name, description, domain, nodes, edges, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), userId, demo.name, demo.description, demo.domain, demo.nodes, demo.edges, now, now)
}
