import { handlers } from "@/auth";

// Skip Next's static path generation for this catch-all auth route. Without
// this, Next 16 tries to pre-collect params and triggers a TypeError inside
// NextAuth/Prisma adapter ("Cannot read properties of undefined (reading
// 'definition')") in dev. This route is always dynamic anyway.
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
