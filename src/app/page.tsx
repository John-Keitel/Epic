import Image from "next/image";
import Link from "next/link";
import {
  Armchair,
  CalendarDays,
  Coffee,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Confetti } from "@/components/confetti";
import { Logo } from "@/components/logo";
import { SiteHeader } from "@/components/site-header";

const SPACES = [
  {
    icon: Armchair,
    name: "The Front Porch",
    description:
      "Introduce yourself, share a photo, or tell us how your week is going.",
    members: ["Jasmine R.", "Marco T.", "Leah M.", "Dee W."],
    color: "bg-sky",
    excerpt:
      "New here! Excited to find a place where people just get it.",
    excerptAuthor: "Jasmine R.",
    reactions: [24, 7, 5],
  },
  {
    icon: HeartHandshake,
    name: "I've Been There",
    description:
      "Ask for advice from someone who truly understands.",
    members: ["Marco T.", "Ana P.", "Chris B.", "Sam K."],
    color: "bg-coral",
    excerpt:
      "How do you set boundaries without the guilt? Having a tough time saying no lately.",
    excerptAuthor: "Marco T.",
    reactions: [31, 12, 8],
  },
  {
    icon: Coffee,
    name: "The Break Room",
    description: "Pets, playlists, hobbies, humor, and life outside funeral service.",
    members: ["Leah M.", "Dee W.", "Rob H.", "Nia F."],
    color: "bg-sun",
    excerpt: "Sunday vinyl + coffee = reset. What's on your playlist today?",
    excerptAuthor: "Leah M.",
    reactions: [18, 6, 3],
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative isolate flex min-h-[440px] w-full items-center overflow-hidden bg-cream sm:min-h-[500px] lg:min-h-[560px]">
          <div className="absolute inset-y-0 right-0 w-full sm:w-[65%]">
            <Image
              src="/community-banner.jpg"
              alt="EPIC community members laughing together around picnic tables at an outdoor gathering"
              width={2400}
              height={1340}
              className="h-full w-full object-cover object-center"
              priority
            />
            <div className="absolute inset-0 hidden bg-gradient-to-r from-cream via-cream/60 via-30% to-transparent to-45% sm:block" />
          </div>
          <div className="absolute inset-0 bg-cream/75 sm:hidden" />
          <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
            <div className="max-w-xl">
              <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-teal ring-1 ring-line">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Free. Independent. For everyone in funeral service.
              </p>
              <h1 className="mt-4 font-display text-5xl font-extrabold leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
                Welcome to EPIC
              </h1>
              <p className="mt-4 font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">
                The Funeral Community Where Everyone Belongs
              </p>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                No membership fees. No sales pitches. No titles required. Just
                people who understand the work, the life, and one another.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/join" className="btn btn-primary text-base">
                  Come Sit With Us
                </Link>
                <Link href="/login" className="btn btn-secondary text-base">
                  See What&apos;s Happening
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal" aria-hidden />
                  Private to members
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-teal" aria-hidden />
                  Every role welcome
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <HeartHandshake className="h-4 w-4 text-teal" aria-hidden />
                  No ads, ever
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="community" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-3xl font-extrabold text-ink">
                Come On In <Confetti />
              </h2>
              <p className="mt-1 text-ink-soft">
                A few of the rooms waiting for you inside.
              </p>
            </div>
            <Link href="/join" className="btn btn-secondary btn-sm">
              Browse all spaces
            </Link>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {SPACES.map((space) => {
              const Icon = space.icon;
              return (
                <div key={space.name} className="card flex flex-col p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${space.color}`}
                    >
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink">
                        {space.name}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {space.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex -space-x-2">
                    {space.members.map((member) => (
                      <Avatar key={member} name={member} size="sm" />
                    ))}
                    <span className="inline-flex h-8 items-center rounded-full bg-cream-deep px-2 text-xs font-bold text-ink-soft ring-2 ring-white">
                      +{space.members.length * 7}
                    </span>
                  </div>

                  <div className="mt-3 rounded-xl border border-line bg-cream/70 p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={space.excerptAuthor} size="sm" />
                      <span className="text-xs font-bold text-ink">
                        {space.excerptAuthor}
                      </span>
                      <span className="ml-auto text-[11px] font-semibold text-ink-soft/70">
                        2h
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {space.excerpt}
                    </p>
                    <div className="mt-2 flex gap-4 text-xs font-bold text-ink-soft">
                      <span aria-label="Hearts">♥ {space.reactions[0]}</span>
                      <span aria-label="Replies">◍ {space.reactions[1]}</span>
                      <span aria-label="Claps">✦ {space.reactions[2]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="gatherings"
          className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_1fr]"
        >
          <div id="stories" className="card flex flex-col justify-center gap-3 p-6 sm:p-8">
            <h2 className="font-display text-3xl font-extrabold text-ink">
              Real people. Real stories. Real support.
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-ink-soft">
              EPIC is built for the whole profession — funeral directors,
              embalmers, arrangers, crematory and removal staff, students, and
              the people behind the scenes. Your title doesn&apos;t make you more
              important here. You belong.
            </p>
            <div>
              <Link href="/join" className="btn btn-primary">
                Join the community
              </Link>
            </div>
          </div>

          <aside className="card p-5">
            <h2 className="font-display text-xl font-bold text-ink">
              Happening this week
            </h2>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
                  <Coffee className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-bold text-ink">Virtual Coffee — Wednesday, 7 PM</p>
                  <p className="text-sm text-ink-soft">
                    Grab a mug and join the conversation.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sun/20 text-ink">
                  <CalendarDays className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-bold text-ink">Friday Joy Check-In</p>
                  <p className="text-sm text-ink-soft">
                    Share a win, a smile, or something good from your week.
                  </p>
                </div>
              </li>
            </ul>
            <Link href="/guidelines" className="btn btn-secondary btn-sm mt-5 w-full">
              Read the guidelines
            </Link>
          </aside>
        </section>
      </main>

      <footer className="mt-8 border-t border-line bg-cream-deep/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-ink-soft sm:flex-row sm:px-6">
          <Logo />
          <p className="max-w-md text-center sm:text-right">
            The Funeral Community Where Everyone Belongs. Free, independent, and
            built with care for the people who do this work.
          </p>
          <nav className="flex gap-4 font-bold">
            <Link href="/guidelines" className="hover:text-coral">
              Guidelines
            </Link>
            <Link href="/help" className="hover:text-coral">
              Help
            </Link>
            <Link href="/login" className="hover:text-coral">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
