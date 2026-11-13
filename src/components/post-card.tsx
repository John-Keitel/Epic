import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { ReactionBar, type ReactionSummary } from "@/components/reaction-bar";
import { ReportForm } from "@/components/report-form";
import { blockMember } from "@/lib/actions";
import { timeAgo } from "@/lib/format";
import type { Post } from "@/lib/types";

export function PostCard({
  post,
  reactions,
  commentCount,
  path,
  viewerId,
}: {
  post: Post;
  reactions: ReactionSummary[];
  commentCount: number;
  path: string;
  viewerId: string;
}) {
  const author = post.author;

  return (
    <article className="card p-4 sm:p-5">
      <header className="flex items-center gap-3">
        <Avatar name={author?.display_name ?? "EPIC member"} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Link
              href={author ? `/members/${author.handle}` : "#"}
              className="font-display text-base font-bold text-ink hover:text-coral"
            >
              {author?.display_name ?? "Former member"}
            </Link>
            <span className="text-xs font-semibold text-ink-soft">
              {post.space ? (
                <Link href={`/spaces/${post.space.slug}`} className="hover:underline">
                  {post.space.name}
                </Link>
              ) : null}
              {" · "}
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>
      </header>

      <div className="mt-3">
        {post.title ? (
          <h3 className="font-display text-xl font-bold leading-snug text-ink">
            <Link href={`/posts/${post.id}`} className="hover:text-coral">
              {post.title}
            </Link>
          </h3>
        ) : null}
        <p className="mt-1 whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed text-ink-soft">
          {post.body}
        </p>
      </div>

      <footer className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line/70 pt-2">
        <ReactionBar postId={post.id} path={path} summary={reactions} />
        <Link
          href={`/posts/${post.id}`}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold text-ink-soft hover:bg-cream-deep hover:text-ink"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          {commentCount}
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {author && author.id !== viewerId ? (
            <form action={blockMember}>
              <input type="hidden" name="blocked_id" value={author.id} />
              <input type="hidden" name="path" value={path} />
              <button
                type="submit"
                className="text-xs font-bold text-ink-soft/70 hover:text-coral-dark"
              >
                Block
              </button>
            </form>
          ) : null}
          <ReportForm targetType="post" targetId={post.id} />
        </div>
      </footer>
    </article>
  );
}
