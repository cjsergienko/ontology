import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getDb } from '@/lib/db'
import { updateUserPlan } from '@/lib/users'
import type { Plan } from '@/lib/plans'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const plan = session.metadata?.plan as Plan | undefined
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (plan && customerId) {
      const db = getDb()
      let userRow = db
        .prepare('SELECT email FROM users WHERE stripe_customer_id = ?')
        .get(customerId) as { email: string } | undefined
      if (!userRow && session.metadata?.userId) {
        userRow = db
          .prepare('SELECT email FROM users WHERE id = ?')
          .get(session.metadata.userId) as { email: string } | undefined
      }
      if (userRow) {
        updateUserPlan(userRow.email, plan, customerId, subscriptionId)
        console.log(`[stripe webhook] upgraded ${userRow.email} to ${plan}`)
      } else {
        console.error('[stripe webhook] no user found for customer', customerId)
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const db = getDb()
    const userRow = db
      .prepare('SELECT email FROM users WHERE stripe_customer_id = ?')
      .get(customerId) as { email: string } | undefined
    if (userRow) {
      updateUserPlan(userRow.email, 'free', customerId, '')
      console.log(`[stripe webhook] downgraded ${userRow.email} to free`)
    }
  }

  return NextResponse.json({ received: true })
}
