import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  const correct = process.env.AUTH_PIN

  if (!correct) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (pin !== correct) {
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('ontology_auth', '1', {
    maxAge: 10 * 365 * 24 * 3600,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  return res
}
