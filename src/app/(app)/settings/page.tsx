import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { ProfileForm } from "@/components/profile-form";
import { SignOutButton } from "@/components/sign-out-button";
import { unblockMember } from "@/lib/actions";
import { requireViewer } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export default async function SettingsPage() {
  const { supabase, user, profile } = await requireViewer();
  if (!user || !profile) return null;

  const { data: blockedRows } = await supabase
    .from("blocked_members")
    .select("blocked_id, created_at")
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  const blockedIds = (blockedRows ?? []).map((row) => row.blocked_id);
  let blockedProfiles: Pick<Profile, "id" | "handle" | "display_name">[] = [];

  if (blockedIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, handle, display_name")
      .in("id", blockedIds);
    blockedProfiles = data ?? [];
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-ink">Settings</h1>
        <p className="mt-1 text-ink-soft">
          You control what other members see. Hidden fields are never exposed to
          them.
        </p>
      </header>

      <ProfileForm profile={profile} />

      <section className="card p-5">
        <h2 className="font-display text-xl font-bold text-ink">Blocked members</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Blocking hides their posts and replies from you. They are not notified.
        </p>

        {blockedProfiles.length === 0 ? (
          <p className="mt-3 text-sm font-semibold text-ink-soft/70">
            You haven&apos;t blocked anyone.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {blockedProfiles.map((member) => (
              <li key={member.id} className="flex items-center gap-3 py-2">
                <Avatar name={member.display_name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">
                    {member.display_name}
                  </span>
                  <span className="block text-xs text-ink-soft">@{member.handle}</span>
                </span>
                <form action={unblockMember}>
                  <input type="hidden" name="blocked_id" value={member.id} />
                  <button type="submit" className="btn btn-ghost btn-sm text-coral">
                    Unblock
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-display text-xl font-bold text-ink">Account</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Signed in as <span className="font-bold text-ink">{user.email}</span>
        </p>
        <p className="mt-1 text-xs text-ink-soft/80">
          To download your data, deactivate, or request deletion, use the contact
          route on the{" "}
          <Link href="/help" className="underline">
            Help page
          </Link>
          . We keep sensitive personal information to a minimum.
        </p>
        <div className="mt-3">
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
