import AuthSessionProvider from "@/components/auth/SessionProvider";

/**
 * Sections that read the session on the client (`useSession`, through
 * `lib/use-user.ts` and `lib/user-context.tsx`). The route group does not
 * change any URL. Public pages (landing, codex, sign-in, sign-up, share)
 * live outside it, so they ship neither the next-auth client nor the
 * `/api/auth/session` request.
 */
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
