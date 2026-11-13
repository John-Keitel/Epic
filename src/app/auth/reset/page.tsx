import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { requireViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Choose a new password",
};

export default async function ResetPasswordPage() {
  await requireViewer();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Choose a new password
          </h1>
          <p className="mt-2 text-ink-soft">
            Make it something only you would know.
          </p>
        </div>
        <ResetPasswordForm />
      </main>
    </>
  );
}
