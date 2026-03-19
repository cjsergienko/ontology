import { Suspense } from 'react'
import { listOntologies } from '@/lib/storage'
import { OntologyHome } from '@/components/OntologyHome'
import { getSessionUser } from '@/lib/authHelper'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — ontology.live',
}

export default async function DashboardPage() {
  const sessionUser = await getSessionUser()
  const ontologies = listOntologies(sessionUser?.userId)
  return (
    <Suspense>
      <OntologyHome initialOntologies={ontologies} />
    </Suspense>
  )
}
