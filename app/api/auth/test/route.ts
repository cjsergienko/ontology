import { NextResponse } from 'next/server'

// Dev-only endpoint for e2e test authentication — never active in production
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('ontology_test_session', '1', {
    maxAge: 3600,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  return res
}
