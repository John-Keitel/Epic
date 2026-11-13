import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Help",
};

const FAQ = [
  {
    question: "Is EPIC really free?",
    answer:
      "Yes. Ordinary participation is free and there is no paywall. EPIC has no vendor advertising, sponsored feed placements, or sale of member information.",
  },
  {
    question: "Who can join?",
    answer:
      "Current and retired funeral service workers and students in the profession. Every role is welcome: funeral directors, embalmers, arrangers, removal and crematory staff, administrative teams, owners, vendors who serve the profession, and educators. Final eligibility and verification details are confirmed before onboarding.",
  },
  {
    question: "Why do I need to verify my email?",
    answer:
      "Email verification keeps the community real and reduces spam. You must verify your email before you can post. If your confirmation link expired, sign in and request a new one.",
  },
  {
    question: "How do I report something?",
    answer:
      "Use the Report control on a post, reply, or member profile. Choose a reason and add context if you can. Reports go to the moderation queue and are reviewed with the surrounding conversation in mind.",
  },
  {
    question: "How do I block someone?",
    answer:
      "Use Block on a post, reply, or member profile, or manage your list in Settings. Blocking hides their posts and replies from you and they are not notified.",
  },
  {
    question: "Can I delete my account or download my data?",
    answer:
      "Yes. Contact the team through the address below and we will help with a data export, deactivation, or deletion request. We store as little sensitive personal information as we can.",
  },
  {
    question: "What is out of scope for now?",
    answer:
      "Native mobile apps, direct messaging, events, job listings, vendor catalogs, and automated community responses are planned only if members demonstrate a real need for them. The first job is a safe, active community.",
  },
];

export default function HelpPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <header className="mb-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-teal">
            Support
          </p>
          <h1 className="mt-1 font-display text-4xl font-extrabold text-ink">
            Help and contact
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-ink-soft">
            Real people run EPIC. If something feels wrong, unsafe, or confusing,
            tell us.
          </p>
        </header>

        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.question} className="card group p-4">
              <summary className="cursor-pointer list-none font-display text-lg font-bold text-ink marker:hidden">
                {item.question}
              </summary>
              <p className="mt-2 leading-relaxed text-ink-soft">{item.answer}</p>
            </details>
          ))}
        </div>

        <section className="card mt-6 border-teal/40 bg-teal/[0.05] p-5">
          <h2 className="font-display text-2xl font-bold text-ink">
            Contact the team
          </h2>
          <p className="mt-2 leading-relaxed text-ink-soft">
            For urgent safety concerns, threats, harassment, doxxing, or privacy
            issues, email the moderation team. Include a link to the content and
            as much context as you can safely share.
          </p>
          <a
            href="mailto:hello@epic.community"
            className="btn btn-primary mt-4 inline-flex"
          >
            hello@epic.community
          </a>
          <p className="mt-2 text-xs text-ink-soft/70">
            Replace this address with the official EPIC contact before public
            launch.
          </p>
        </section>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Read the{" "}
          <Link href="/guidelines" className="font-bold underline">
            community guidelines
          </Link>{" "}
          or return{" "}
          <Link href="/" className="font-bold underline">
            home
          </Link>
          .
        </p>
      </main>
    </>
  );
}
