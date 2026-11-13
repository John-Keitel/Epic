export function Confetti({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none inline-flex items-center gap-1 ${className}`}
    >
      <span className="h-1.5 w-3 -rotate-12 rounded-full bg-sun" />
      <span className="h-1.5 w-3 rotate-12 rounded-full bg-coral" />
      <span className="h-1.5 w-3 -rotate-6 rounded-full bg-teal" />
      <span className="h-1.5 w-3 rotate-12 rounded-full bg-sky" />
    </span>
  );
}
