import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireViewer } from "@/lib/auth";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user, profile } = await requireViewer();

  if (!user) redirect("/login");
  if (!profile) redirect("/welcome");

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <AppShell profile={profile} unreadCount={count ?? 0}>
      {children}
    </AppShell>
  );
}
