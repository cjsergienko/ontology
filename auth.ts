import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { getOrCreateUser, seedDemoOntology } from './lib/users'
import { sendRegistrationEmail } from './lib/notify'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const { user: dbUser, isNew } = getOrCreateUser(user.email, user.name ?? '')
      if (isNew) {
        seedDemoOntology(dbUser.id)
        await sendRegistrationEmail(user.email, user.name ?? '')
      }
      return true
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
