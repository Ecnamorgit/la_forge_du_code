import type { NextAuthConfig } from "next-auth";

// Configuration sans Prisma ni bcrypt, chargée par `proxy.ts`. Les providers
// et l'adaptateur sont dans `auth.ts`.
export const authConfig = {
  // 7 jours au lieu des 30 par défaut, pour qu'une session volée expire
  // d'elle-même (audit SRV-03). La révocation immédiate est dans `auth.ts`.
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
