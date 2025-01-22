import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {
    try {
      console.log('Fetching user with email:', email);
      const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
      console.log('User fetched successfully:', user.rows[0]);
      return user.rows[0];
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw new Error('Failed to fetch user.');
    }
  }
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
        async authorize(credentials)  {
            console.log('Starting authorization process...');
            console.log('Received credentials:', credentials);

            const parsedCredentials = z
              .object({ email: z.string().email(), password: z.string().min(6) })
              .safeParse(credentials);
            
              if (parsedCredentials.success) {
                const { email, password } = parsedCredentials.data;
                console.log('Parsed email:', email);
                const user = await getUser(email);
                if (!user) {
                  console.log('No user found with email:', email);
                  return null;}

                console.log('Password received:', password);
                console.log('Hashed password from DB:', user.password);
                
                const passwordsMatch = await bcrypt.compare(password, user.password);
                
                console.log('Passwords match:', passwordsMatch);  

                if (passwordsMatch) {
                  console.log('Authorization successful:', user);
                  return user;
                } else {
                  console.log('Incorrect password');
                }
            }
            console.log('Invalid credentials');
            return null;
        },
    })
],
});