import "server-only";

import crypto from "node:crypto";

import bcrypt from "bcryptjs";

import { isRateLimited, rateLimit } from "@/lib/rate-limit";

/**
 * Per-account login failure limit (audit SRV-07). The per-IP limit
 * (10 attempts in 5 min) does not slow down an attacker who spreads attempts
 * across many addresses: after 10 failures in 15 minutes, the account rejects
 * every login, even with the right password, until the window ends.
 *
 * Addresses without an account are counted the same way so as not to reveal
 * who is registered. The key is a hash of the address.
 */
const FAILURES = { limit: 10, windowMs: 15 * 60 * 1000 };

function failureKey(email: string): string {
  const emailHash = crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return `login-fail:${emailHash}`;
}

export function isAccountLocked(email: string): Promise<boolean> {
  return isRateLimited(failureKey(email), FAILURES);
}

export async function recordLoginFailure(email: string): Promise<void> {
  await rateLimit(failureKey(email), FAILURES);
}

let pendingDummyHash: Promise<string> | null = null;

/**
 * Dummy hash, compared when the address has no account: the response time
 * matches a wrong password and does not reveal whether the account exists.
 * Computed lazily, because `auth.ts` is loaded by every route and each
 * cold start would otherwise pay for a cost-12 bcrypt.
 */
export function dummyHash(): Promise<string> {
  pendingDummyHash ??= bcrypt.hash("connexion-timing-guard", 12);
  return pendingDummyHash;
}
