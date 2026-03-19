export type Plan = 'free' | 'starter' | 'pro' | 'business'

export interface PlanLimits {
  ontologies: number        // -1 = unlimited
  nodesPerOntology: number  // -1 = unlimited
  importsPerMonth: number   // 0 = locked, -1 = unlimited
  analyzePerMonth: number   // 0 = locked, -1 = unlimited
  yamlExport: boolean
  apiAccess: boolean
  label: string
  priceEur: number          // 0 = free
  priceId: string | null    // Stripe price ID
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    ontologies: 2,
    nodesPerOntology: 50,
    importsPerMonth: 0,
    analyzePerMonth: 0,
    yamlExport: false,
    apiAccess: false,
    label: 'Free',
    priceEur: 0,
    priceId: null,
  },
  starter: {
    ontologies: 10,
    nodesPerOntology: 500,
    importsPerMonth: 10,
    analyzePerMonth: 0,
    yamlExport: true,
    apiAccess: false,
    label: 'Starter',
    priceEur: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? null,
  },
  pro: {
    ontologies: -1,
    nodesPerOntology: -1,
    importsPerMonth: 100,
    analyzePerMonth: 20,
    yamlExport: true,
    apiAccess: true,
    label: 'Pro',
    priceEur: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? null,
  },
  business: {
    ontologies: -1,
    nodesPerOntology: -1,
    importsPerMonth: -1,
    analyzePerMonth: -1,
    yamlExport: true,
    apiAccess: true,
    label: 'Business',
    priceEur: 499,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS ?? null,
  },
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
}

export function isUnlimited(n: number) { return n === -1 }
export function isLocked(n: number)    { return n === 0 }

export function withinLimit(used: number, limit: number) {
  if (limit === -1) return true
  return used < limit
}

export const DEMO_ONTOLOGY_ID = process.env.DEMO_ONTOLOGY_ID ?? '7b2525d0-4e71-4062-b2ac-176cb69033be'
