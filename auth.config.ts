import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      console.log('Checking authorization...');
      console.log('Current nextUrl:', nextUrl);
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const callbackUrl = nextUrl.searchParams.get('callbackUrl');
      console.log('Callback URL from request:', callbackUrl);
    
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
    async session({ session, token }) {
      console.log('Session callback triggered');
      console.log('Initial session data:', session);
      console.log('Token data:', token);

      if (token?.id) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          emailVerified: null,
        };
      }

      console.log('Session updated with user:', session.user);
      return session;
    },

    // Callback pour le JWT (JSON Web Token)
    async jwt({ token, user }) {
      console.log('JWT callback triggered');
      console.log('Initial JWT token:', token);

      if (user) {
        console.log('JWT - User data:', user);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      } else {
        console.log('No user data passed to JWT callback');
      }

      console.log('Updated JWT token:', token);
      return token;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;    

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET. Make sure it is set in the environment variables.');
}

console.log('Auth configuration loaded:', authConfig);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);