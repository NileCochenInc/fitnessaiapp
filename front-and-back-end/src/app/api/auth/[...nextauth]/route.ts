import NextAuth, { AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import pool from "@/lib/db"; // default import

// Extend the default session type to include username
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string; // your DB username
      name?: string | null; // optional
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await pool.query(
          `SELECT id, username, email, password_hash FROM users WHERE email = $1`,
          [credentials.email]
        );

        const user = result.rows[0];
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        if (!isValid) return null;

        // Return all info for session and JWT
        return {
          id: user.id.toString(),
          username: user.username,
          name: user.username, // optional, NextAuth compatible
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // JWT callback runs on login and token refresh
    async jwt({ token, user }: { token: JWT & any; user?: any }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username; // store username in JWT
      }
      return token;
    },
    // Session callback runs whenever session is checked
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token.userId) {
        session.user.id = token.userId;
        session.user.username = token.username; // make username available in session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
