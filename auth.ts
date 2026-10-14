import NextAuth, { type DefaultSession } from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { isAccountLocked, dummyHash, recordLoginFailure } from "@/lib/login-guard";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isSessionValid } from "@/lib/session-guard";

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
  // The adapter's type targets an older version of the Prisma client; the
  // runtime contract is identical.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),
  callbacks: {
    ...authConfig.callbacks,
    // Adds session revocation (audit SRV-03): it reads the database, so it
    // stays out of `auth.config.ts`, which `proxy.ts` loads.
    jwt: async ({ token, user }) => {
      if (user) {
        // Sign-in: the token carries the identity and the session version.
        token.id = user.id;
        token.username = (user as { username?: string }).username;
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0;
        return token;
      }
      // Subsequent requests: reject the token if the password has changed
      // since it was issued. Returning null destroys the session.
      if (typeof token.id === "string") {
        const ok = await isSessionValid(token.id, token.sessionVersion);
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
        // Per-IP limit before bcrypt, against brute force. Exceeding it
        // fails the same way as bad credentials.
        const ip = getClientIp(request as unknown as Request);
        if (!(await rateLimit(`login:${ip}`, { limit: 10, windowMs: 5 * 60 * 1000 })).ok) {
          return null;
        }

        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Per-account limit (audit SRV-07), against an attacker with many
        // IPs: after 10 failures in 15 minutes, even the right password is
        // rejected until the window ends.
        if (await isAccountLocked(email)) return null;

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
          // Dummy comparison: the response time does not reveal that the
          // address has no account (audit SRV-07).
          await bcrypt.compare(password, await dummyHash());
          await recordLoginFailure(email);
          return null;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          await recordLoginFailure(email);
          return null;
        }

        // Unverified address: sign-in refused, otherwise anyone could sign up
        // with a third party's email and use it. The test bypass is
        // forbidden in production by `lib/env.ts`.
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
