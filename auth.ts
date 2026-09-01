import NextAuth, { type DefaultSession } from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // The Prisma adapter type targets an older client surface, but the runtime
  // contract is identical — safe cast.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials, request) => {
        // Throttle login attempts per IP *before* running bcrypt, to blunt
        // brute-force. Exceeding the budget fails the attempt like bad creds.
        const ip = getClientIp(request as unknown as Request);
        if (!(await rateLimit(`login:${ip}`, { limit: 10, windowMs: 5 * 60 * 1000 })).ok) {
          return null;
        }

        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // On refuse la connexion tant que l'adresse n'est pas vérifiée : sans ce
        // contrôle, n'importe qui peut s'inscrire avec l'email d'un tiers et s'en
        // servir (squattage / pré-account-takeover). Un bypass de test existe mais
        // `lib/env.ts` interdit ce flag en production.
        if (!user.emailVerified && process.env.AUTH_ALLOW_UNVERIFIED_LOGIN !== "true") {
          throw new CredentialsSignin("email_unverified");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.username,
          username: user.username,
        };
      },
    }),
  ],
});
