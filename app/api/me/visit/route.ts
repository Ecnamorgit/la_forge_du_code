import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { markCourseVisited, UserNotFoundError } from "@/lib/me-server";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  course: z.string().min(1).max(64),
});

export async function POST(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "course requis" }, { status: 400 });
  }

  try {
    const state = await markCourseVisited(session.user.id, parsed.data.course);
    return NextResponse.json(state);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Impossible d'enregistrer la visite" },
      { status: 500 }
    );
  }
}
