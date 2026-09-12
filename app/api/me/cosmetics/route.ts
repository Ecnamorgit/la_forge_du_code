import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import {
  InvalidCosmeticError,
  UserNotFoundError,
  setCosmetics,
} from "@/lib/me-server";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  frame: z.string().min(1).max(48).optional(),
  title: z.string().min(1).max(48).optional(),
  emblem: z.string().min(1).max(48).optional(),
  cardBg: z.string().min(1).max(48).optional(),
  uniform: z.string().min(1).max(48).optional(),
});

export async function POST(req: Request) {
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
    const state = await setCosmetics(session.user.id, parsed.data);
    return NextResponse.json(state);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof InvalidCosmeticError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
