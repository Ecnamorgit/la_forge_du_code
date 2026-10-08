import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";
import { isTrackEvent } from "@/lib/track";

export async function POST(req: Request) {
  const refus = crossOriginRefusal(req);
  if (refus) return refus;

  // Sans limite, le compteur est trivialement falsifiable.
  const limit = await rateLimit(`track:${getClientIp(req)}`, {
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const name = (raw as { name?: unknown } | null)?.name;
  if (!isTrackEvent(name)) {
    return NextResponse.json({ error: "Évènement inconnu" }, { status: 400 });
  }

  try {
    await prisma.trackEvent.create({ data: { name } });
  } catch (err) {
    // Un échec de comptage n'est pas remonté au client.
    logger.warn("track_write_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
  }

  return new NextResponse(null, { status: 204 });
}
