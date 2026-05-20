import type { NextAuthConfig } from "next-auth";

// Edge-safe configuration (no Prisma, no bcrypt).
// Used by the middleware. The full provider list + adapter live in `auth.ts`.
export const authConfig = {
  session: { strategy: "jwt" },
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
