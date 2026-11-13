"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Flag } from "lucide-react";
import { reportContent, type ActionResult } from "@/lib/actions";
import { REPORT_REASONS } from "@/lib/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-secondary btn-sm">
      {pending ? "Sending…" : "Send report"}
    </button>
  );
}

export function ReportForm({
  targetType,
  targetId,
}: {
  targetType: "post" | "comment" | "member";
  targetId: string;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    reportContent,
    null,
  );

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-bold text-ink-soft/80 hover:text-coral">
        <Flag className="h-3.5 w-3.5" aria-hidden />
        Report
      </summary>

      <form action={formAction} className="card mt-2 space-y-2 p-3">
        <input type="hidden" name="target_type" value={targetType} />
        <input type="hidden" name="target_id" value={targetId} />

        <label className="field-label" htmlFor={`reason-${targetId}`}>
          What&apos;s wrong?
        </label>
        <select
          id={`reason-${targetId}`}
          name="reason"
          required
          className="field text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Choose a reason
          </option>
          {REPORT_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>

        <textarea
          name="details"
          rows={2}
          maxLength={1000}
          placeholder="Anything a moderator should know (optional)"
          className="field text-sm"
        />

        <SubmitButton />

        {state?.error ? (
          <p role="alert" className="text-sm font-semibold text-coral-dark">
            {state.error}
          </p>
        ) : null}
        {state?.success ? (
          <p role="status" className="text-sm font-semibold text-teal">
            {state.success}
          </p>
        ) : null}
      </form>
    </details>
  );
}
