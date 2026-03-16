import { NextResponse } from 'next/server'
import { listOntologies, saveOntology } from '@/lib/storage'
import type { Ontology } from '@/lib/types'

export async function GET() {
  const ontologies = listOntologies()
  return NextResponse.json(ontologies)
}

export async function POST(req: Request) {
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
  saveOntology(ontology)
  return NextResponse.json(ontology, { status: 201 })
}
