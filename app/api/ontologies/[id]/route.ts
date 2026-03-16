import { NextResponse } from 'next/server'
import { getOntology, saveOntology, deleteOntology } from '@/lib/storage'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ontology = getOntology(id)
  if (!ontology) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ontology)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = getOntology(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json()
  const updated = { ...existing, ...body, id }
  saveOntology(updated)
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = deleteOntology(id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
