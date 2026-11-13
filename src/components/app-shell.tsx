import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { AppNav } from "@/components/app-nav";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import type { Profile } from "@/lib/types";

export function AppShell({
  profile,
  unreadCount,
  children,
}: {
  profile: Profile;
  unreadCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Logo href="/home" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-bold text-ink-soft sm:block">
              You belong here.
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-28 pt-6 sm:px-6 md:pb-10">
        <aside className="w-full md:w-60 md:shrink-0">
          <div className="card mb-4 hidden p-4 md:block">
            <Link
              href={`/members/${profile.handle}`}
              className="flex items-center gap-3"
            >
              <Avatar name={profile.display_name} />
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-bold leading-tight text-ink">
                  {profile.display_name}
                </span>
                <span className="block truncate text-xs font-semibold text-ink-soft">
                  @{profile.handle}
                </span>
              </span>
            </Link>
            {profile.community_role !== "member" ? (
              <span className="mt-3 inline-flex rounded-full bg-teal/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-teal">
                {profile.community_role}
              </span>
            ) : null}
          </div>

          <AppNav profile={profile} unreadCount={unreadCount} />

          <p className="mt-6 hidden text-xs leading-relaxed text-ink-soft/80 md:block">
            EPIC is free, non-commercial, and non-political. Be kind. Protect
            families and each other.
          </p>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
