import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { SpaceIcon } from "@/components/space-icon";
import { requireViewer } from "@/lib/auth";
import { getCommentCounts, getReactionSummaries } from "@/lib/queries";
import type { Post, Space } from "@/lib/types";

const POST_SELECT = `
  id, space_id, author_id, title, body, is_removed, created_at, updated_at,
  author:profiles!posts_author_id_fkey (id, handle, display_name, avatar_url),
  space:spaces (slug, name)
`;

export default async function SpacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { supabase, user, profile } = await requireViewer();
  if (!user || !profile) return null;

  const { data: spaceRaw } = await supabase
    .from("spaces")
    .select("id, slug, name, description, icon, sort_order, is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (!spaceRaw) notFound();
  const space = spaceRaw as Space;

  const { data: postsRaw } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("space_id", space.id)
    .eq("is_removed", false)
    .order("created_at", { ascending: false })
    .limit(30);

  const posts = (postsRaw ?? []) as unknown as Post[];
  const postIds = posts.map((post) => post.id);
  const [reactions, commentCounts] = await Promise.all([
    getReactionSummaries(supabase, postIds, user.id),
    getCommentCounts(supabase, postIds),
  ]);

  return (
    <div className="space-y-5">
      <Link
        href="/spaces"
        className="inline-flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All spaces
      </Link>

      <header className="card flex items-start gap-4 p-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal ring-4 ring-teal/10">
          <SpaceIcon icon={space.icon} className="h-7 w-7" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            {space.name}
          </h1>
          <p className="mt-1 max-w-2xl text-ink-soft">{space.description}</p>
        </div>
      </header>

      {profile.status === "active" ? (
        <PostComposer
          spaceId={space.id}
          spaceSlug={space.slug}
          spaceName={space.name}
        />
      ) : (
        <div className="card p-4 text-sm font-semibold text-ink-soft">
          Posting is paused while your membership status is reviewed.
        </div>
      )}

      {posts.length === 0 ? (
        <div className="card p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">
            Start the conversation
          </h2>
          <p className="mt-1 text-ink-soft">
            This room is quiet. You could be the first to say something worth
            gathering around.
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
              path={`/spaces/${space.slug}`}
              viewerId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
