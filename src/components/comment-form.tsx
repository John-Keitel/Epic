"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addComment, type ActionResult } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-secondary btn-sm">
      {pending ? "Sending…" : "Reply"}
    </button>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    addComment,
    null,
  );

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="post_id" value={postId} />
      <label htmlFor="new-comment" className="field-label">
        Add a reply
      </label>
      <textarea
        id="new-comment"
        name="body"
        required
        maxLength={2000}
        rows={3}
        placeholder="Be warm, be useful, be yourself."
        className="field resize-y"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-ink-soft/80">
          No case details or identifying information.
        </span>
        <SubmitButton />
      </div>
      {state?.error ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-coral-dark">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p role="status" className="mt-2 text-sm font-semibold text-teal">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
