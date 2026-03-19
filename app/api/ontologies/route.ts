import { NextResponse } from 'next/server'
import { listOntologies, saveOntology } from '@/lib/storage'
import { getSessionUser } from '@/lib/authHelper'
import { countUserOntologies } from '@/lib/users'
import { getPlanLimits } from '@/lib/plans'
import type { Ontology } from '@/lib/types'

export async function GET() {
  const sessionUser = await getSessionUser()
  const ontologies = listOntologies(sessionUser?.userId)
  return NextResponse.json(ontologies)
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { getUserByEmail } = await import('@/lib/users')
  const user = getUserByEmail(sessionUser.email)!
  const limits = getPlanLimits(user.plan as Parameters<typeof getPlanLimits>[0])

  if (limits.ontologies !== -1) {
    const count = countUserOntologies(user.id)
    if (count >= limits.ontologies) {
      return NextResponse.json(
        { error: `Plan limit reached: your ${user.plan} plan allows ${limits.ontologies} ontologies. Upgrade to create more.` },
        { status: 403 },
      )
    }
  }

  const body = await req.json()
  const ontology: Ontology = {
    id: crypto.randomUUID(),
    name: body.name,
    description: body.description ?? '',
    domain: body.domain ?? '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
    edges: [],
  }
  saveOntology(ontology, user.id)
  return NextResponse.json(ontology, { status: 201 })
}
