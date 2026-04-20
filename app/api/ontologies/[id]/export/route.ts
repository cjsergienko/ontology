import { NextResponse } from 'next/server'
import { stringify as yamlStringify } from 'yaml'
import { getOntology } from '@/lib/storage'
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { getSessionUser } = await import('@/lib/authHelper')

  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const ontology = getOntology(id)
  if (!ontology) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const slug = ontology.name.replace(/\s+/g, '_').toLowerCase()
  const yaml = yamlStringify(ontology)

  return new Response(yaml, {
    headers: {
      'Content-Type': 'text/yaml',
      'Content-Disposition': `attachment; filename="${slug}.yaml"`,
    },
  })
}
