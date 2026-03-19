import { Suspense } from 'react'
import { getOntology } from '@/lib/storage'
import { notFound } from 'next/navigation'
import { getSessionUser } from '@/lib/authHelper'
import { OntologyEditor } from '@/components/OntologyEditor'
import { DEMO_ONTOLOGY_ID } from '@/lib/plans'

export const dynamic = 'force-dynamic'

export default async function OntologyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ontology = getOntology(id)
  if (!ontology) notFound()

  const sessionUser = await getSessionUser()

  // Unauthenticated users can only view the demo ontology (read-only)
  if (!sessionUser && id !== DEMO_ONTOLOGY_ID) {
    notFound()
  }

  const isDemo = id === DEMO_ONTOLOGY_ID && !sessionUser

  return (
    <Suspense>
      <OntologyEditor initialOntology={ontology} readOnly={isDemo} />
    </Suspense>
  )
}
