import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { createToken } from "@/lib/tokens";

const bodySchema = z.object({
  email: z.string().email().max(254),
});

/**
 * Always returns 200 — never leaks whether the email exists in the system.
 */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true },
  });

  // Only send if the user exists AND has a credentials-based password.
  if (user && user.password) {
    const token = await createToken({ userId: user.id, kind: "password_reset" });
    await sendPasswordResetEmail({ to: user.email, token }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
