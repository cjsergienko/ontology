import { getOntology } from '@/lib/storage'
import { notFound } from 'next/navigation'
import { OntologyEditor } from '@/components/OntologyEditor'

export const dynamic = 'force-dynamic'

export default async function OntologyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ontology = getOntology(id)
  if (!ontology) notFound()
  return <OntologyEditor initialOntology={ontology} />
}
