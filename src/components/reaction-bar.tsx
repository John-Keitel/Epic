"use client";

import { useFormStatus } from "react-dom";
import { toggleReaction } from "@/lib/actions";
import { REACTION_META, type ReactionKind } from "@/lib/types";

export interface ReactionSummary {
  kind: ReactionKind;
  count: number;
  mine: boolean;
}

function ReactionButton({
  postId,
  kind,
  count,
  mine,
  path,
}: ReactionSummary & { postId: string; path: string }) {
  const { pending } = useFormStatus();
  const meta = REACTION_META[kind];

  return (
    <form action={toggleReaction}>
      <input type="hidden" name="post_id" value={postId} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="path" value={path} />
      <button
        type="submit"
        disabled={pending}
        aria-pressed={mine}
        aria-label={`${meta.label} (${count})`}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold transition ${
          mine
            ? "bg-coral/10 text-coral"
            : "text-ink-soft hover:bg-cream-deep hover:text-ink"
        }`}
      >
        <span aria-hidden>{meta.emoji}</span>
        <span>{count}</span>
      </button>
    </form>
  );
}

export function ReactionBar({
  postId,
  path,
  summary,
}: {
  postId: string;
  path: string;
  summary: ReactionSummary[];
}) {
  return (
    <div className="flex items-center gap-1">
      {summary.map((item) => (
        <ReactionButton key={item.kind} postId={postId} path={path} {...item} />
      ))}
    </div>
  );
}
