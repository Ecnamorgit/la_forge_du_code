import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { UserNotFoundError, exportUserData } from "@/lib/me-server";

/** RGPD — export des données personnelles en JSON téléchargeable. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const data = await exportUserData(session.user.id);
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="codeforge-mes-donnees.json"',
      },
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }
}
