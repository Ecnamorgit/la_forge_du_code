import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import {
  UserNotFoundError,
  deleteAccount,
  getUserState,
  verifyPassword,
} from "@/lib/me-server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const state = await getUserState(session.user.id);
  if (!state) {
    // The token points to a deleted account: force a new sign-in.
    return NextResponse.json(
      { error: "Compte introuvable. Reconnecte-toi." },
      { status: 401 }
    );
  }

  return NextResponse.json(state);
}

const deleteSchema = z.object({ password: z.string().min(1).max(128) });

/**
 * Permanent account deletion (GDPR). The password is asked again so that a
 * stolen session is not enough to erase the account (audit SRV-09).
 */
export async function DELETE(req: Request) {
  const rejection = crossOriginRefusal(req);
  if (rejection) return rejection;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  // Caps password attempts through this route.
  const limit = await rateLimit(`delete-account:${userId}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let raw: unknown = null;
  try {
    raw = await req.json();
  } catch {
    // Missing or unreadable body: treated as a missing password.
  }
  const parsed = deleteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
  }

  try {
    if (!(await verifyPassword(userId, parsed.data.password))) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 403 });
    }
    await deleteAccount(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }
}
