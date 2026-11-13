"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, type ActionResult } from "@/lib/actions";
import { ProfileFields } from "@/components/profile-fields";
import type { Profile } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending ? "Saving…" : "Save profile"}
    </button>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    updateProfile,
    null,
  );

  return (
    <form action={formAction} className="card space-y-4 p-5 sm:p-6">
      <div>
        <span className="field-label">Handle</span>
        <p className="rounded-[0.85rem] border border-line bg-cream/60 px-3 py-2 text-sm font-bold text-ink-soft">
          @{profile.handle}
        </p>
        <p className="mt-1 text-xs text-ink-soft/80">
          Handles are permanent for now. Contact a moderator if you need it
          changed.
        </p>
      </div>

      <ProfileFields defaults={profile} />

      {state?.error ? (
        <p role="alert" className="rounded-lg bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-dark">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p role="status" className="rounded-lg bg-teal/10 px-3 py-2 text-sm font-semibold text-teal">
          {state.success}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
