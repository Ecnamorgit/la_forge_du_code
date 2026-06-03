import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { UserNotFoundError, setAvatar } from "@/lib/me-server";
import { isRoleId, isSpeciesId, isUniformColorId } from "@/lib/avatar";

const bodySchema = z
  .object({
    species: z.string().min(1).max(32),
    uniformColor: z.string().min(1).max(32),
    role: z.string().min(1).max(32),
  })
  .refine((data) => isSpeciesId(data.species), {
    message: "Espece invalide",
    path: ["species"],
  })
  .refine((data) => isUniformColorId(data.uniformColor), {
    message: "Couleur d'uniforme invalide",
    path: ["uniformColor"],
  })
  .refine((data) => isRoleId(data.role), {
    message: "Role invalide",
    path: ["role"],
  });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  try {
    const state = await setAvatar(session.user.id, parsed.data);
    return NextResponse.json(state);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }
}
