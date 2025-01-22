import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        console.log('Redirecting unauthenticated user to login page');
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        console.log('Redirecting logged-in user to dashboard');
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    // Callback pour la session de l'utilisateur
    async session({ session, user }) {
      console.log('Session data:', session);
      console.log('User data:', user);
      return session;
    },

    // Callback pour le JWT (JSON Web Token)
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT - User data:', user);
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;    

console.log('Auth configuration loaded:', authConfig);
console.log('NEXTAUTH_SECRET:', process.env.AUTH_SECRET);