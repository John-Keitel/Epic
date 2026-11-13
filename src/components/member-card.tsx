import Link from "next/link";
import { MapPin } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { DirectoryProfile } from "@/lib/types";

export function MemberCard({ member }: { member: DirectoryProfile }) {
  return (
    <Link
      href={`/members/${member.handle}`}
      className="card flex gap-3 p-4 transition hover:border-teal/60 hover:shadow-md"
    >
      <Avatar name={member.display_name} size="lg" />
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-bold leading-tight text-ink">
          {member.display_name}
        </p>
        <p className="text-xs font-semibold text-ink-soft">@{member.handle}</p>
        {member.role_title ? (
          <p className="mt-1 truncate text-sm font-semibold text-ink-soft">
            {member.role_title}
          </p>
        ) : null}
        {member.region ? (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft/80">
            <MapPin className="h-3 w-3" aria-hidden />
            {member.region}
          </p>
        ) : null}
        {member.bio ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft/90">
            {member.bio}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
