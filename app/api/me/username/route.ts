import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import {
  InvalidUsernameError,
  UserNotFoundError,
  UsernameTakenError,
  renameUser,
} from "@/lib/me-server";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  username: z.string().min(2).max(16),
});

export async function PATCH(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  try {
    const state = await renameUser(session.user.id, parsed.data.username);
    return NextResponse.json(state);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof UsernameTakenError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof InvalidUsernameError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
