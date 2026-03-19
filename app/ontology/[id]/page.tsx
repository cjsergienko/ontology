import { Suspense } from 'react'
import { getOntology } from '@/lib/storage'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { OntologyEditor } from '@/components/OntologyEditor'
import { DEMO_ONTOLOGY_ID } from '@/lib/plans'

export const dynamic = 'force-dynamic'

export default async function OntologyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ontology = getOntology(id)
  if (!ontology) notFound()

  const session = await auth()

  // Unauthenticated users can only view the demo ontology (read-only)
  if (!session && id !== DEMO_ONTOLOGY_ID) {
    notFound()
  }

  const isDemo = id === DEMO_ONTOLOGY_ID && !session

  return (
    <Suspense>
      <OntologyEditor initialOntology={ontology} readOnly={isDemo} />
    </Suspense>
  )
}
