import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { SpaceIcon } from "@/components/space-icon";
import { requireViewer } from "@/lib/auth";
import { getCommentCounts, getReactionSummaries } from "@/lib/queries";
import type { Post, Space } from "@/lib/types";

const PAGE_SIZE = 10;

const POST_SELECT = `
  id, space_id, author_id, title, body, is_removed, created_at, updated_at,
  author:profiles!posts_author_id_fkey (id, handle, display_name, avatar_url),
  space:spaces (slug, name)
`;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { supabase, user, profile } = await requireViewer();
  if (!user || !profile) return null;

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: spaces } = await supabase
    .from("spaces")
    .select("id, slug, name, description, icon, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order");

  const frontPorch = (spaces as Space[] | null)?.find(
    (space) => space.slug === "front-porch",
  );

  const { data: postsRaw, count } = await supabase
    .from("posts")
    .select(POST_SELECT, { count: "exact" })
    .eq("is_removed", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  const posts = (postsRaw ?? []) as unknown as Post[];
  const postIds = posts.map((post) => post.id);
  const [reactions, commentCounts] = await Promise.all([
    getReactionSummaries(supabase, postIds, user.id),
    getCommentCounts(supabase, postIds),
  ]);

  const firstName = profile.display_name.split(" ")[0];
  const hasOlder = (count ?? 0) > to + 1;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Good to see you, {firstName}
          </h1>
          <p className="mt-1 text-ink-soft">
            The porch light is on. Here&apos;s what the community is talking about.
          </p>
        </div>
        <Link href="/spaces" className="btn btn-secondary btn-sm">
          All spaces <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(spaces as Space[] | null)?.map((space) => (
          <Link
            key={space.id}
            href={`/spaces/${space.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-bold text-ink-soft hover:border-teal hover:text-ink"
          >
            <SpaceIcon icon={space.icon} className="h-3.5 w-3.5" />
            {space.name}
          </Link>
        ))}
      </div>

      {frontPorch && profile.status === "active" ? (
        <PostComposer
          spaceId={frontPorch.id}
          spaceSlug={frontPorch.slug}
          spaceName={frontPorch.name}
        />
      ) : (
        <div className="card p-4 text-sm font-semibold text-ink-soft">
          Your membership is not active yet, so posting is paused. You can still
          read the community.
        </div>
      )}

      {posts.length === 0 ? (
        <div className="card p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-sun" aria-hidden />
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">
            The first chair is yours
          </h2>
          <p className="mt-1 text-ink-soft">
            Nothing has been posted yet. Say hello on the Front Porch.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              reactions={reactions.get(post.id) ?? []}
              commentCount={commentCounts.get(post.id) ?? 0}
              path="/home"
              viewerId={user.id}
            />
          ))}
        </div>
      )}

      <nav className="flex items-center justify-between gap-3" aria-label="Feed pages">
        {page > 1 ? (
          <Link href={`/home?page=${page - 1}`} className="btn btn-secondary btn-sm">
            Newer
          </Link>
        ) : (
          <span />
        )}
        <span className="text-xs font-bold uppercase tracking-wide text-ink-soft/70">
          Page {page}
        </span>
        {hasOlder ? (
          <Link href={`/home?page=${page + 1}`} className="btn btn-secondary btn-sm">
            Older
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
