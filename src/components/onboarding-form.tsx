"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { completeOnboarding, type ActionResult } from "@/lib/actions";
import { ProfileFields } from "@/components/profile-fields";
import type { Profile } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full">
      {pending ? "Opening the door…" : "Step inside EPIC"}
    </button>
  );
}

export function OnboardingForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    completeOnboarding,
    null,
  );

  return (
    <form action={formAction} className="card space-y-4 p-5 sm:p-6">
      <ProfileFields defaults={profile} />

      <p className="rounded-xl bg-cream-deep px-3 py-2 text-xs leading-relaxed text-ink-soft">
        By stepping inside you agree to our{" "}
        <Link href="/guidelines" className="font-bold underline">
          community guidelines
        </Link>
        . Be kind, protect confidentiality, and keep EPIC free of sales pitches
        and politics.
      </p>

      {state?.error ? (
        <p role="alert" className="rounded-lg bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-dark">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
