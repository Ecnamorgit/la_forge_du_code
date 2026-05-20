import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import {
  InvalidStepError,
  UserNotFoundError,
  completeStep,
} from "@/lib/me-server";

const bodySchema = z.object({
  course: z.string().min(1).max(32),
  chapter: z.string().min(1).max(64),
  stepIndex: z.number().int().min(0).max(999),
});

export async function POST(req: Request) {
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
    const result = await completeStep(
      session.user.id,
      parsed.data.course,
      parsed.data.chapter,
      parsed.data.stepIndex
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof InvalidStepError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
