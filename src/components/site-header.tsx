import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />

        <nav
          aria-label="Main"
          className="hidden items-center gap-6 text-sm font-bold text-ink lg:flex"
        >
          <Link href="/#community" className="hover:text-coral">
            Community
          </Link>
          <Link href="/#stories" className="hover:text-coral">
            Stories
          </Link>
          <Link href="/#gatherings" className="hover:text-coral">
            Gatherings
          </Link>
          <Link href="/guidelines" className="hover:text-coral">
            About EPIC
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="hidden text-sm font-bold text-ink hover:text-coral sm:block">
            Sign In
          </Link>
          <Link href="/join" className="btn btn-primary text-sm">
            Come Sit With Us
          </Link>
        </div>
      </div>
    </header>
  );
}
