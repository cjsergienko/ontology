import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/authHelper'
import { sendContactEmail } from '@/lib/notify'

export async function POST(req: Request) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await req.json() as { message?: string }
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

  await sendContactEmail(sessionUser.email, sessionUser.name ?? '', message.trim())
  return NextResponse.json({ ok: true })
}
