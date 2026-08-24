import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { listCinematicViews, markCinematicView } from "@/lib/me-server";

const postSchema = z.object({
  cinematicId: z.string().min(1).max(128),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const course = new URL(req.url).searchParams.get("course") ?? "";
  if (!course || course.length > 64) {
    return NextResponse.json({ error: "course requis" }, { status: 400 });
  }
  const seen = await listCinematicViews(session.user.id, course);
  return NextResponse.json({ seen });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "cinematicId requis" }, { status: 400 });
  }
  await markCinematicView(session.user.id, parsed.data.cinematicId);
  return NextResponse.json({ ok: true });
}
