import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-6 text-center">
          <h1 className="font-display text-4xl font-extrabold text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-ink-soft">
            The porch light is on. Come on in.
          </p>
        </div>

        {params.error ? (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-dark"
          >
            We couldn&apos;t complete that sign-in link. Please try again.
          </p>
        ) : null}

        <LoginForm next={params.next} />
      </main>
    </>
  );
}
