import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});


export async function POST(req: Request) {

  const limit = await rateLimit(`checkverif:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 5 * 60 * 1000, // 10 tentatives / 5 min / IP
  });
  if (!limit.ok) return NextResponse.json({ unverified: false });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ unverified: false });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ unverified: false });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { password: true, emailVerified: true },
  });

  if (!user || !user.password) {
    return NextResponse.json({ unverified: false });
  }

  const passOk = await bcrypt.compare(password, user.password);
  if (!passOk) {
    return NextResponse.json({ unverified: false });
  }

  return NextResponse.json({ unverified: !user.emailVerified });
}
