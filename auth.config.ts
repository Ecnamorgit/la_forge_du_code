import type { NextAuthConfig } from "next-auth";

// Edge-safe configuration (no Prisma, no bcrypt).
// Used by the middleware. The full provider list + adapter live in `auth.ts`.
export const authConfig = {
  // 7 jours (constat SRV-03) : une session volée expire d'elle-même en une
  // semaine, au lieu des 30 jours par défaut de next-auth. La révocation
  // immédiate après changement de mot de passe est gérée dans auth.ts.
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
