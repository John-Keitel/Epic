"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPost, type ActionResult } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
      {pending ? "Posting…" : "Share with EPIC"}
    </button>
  );
}

export function PostComposer({
  spaceId,
  spaceSlug,
  spaceName,
}: {
  spaceId: string;
  spaceSlug: string;
  spaceName: string;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    createPost,
    null,
  );

  return (
    <form action={formAction} className="card p-4">
      <input type="hidden" name="space_id" value={spaceId} />
      <input type="hidden" name="space_slug" value={spaceSlug} />

      <label htmlFor={`post-title-${spaceSlug}`} className="field-label">
        Title <span className="font-normal normal-case">(optional)</span>
      </label>
      <input
        id={`post-title-${spaceSlug}`}
        name="title"
        maxLength={120}
        placeholder="Give it a short headline"
        className="field mb-3"
      />

      <label htmlFor={`post-body-${spaceSlug}`} className="field-label">
        What&apos;s on your mind in {spaceName}?
      </label>
      <textarea
        id={`post-body-${spaceSlug}`}
        name="body"
        required
        minLength={2}
        maxLength={5000}
        rows={4}
        placeholder="Share a question, a story, or a small win. Real people are listening."
        className="field resize-y"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-xs leading-relaxed text-ink-soft/80">
          Please don&apos;t share names, photos, or identifying details about
          families or the people you serve.
        </p>
        <SubmitButton />
      </div>

      {state?.error ? (
        <p role="alert" className="mt-3 rounded-lg bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-dark">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
