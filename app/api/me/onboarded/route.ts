import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { UserNotFoundError, markOnboarded } from "@/lib/me-server";
import { crossOriginRefusal } from "@/lib/same-origin";

export async function POST(req: Request) {
  const rejection = crossOriginRefusal(req);
  if (rejection) return rejection;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const state = await markOnboarded(session.user.id);
    return NextResponse.json(state);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }
}
