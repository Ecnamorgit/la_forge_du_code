import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { claimDailyMission, UserNotFoundError } from "@/lib/me-server";

/** Claim the once-per-day mission bonus. Idempotent on the server side. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const result = await claimDailyMission(session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Impossible de valider la mission du jour" },
      { status: 500 }
    );
  }
}
