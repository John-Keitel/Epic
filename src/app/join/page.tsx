import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { JoinForm } from "@/components/join-form";

export const metadata: Metadata = {
  title: "Join EPIC",
};

export default function JoinPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl flex-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:pt-8">
          <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            Pull up a chair.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            EPIC is a free community for everyone who works in and around funeral
            service. No title, employer, or career status makes anyone more
            important than anyone else.
          </p>
          <ul className="mt-6 space-y-3 text-sm font-semibold text-ink-soft">
            <li className="rounded-xl bg-white/70 p-3 ring-1 ring-line">
              Free to join, with no paywall for ordinary participation.
            </li>
            <li className="rounded-xl bg-white/70 p-3 ring-1 ring-line">
              No vendor advertising, solicitation, or sponsored feed placements.
            </li>
            <li className="rounded-xl bg-white/70 p-3 ring-1 ring-line">
              Non-political, non-lobbying, and serious about member privacy.
            </li>
          </ul>
          <p className="mt-6 text-sm text-ink-soft">
            Already a member?{" "}
            <Link href="/login" className="font-bold underline">
              Sign in
            </Link>
            .
          </p>
        </div>

        <JoinForm />
      </main>
    </>
  );
}
