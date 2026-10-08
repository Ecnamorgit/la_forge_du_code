import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** Sonde de santé : `200` si la base répond, `503` sinon. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "up" });
  } catch (err) {
    logger.error("healthcheck_db_unreachable", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { status: "error", db: "down" },
      { status: 503 }
    );
  }
}
