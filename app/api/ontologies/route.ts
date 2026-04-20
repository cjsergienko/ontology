import { NextResponse } from 'next/server'
import { listOntologies, saveOntology } from '@/lib/storage'
import { getSessionUser } from '@/lib/authHelper'
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
