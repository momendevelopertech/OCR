import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        if (
          credentials?.email === 'admin@example.com' &&
          credentials?.password === 'admin123'
        ) {
          return { id: '1', name: 'Admin', email: 'admin@example.com' };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
});
