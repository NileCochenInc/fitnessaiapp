import NextAuth, { AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // SignIn callback: handle user creation/lookup for OAuth providers
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === "google") {
        // Check if user exists by google_id
        const result = await pool.query(
          `SELECT id FROM users WHERE google_id = $1`,
          [account.providerAccountId]
        );

        if (result.rows.length > 0) {
          // User exists, continue with sign in
          return true;
        }

        // Check if email exists
        const emailResult = await pool.query(
          `SELECT id FROM users WHERE email = $1`,
          [user.email]
        );

        if (emailResult.rows.length > 0) {
          // Email exists, link Google to existing account
          await pool.query(
            `UPDATE users SET google_id = $1, provider = 'google' WHERE email = $2`,
            [account.providerAccountId, user.email]
          );
          return true;
        }

        // Create new user from Google profile
        const username = user.name?.replace(/\s+/g, "_").toLowerCase() || user.email.split("@")[0];
        try {
          await pool.query(
            `INSERT INTO users (username, email, google_id, provider, goal)
             VALUES ($1, $2, $3, $4, $5)`,
            [username, user.email, account.providerAccountId, "google", ""]
          );
          return true;
        } catch (error) {
          console.error("Error creating user:", error);
          return false;
        }
      }
      return true;
    },
    // JWT callback runs on login and token refresh
    async jwt({ token, user, account }: { token: JWT & any; user?: any; account?: any }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
      }
      // If signing in with Google, fetch user data from DB
      if (account?.provider === "google" && !user?.username) {
        const result = await pool.query(
          `SELECT id, username FROM users WHERE email = $1`,
          [token.email]
        );
        if (result.rows[0]) {
          token.userId = result.rows[0].id.toString();
          token.username = result.rows[0].username;
        }
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
