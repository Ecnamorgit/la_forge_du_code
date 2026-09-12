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
    // JWT references a user that no longer exists in the DB → force a re-login.
    return NextResponse.json(
      { error: "Compte introuvable. Reconnecte-toi." },
      { status: 401 }
    );
  }

  return NextResponse.json(state);
}

const deleteSchema = z.object({ password: z.string().min(1).max(128) });

/**
 * RGPD — suppression définitive du compte de l'utilisateur connecté.
 *
 * Le mot de passe est redemandé (constat SRV-09) : une session volée, ou un
 * ordinateur resté connecté, ne suffit plus à effacer le compte.
 */
export async function DELETE(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const userId = session.user.id;

  // Borne les essais de mot de passe par cette route.
  const limit = await rateLimit(`delete-account:${userId}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let raw: unknown = null;
  try {
    raw = await req.json();
  } catch {
    // Corps absent ou illisible : traité comme un mot de passe manquant.
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
