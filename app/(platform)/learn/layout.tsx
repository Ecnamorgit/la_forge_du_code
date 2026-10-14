import { UserProvider } from "@/lib/user-context";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
