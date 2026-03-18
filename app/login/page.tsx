import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg)',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '40px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        minWidth: '300px',
        alignItems: 'center',
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Ontology Builder
        </div>

        <div style={{ color: 'var(--text)', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Sign in
        </div>

        <form action={async () => {
          'use server'
          await signIn('google', { redirectTo: '/dashboard' })
        }} style={{ width: '100%' }}>
          <button type="submit" style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            color: '#374151',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 20px',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  )
}
