import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <Logo />
      <p className="mt-8 text-xs font-extrabold uppercase tracking-widest text-coral">
        404
      </p>
      <h1 className="mt-1 font-display text-4xl font-extrabold text-ink">
        This chair is empty
      </h1>
      <p className="mt-2 max-w-md text-ink-soft">
        The page you were looking for may have moved, been removed, or never
        existed. The porch is still open.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/home" className="btn btn-primary">
          Go home
        </Link>
        <Link href="/spaces" className="btn btn-secondary">
          Browse spaces
        </Link>
      </div>
    </main>
  );
}
