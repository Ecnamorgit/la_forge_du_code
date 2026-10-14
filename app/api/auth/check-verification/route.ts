import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { isAccountLocked, dummyHash, recordLoginFailure } from "@/lib/login-guard";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { crossOriginRefusal } from "@/lib/same-origin";

const bodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  const rejection = crossOriginRefusal(req);
  if (rejection) return rejection;

  // Same counter as login: this route confirms a correct password, and a
  // separate counter would double the brute-force budget.
  const limit = await rateLimit(`login:${getClientIp(req)}`, {
    limit: 10,
    windowMs: 5 * 60 * 1000,
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

  // Same per-account lock as login (audit SRV-07); otherwise this route would
  // allow trying passwords against a locked account.
  if (await isAccountLocked(email)) {
    await bcrypt.compare(password, await dummyHash());
    return NextResponse.json({ unverified: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { password: true, emailVerified: true },
  });

  if (!user || !user.password) {
    // Dummy comparison: the response time does not reveal whether the
    // address exists.
    await bcrypt.compare(password, await dummyHash());
    return NextResponse.json({ unverified: false });
  }

  const passOk = await bcrypt.compare(password, user.password);
  if (!passOk) {
    // The login page calls this route after a failure already counted by
    // `authorize`: only count the case where the response reveals something
    // (unverified account).
    if (!user.emailVerified) await recordLoginFailure(email);
    return NextResponse.json({ unverified: false });
  }

  return NextResponse.json({ unverified: !user.emailVerified });
}
