import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Forgot your password?
          </h1>
          <p className="mt-2 text-ink-soft">
            We&apos;ll email you a secure link to choose a new one.
          </p>
        </div>
        <ForgotPasswordForm />
      </main>
    </>
  );
}
