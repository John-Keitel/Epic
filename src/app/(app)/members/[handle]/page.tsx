import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { PostCard } from "@/components/post-card";
import { ReportForm } from "@/components/report-form";
import { blockMember } from "@/lib/actions";
import { requireViewer } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { getCommentCounts, getReactionSummaries } from "@/lib/queries";
import type { DirectoryProfile, Post } from "@/lib/types";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const { supabase, user } = await requireViewer();
  if (!user) return null;

  const { data: memberRaw } = await supabase
    .from("member_directory")
    .select(
      "id, handle, display_name, role_title, region, bio, avatar_url, community_role, created_at",
    )
    .eq("handle", handle)
    .maybeSingle();

  if (!memberRaw) notFound();
  const member = memberRaw as DirectoryProfile;
  const isSelf = member.id === user.id;

  const { data: postsRaw } = await supabase
    .from("posts")
    .select(
      `id, space_id, author_id, title, body, is_removed, created_at, updated_at,
       author:profiles!posts_author_id_fkey (id, handle, display_name, avatar_url),
       space:spaces (slug, name)`,
    )
    .eq("author_id", member.id)
    .eq("is_removed", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const posts = (postsRaw ?? []) as unknown as Post[];
  const postIds = posts.map((post) => post.id);
  const [reactions, commentCounts] = await Promise.all([
    getReactionSummaries(supabase, postIds, user.id),
    getCommentCounts(supabase, postIds),
  ]);

  return (
    <div className="space-y-5">
      <header className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={member.display_name} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-extrabold leading-tight text-ink">
              {member.display_name}
            </h1>
            <p className="text-sm font-bold text-ink-soft">@{member.handle}</p>
            {member.role_title ? (
              <p className="mt-1 font-semibold text-ink-soft">{member.role_title}</p>
            ) : null}
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-ink-soft/80">
              {member.region ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {member.region}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                Member since {timeAgo(member.created_at)}
              </span>
            </p>
          </div>

          {!isSelf ? (
            <div className="flex items-center gap-3">
              <form action={blockMember}>
                <input type="hidden" name="blocked_id" value={member.id} />
                <input type="hidden" name="path" value={`/members/${member.handle}`} />
                <button
                  type="submit"
                  className="text-xs font-bold text-ink-soft/70 hover:text-coral-dark"
                >
                  Block
                </button>
              </form>
              <ReportForm targetType="member" targetId={member.id} />
            </div>
          ) : (
            <Link href="/settings" className="btn btn-secondary btn-sm">
              Edit profile
            </Link>
          )}
        </div>

        {member.bio ? (
          <p className="mt-4 max-w-3xl whitespace-pre-wrap text-ink-soft">
            {member.bio}
          </p>
        ) : null}
      </header>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold text-ink">
          Recent posts
        </h2>

        {posts.length === 0 ? (
          <div className="card p-6 text-sm text-ink-soft">
            No posts yet. Say hello when you&apos;re ready.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                reactions={reactions.get(post.id) ?? []}
                commentCount={commentCounts.get(post.id) ?? 0}
                path={`/members/${member.handle}`}
                viewerId={user.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
