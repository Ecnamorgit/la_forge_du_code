import NextAuth, { type DefaultSession } from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { compteVerrouille, hashFactice, noterEchecConnexion } from "@/lib/login-guard";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { sessionEstValide } from "@/lib/session-guard";

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
  // Le type de l'adaptateur vise une ancienne version du client Prisma ; le
  // contrat à l'exécution est identique.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),
  callbacks: {
    ...authConfig.callbacks,
    // Ajoute la révocation de session (audit SRV-03) : elle lit la base, donc
    // reste hors de `auth.config.ts`, chargé par `proxy.ts`.
    jwt: async ({ token, user }) => {
      if (user) {
        // Connexion : le jeton emporte l'identité et la version de session.
        token.id = user.id;
        token.username = (user as { username?: string }).username;
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0;
        return token;
      }
      // Requêtes suivantes : on refuse le jeton si le mot de passe a changé
      // depuis son émission. Renvoyer null détruit la session.
      if (typeof token.id === "string") {
        const ok = await sessionEstValide(token.id, token.sessionVersion);
        if (!ok) return null;
      }
      return token;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials, request) => {
        // Limite par IP avant bcrypt, contre la force brute. Un dépassement
        // échoue comme de mauvais identifiants.
        const ip = getClientIp(request as unknown as Request);
        if (!(await rateLimit(`login:${ip}`, { limit: 10, windowMs: 5 * 60 * 1000 })).ok) {
          return null;
        }

        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Limite par compte (audit SRV-07), contre un attaquant aux IP
        // multiples : après 10 échecs en 15 minutes, même le bon mot de passe
        // est refusé jusqu'à la fin de la fenêtre.
        if (await compteVerrouille(email)) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            password: true,
            emailVerified: true,
            sessionVersion: true,
          },
        });

        if (!user || !user.password) {
          // Comparaison factice : le temps de réponse ne révèle pas que
          // l'adresse n'a pas de compte (audit SRV-07).
          await bcrypt.compare(password, await hashFactice());
          await noterEchecConnexion(email);
          return null;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          await noterEchecConnexion(email);
          return null;
        }

        // Adresse non vérifiée : connexion refusée, sinon n'importe qui pourrait
        // s'inscrire avec l'email d'un tiers et s'en servir. Le contournement de
        // test est interdit en production par `lib/env.ts`.
        if (!user.emailVerified && process.env.AUTH_ALLOW_UNVERIFIED_LOGIN !== "true") {
          throw new CredentialsSignin("email_unverified");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.username,
          username: user.username,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
});
