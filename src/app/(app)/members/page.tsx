import Link from "next/link";
import { Search } from "lucide-react";
import { MemberCard } from "@/components/member-card";
import { requireViewer } from "@/lib/auth";
import { searchTerm } from "@/lib/queries";
import type { DirectoryProfile } from "@/lib/types";

const PAGE_SIZE = 24;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { supabase } = await requireViewer();
  const params = await searchParams;
  const q = searchTerm(params.q);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("member_directory")
    .select("id, handle, display_name, role_title, region, bio, avatar_url, community_role, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`display_name.ilike.%${q}%,handle.ilike.%${q}%`);
  }

  const { data, count } = await query;
  const members = (data ?? []) as DirectoryProfile[];
  const hasMore = (count ?? 0) > to + 1;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-ink">Members</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Find your people. Every role in funeral service is welcome here, from
          the front office to the crematory and everywhere between.
        </p>
      </header>

      <form className="card flex gap-2 p-3" action="/members">
        <label htmlFor="member-search" className="sr-only">
          Search members
        </label>
        <input
          id="member-search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or handle"
          className="field"
        />
        <button type="submit" className="btn btn-primary btn-sm shrink-0">
          <Search className="h-4 w-4" aria-hidden />
          Search
        </button>
      </form>

      {members.length === 0 ? (
        <div className="card p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">
            No members found
          </h2>
          <p className="mt-1 text-ink-soft">
            Try a different name, or invite a colleague to join EPIC.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      <nav className="flex items-center justify-between gap-3" aria-label="Member pages">
        {page > 1 ? (
          <Link
            href={`/members?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </Link>
        ) : (
          <span />
        )}
        {hasMore ? (
          <Link
            href={`/members?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className="btn btn-secondary btn-sm"
          >
            More members
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
