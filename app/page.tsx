import { Suspense } from 'react'
import { headers } from 'next/headers'
import { listOntologies } from '@/lib/storage'
import { OntologyHome } from '@/components/OntologyHome'
import { LandingPage } from '@/components/LandingPage'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const host = (await headers()).get('host') ?? ''
  const isHiringAIHelp = host.includes('hiringaihelp.com')

  if (isHiringAIHelp) {
    const ontologies = listOntologies()
    return (
      <Suspense>
        <OntologyHome initialOntologies={ontologies} />
      </Suspense>
    )
  }

  return <LandingPage />
}
