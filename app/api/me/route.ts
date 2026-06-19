import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { UserNotFoundError, deleteAccount, getUserState } from "@/lib/me-server";

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

/** RGPD — suppression définitive du compte de l'utilisateur connecté. */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    await deleteAccount(session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }
}
