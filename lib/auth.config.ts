import type { NextAuthConfig } from 'next-auth'

// Lightweight config used by middleware (Edge Runtime — no DB/Prisma)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/portal/login',
  },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isPortal = request.nextUrl.pathname.startsWith('/portal')
      const isLogin = request.nextUrl.pathname === '/portal/login'

      if (isPortal && !isLogin && !isLoggedIn) return false
      return true
    },
  },
}
