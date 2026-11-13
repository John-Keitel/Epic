import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Community guidelines",
};

export default function GuidelinesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <header className="mb-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-teal">
            About EPIC
          </p>
          <h1 className="mt-1 font-display text-4xl font-extrabold text-ink">
            Community guidelines
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-ink-soft">
            EPIC is a clubhouse for people who work in funeral service. It is
            free, independent, non-commercial, and non-political. These
            guidelines protect the trust that makes it worth showing up.
          </p>
        </header>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-display text-2xl font-bold text-ink">
              People and relationships first
            </h2>
            <ul className="mt-3 space-y-2 text-ink-soft">
              <li>Treat every member with respect, regardless of title or role.</li>
              <li>
                No sales pitches, vendor advertising, solicitation, or
                pay-to-play visibility.
              </li>
              <li>
                No political campaigns, partisan debates, or lobbying. EPIC is
                not the place for that work.
              </li>
              <li>
                Disagree with ideas, not people. Harassment, threats, and
                personal attacks are not welcome.
              </li>
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-2xl font-bold text-ink">
              Protect families and confidential information
            </h2>
            <ul className="mt-3 space-y-2 text-ink-soft">
              <li>
                Do not share names, photos, case details, or identifying stories
                about deceased persons or families without appropriate authority
                and consent.
              </li>
              <li>
                Do not post confidential business information or anything that
                could identify a family you serve.
              </li>
              <li>
                Ask: would the family recognize themselves here? If so, don&apos;t
                post it. Share the lesson, not the case.
              </li>
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-2xl font-bold text-ink">
              Useful conversations
            </h2>
            <ul className="mt-3 space-y-2 text-ink-soft">
              <li>Ask real questions. Share what actually helped.</li>
              <li>
                No spam, misleading claims, or unsafe advice presented as
                professional, legal, clinical, or regulatory guidance.
              </li>
              <li>
                If a conversation turns urgent or unsafe, report it. Moderators
                can act quickly.
              </li>
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-2xl font-bold text-ink">
              Privacy and safety
            </h2>
            <ul className="mt-3 space-y-2 text-ink-soft">
              <li>
                Member content is private to signed-in members and is not indexed
                by public search engines.
              </li>
              <li>
                You choose which profile fields other members can see. Hidden
                fields are never exposed.
              </li>
              <li>
                Report a post, reply, or member using the Report control. Block
                anyone you do not want to interact with.
              </li>
              <li>
                For threats, harassment, doxxing, or urgent privacy concerns, use
                the contact route on the{" "}
                <Link href="/help" className="underline">
                  Help page
                </Link>
                .
              </li>
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-2xl font-bold text-ink">
              How moderation works
            </h2>
            <p className="mt-2 leading-relaxed text-ink-soft">
              Reports go to a moderation queue. A moderator reviews the content
              in context and may hide or remove it, warn or restrict an account,
              or take no action. Actions are recorded with a reason. Moderation
              exists to protect a welcoming, confidential community, not to
              police personality.
            </p>
            <p className="mt-2 leading-relaxed text-ink-soft">
              Access levels are enforced on the server: guest, pending member,
              active member, moderator, and administrator. A member is never
              treated as less important because of a job title.
            </p>
          </section>

          <section className="card border-coral/40 bg-coral/[0.04] p-5">
            <h2 className="font-display text-2xl font-bold text-ink">
              The short version
            </h2>
            <p className="mt-2 text-lg font-semibold leading-relaxed text-ink">
              Be kind. Protect families. Share what helps. No selling, no
              politics, no jerks. Everyone belongs.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/join" className="btn btn-primary">
                Join EPIC
              </Link>
              <Link href="/help" className="btn btn-secondary">
                Get help
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
