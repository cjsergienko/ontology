import { Suspense } from 'react'
import { listOntologies } from '@/lib/storage'
import { OntologyHome } from '@/components/OntologyHome'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — ontology.live',
}

export default function DashboardPage() {
  const ontologies = listOntologies()
  return (
    <Suspense>
      <OntologyHome initialOntologies={ontologies} />
    </Suspense>
  )
}
