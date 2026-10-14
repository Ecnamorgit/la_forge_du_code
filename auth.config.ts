import type { NextAuthConfig } from "next-auth";

// Configuration without Prisma or bcrypt, loaded by `proxy.ts`. The providers
// and the adapter are in `auth.ts`.
export const authConfig = {
  // 7 days instead of the default 30, so a stolen session expires on its
  // own (audit SRV-03). Immediate revocation lives in `auth.ts`.
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.username = (token.username as string) ?? "";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
