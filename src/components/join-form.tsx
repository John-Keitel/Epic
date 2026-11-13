"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COMMUNITY_ROLES } from "@/lib/constants";
import { slugifyHandle } from "@/lib/format";

export function JoinForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("display_name") ?? "").trim();
    const handle = slugifyHandle(String(form.get("handle") ?? ""));
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const roleTitle = String(form.get("role_title") ?? "");
    const region = String(form.get("region") ?? "").trim();

    if (displayName.length < 1) {
      setError("Tell us the name you'd like to go by.");
      return;
    }
    if (handle.length < 3) {
      setError("Your handle needs at least 3 letters or numbers.");
      return;
    }
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
        data: {
          handle,
          display_name: displayName,
          role_title: roleTitle,
          region,
        },
      },
    });
    setPending(false);

    if (authError) {
      setError(
        authError.message.includes("already registered")
          ? "That email already has an EPIC account. Try signing in instead."
          : authError.message,
      );
      return;
    }

    if (data.session) {
      router.push("/welcome");
      router.refresh();
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">
          Check your email
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          We sent you a confirmation link. Open it to finish joining EPIC, then
          you&apos;ll be able to introduce yourself on the Front Porch.
        </p>
        <Link href="/login" className="btn btn-secondary mt-5">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="display_name" className="field-label">
            Name you go by
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            maxLength={60}
            autoComplete="name"
            className="field"
            placeholder="Jasmine R."
          />
        </div>
        <div>
          <label htmlFor="handle" className="field-label">
            Handle
          </label>
          <div className="flex items-center rounded-[0.85rem] border-[1.5px] border-line bg-white pl-3 focus-within:border-teal focus-within:ring-[3px] focus-within:ring-teal/20">
            <span className="text-ink-soft">@</span>
            <input
              id="handle"
              name="handle"
              required
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9_]{3,30}"
              title="3–30 letters, numbers, or underscores"
              className="w-full rounded-r-[0.85rem] bg-transparent px-2 py-2.5 outline-none"
              placeholder="jasmine_r"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="role_title" className="field-label">
            What do you do? <span className="font-normal normal-case">(optional)</span>
          </label>
          <select id="role_title" name="role_title" className="field" defaultValue="">
            <option value="">Prefer not to say</option>
            {COMMUNITY_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="region" className="field-label">
            Region <span className="font-normal normal-case">(optional)</span>
          </label>
          <input
            id="region"
            name="region"
            maxLength={80}
            className="field"
            placeholder="Ohio, or just “Midwest”"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
          placeholder="At least 8 characters"
        />
      </div>

      <label className="flex items-start gap-3 text-sm font-semibold text-ink-soft">
        <input type="checkbox" name="agree" required className="mt-1 h-4 w-4 accent-[#ef5a4d]" />
        <span>
          I agree to the{" "}
          <Link href="/guidelines" className="underline">
            community guidelines
          </Link>{" "}
          and privacy approach. I understand EPIC is free, non-commercial, and
          non-political.
        </span>
      </label>

      {error ? (
        <p role="alert" className="rounded-lg bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-dark">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Opening the door…" : "Join EPIC"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        Already a member?{" "}
        <Link href="/login" className="font-bold underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
