"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Coffee,
  Home,
  Settings,
  Shield,
  Users,
  Compass,
} from "lucide-react";
import type { Profile } from "@/lib/types";

const DESKTOP = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/spaces", label: "Spaces", icon: Compass },
  { href: "/members", label: "Members", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/spaces", label: "Spaces", icon: Compass },
  { href: "/members", label: "Members", icon: Users },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Me", icon: Settings },
];

export function AppNav({
  profile,
  unreadCount,
}: {
  profile: Profile;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const isStaff = profile.community_role === "moderator" || profile.community_role === "admin";

  const active = (href: string) =>
    href === "/home" ? pathname === "/home" : pathname.startsWith(href);

  return (
    <>
      <nav aria-label="Community" className="hidden flex-col gap-1 md:flex">
        {DESKTOP.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              active(href)
                ? "bg-ink text-cream"
                : "text-ink-soft hover:bg-cream-deep hover:text-ink"
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </span>
            {href === "/notifications" && unreadCount > 0 ? (
              <span className="rounded-full bg-coral px-2 py-0.5 text-xs font-extrabold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Link>
        ))}

        {isStaff ? (
          <Link
            href="/admin"
            className={`mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              active("/admin")
                ? "bg-coral text-white"
                : "text-coral hover:bg-coral/10"
            }`}
          >
            <Shield className="h-5 w-5" aria-hidden />
            Moderation
          </Link>
        ) : null}
      </nav>

      <nav
        aria-label="Community"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-cream/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {MOBILE.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold ${
              active(href) ? "text-coral" : "text-ink-soft"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
            {href === "/notifications" && unreadCount > 0 ? (
              <span className="absolute right-1/4 top-1 h-2 w-2 rounded-full bg-coral" />
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="hidden md:block">
        <Link
          href={`/members/${profile.handle}`}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink-soft hover:bg-cream-deep"
        >
          <Coffee className="h-4 w-4" aria-hidden />
          @{profile.handle}
        </Link>
      </div>
    </>
  );
}
