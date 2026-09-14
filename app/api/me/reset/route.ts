import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { UserNotFoundError, resetProgress } from "@/lib/me-server";
import { crossOriginRefusal } from "@/lib/same-origin";

export async function POST(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const state = await resetProgress(session.user.id);
    return NextResponse.json(state);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }
}
