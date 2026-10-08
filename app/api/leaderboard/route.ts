import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const TOP_LIMIT = 50;

export interface LeaderboardEntry {
  rank: number;
  username: string;
  totalXp: number;
  streak: number;
  badges: number;
  isMe: boolean;
}

export interface LeaderboardResponse {
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const top = await prisma.user.findMany({
    where: { emailVerified: { not: null } },
    select: {
      id: true,
      username: true,
      totalXp: true,
      streak: true,
      _count: { select: { badges: true } },
    },
    orderBy: [{ totalXp: "desc" }, { username: "asc" }],
    take: TOP_LIMIT,
  });

  const myId = session.user.id;
  const topMapped: LeaderboardEntry[] = top.map((u, i) => ({
    rank: i + 1,
    username: u.username,
    totalXp: u.totalXp,
    streak: u.streak,
    badges: u._count.badges,
    isMe: u.id === myId,
  }));

  // Hors du top, l'utilisateur est chargé à part avec son rang global.
  let me: LeaderboardEntry | null = topMapped.find((e) => e.isMe) ?? null;
  if (!me) {
    const myRow = await prisma.user.findUnique({
      where: { id: myId },
      select: {
        username: true,
        totalXp: true,
        streak: true,
        _count: { select: { badges: true } },
      },
    });
    if (myRow) {
      const above = await prisma.user.count({
        where: {
          emailVerified: { not: null },
          OR: [
            { totalXp: { gt: myRow.totalXp } },
            {
              totalXp: myRow.totalXp,
              username: { lt: myRow.username },
            },
          ],
        },
      });
      me = {
        rank: above + 1,
        username: myRow.username,
        totalXp: myRow.totalXp,
        streak: myRow.streak,
        badges: myRow._count.badges,
        isMe: true,
      };
    }
  }

  const body: LeaderboardResponse = { top: topMapped, me };
  return NextResponse.json(body);
}
