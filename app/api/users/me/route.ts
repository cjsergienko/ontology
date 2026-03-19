import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getOrCreateUser, countUserOntologies } from '@/lib/users'
import { getPlanLimits } from '@/lib/plans'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = getOrCreateUser(session.user.email, session.user.name ?? '')
  const limits = getPlanLimits(user.plan as Parameters<typeof getPlanLimits>[0])
  const ontologyCount = countUserOntologies(user.id)

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    limits,
    usage: {
      ontologies: ontologyCount,
      importsThisMonth: user.import_count,
      analyzesThisMonth: user.analyze_count,
    },
  })
}
