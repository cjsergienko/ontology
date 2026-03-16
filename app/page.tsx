import { listOntologies } from '@/lib/storage'
import { OntologyHome } from '@/components/OntologyHome'

export const dynamic = 'force-dynamic'

export default function Home() {
  const ontologies = listOntologies()
  return <OntologyHome initialOntologies={ontologies} />
}
