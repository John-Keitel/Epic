import { avatarColor, initials } from "@/lib/format";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
};

export function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-full font-display font-bold text-white ring-2 ring-white/70 ${avatarColor(
        name,
      )} ${SIZES[size]} ${className}`}
    >
      {initials(name) || "?"}
    </span>
  );
}
