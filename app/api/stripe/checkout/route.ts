import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@/auth'
import { getOrCreateUser } from '@/lib/users'
import { PLAN_LIMITS, type Plan } from '@/lib/plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await req.json() as { plan: Plan }
  const limits = PLAN_LIMITS[plan]
  if (!limits?.priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { user } = getOrCreateUser(session.user.email, session.user.name ?? '')

  // Create or reuse Stripe customer
  let customerId = user.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name ?? undefined,
      metadata: { userId: user.id },
    })
    customerId = customer.id
  }

  const origin = req.headers.get('origin') ?? 'https://ontology.live'

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: limits.priceId!, quantity: 1 }],
    mode: 'subscription',
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: `${origin}/pricing`,
    metadata: { userId: user.id, plan },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
