import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { OnboardingForm } from "@/components/onboarding-form";
import { requireViewer } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = {
  title: "Welcome to EPIC",
};

export default async function WelcomePage() {
  const { user, profile } = await requireViewer();
  if (!user) redirect("/login");

  if (!profile) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Your profile is still being prepared
          </h1>
          <p className="mt-3 text-ink-soft">
            Please refresh in a moment. If this keeps happening, use the contact
            route on the Help page and a moderator will sort it out.
          </p>
        </main>
      </>
    );
  }

  const initial: Profile = profile;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <div className="mb-6">
          <p className="text-xs font-extrabold uppercase tracking-widest text-teal">
            Step one of one
          </p>
          <h1 className="mt-1 font-display text-4xl font-extrabold text-ink">
            Welcome, {initial.display_name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-ink-soft">
            You&apos;re in. Add a little about yourself so people can find and
            welcome you. Everything here is optional and you control what other
            members see.
          </p>
        </div>

        <OnboardingForm profile={initial} />
      </main>
    </>
  );
}
