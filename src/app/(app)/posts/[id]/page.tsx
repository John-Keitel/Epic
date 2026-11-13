import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { CommentForm } from "@/components/comment-form";
import { ReactionBar } from "@/components/reaction-bar";
import { ReportForm } from "@/components/report-form";
import { blockMember } from "@/lib/actions";
import { requireViewer } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { getReactionSummaries } from "@/lib/queries";
import type { Comment, Post } from "@/lib/types";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user, profile } = await requireViewer();
  if (!user || !profile) return null;

  const { data: postRaw } = await supabase
    .from("posts")
    .select(
      `id, space_id, author_id, title, body, is_removed, created_at, updated_at,
       author:profiles!posts_author_id_fkey (id, handle, display_name, avatar_url),
       space:spaces (slug, name)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!postRaw) notFound();
  const post = postRaw as unknown as Post;
  if (post.is_removed) notFound();

  const { data: commentsRaw } = await supabase
    .from("comments")
    .select(
      `id, post_id, author_id, body, is_removed, created_at,
       author:profiles!comments_author_id_fkey (id, handle, display_name, avatar_url)`,
    )
    .eq("post_id", id)
    .eq("is_removed", false)
    .order("created_at", { ascending: true });

  const comments = (commentsRaw ?? []) as unknown as Comment[];
  const reactions = await getReactionSummaries(supabase, [post.id], user.id);
  const path = `/posts/${post.id}`;
  const author = post.author;

  return (
    <div className="space-y-4">
      <Link
        href={post.space ? `/spaces/${post.space.slug}` : "/home"}
        className="inline-flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {post.space?.name ?? "Back to home"}
      </Link>

      <article className="card p-5 sm:p-6">
        <header className="flex items-center gap-3">
          <Avatar name={author?.display_name ?? "EPIC member"} size="lg" />
          <div>
            <Link
              href={author ? `/members/${author.handle}` : "#"}
              className="font-display text-xl font-bold text-ink hover:text-coral"
            >
              {author?.display_name ?? "Former member"}
            </Link>
            <p className="text-sm text-ink-soft">
              {author ? `@${author.handle}` : ""}
            </p>
            <p className="text-xs font-semibold text-ink-soft/70">
              {timeAgo(post.created_at)}
              {post.space ? (
                <>
                  {" · "}
                  <Link href={`/spaces/${post.space.slug}`} className="hover:underline">
                    {post.space.name}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
        </header>

        {post.title ? (
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-ink">
            {post.title}
          </h1>
        ) : null}
        <p className="mt-3 whitespace-pre-wrap break-words text-lg leading-relaxed text-ink-soft">
          {post.body}
        </p>

        <footer className="mt-5 flex flex-wrap items-center gap-4 border-t border-line/70 pt-3">
          <ReactionBar
            postId={post.id}
            path={path}
            summary={reactions.get(post.id) ?? []}
          />
          <div className="ml-auto flex items-center gap-4">
            {author && author.id !== user.id ? (
              <form action={blockMember}>
                <input type="hidden" name="blocked_id" value={author.id} />
                <input type="hidden" name="path" value={path} />
                <button
                  type="submit"
                  className="text-xs font-bold text-ink-soft/70 hover:text-coral-dark"
                >
                  Block {author.display_name.split(" ")[0]}
                </button>
              </form>
            ) : null}
            <ReportForm targetType="post" targetId={post.id} />
          </div>
        </footer>
      </article>

      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold text-ink">
          {comments.length === 0
            ? "No replies yet"
            : `${comments.length} ${comments.length === 1 ? "reply" : "replies"}`}
        </h2>

        <ol className="mt-4 space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar name={comment.author?.display_name ?? "EPIC member"} size="sm" />
              <div className="min-w-0 flex-1 rounded-2xl bg-cream/70 px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <Link
                    href={
                      comment.author ? `/members/${comment.author.handle}` : "#"
                    }
                    className="text-sm font-bold text-ink hover:text-coral"
                  >
                    {comment.author?.display_name ?? "Former member"}
                  </Link>
                  <span className="text-xs font-semibold text-ink-soft/70">
                    {timeAgo(comment.created_at)}
                  </span>
                  <span className="ml-auto flex items-center gap-3">
                    {comment.author && comment.author.id !== user.id ? (
                      <form action={blockMember}>
                        <input
                          type="hidden"
                          name="blocked_id"
                          value={comment.author.id}
                        />
                        <input type="hidden" name="path" value={path} />
                        <button
                          type="submit"
                          className="text-[11px] font-bold text-ink-soft/60 hover:text-coral-dark"
                        >
                          Block
                        </button>
                      </form>
                    ) : null}
                    <ReportForm targetType="comment" targetId={comment.id} />
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-soft">
                  {comment.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {profile.status === "active" ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="mt-4 text-sm font-semibold text-ink-soft">
            Replying is paused while your membership status is reviewed.
          </p>
        )}
      </section>
    </div>
  );
}
