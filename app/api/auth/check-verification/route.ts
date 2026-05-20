import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";

const bodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

/**
 * Follow-up endpoint called by /login when signIn() fails. Returns
 * { unverified: true } iff the credentials are valid AND emailVerified is null.
 * This is no less safe than signIn itself — same data leaks. Lets us show
 * "your email is not verified — resend?" instead of generic "invalid credentials"
 * when the password is right but the email pending.
 */
export async function POST(req: Request) {
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
