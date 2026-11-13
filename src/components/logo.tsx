import Image from "next/image";
import Link from "next/link";

export function Logo({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center ${className}`}
      aria-label="EPIC — The Funeral Community Where Everyone Belongs"
    >
      <Image
        src="/epic-logo.png"
        alt="EPIC — The Funeral Community Where Everyone Belongs"
        width={1983}
        height={793}
        priority
        className="h-10 w-auto sm:h-12"
      />
    </Link>
  );
}
