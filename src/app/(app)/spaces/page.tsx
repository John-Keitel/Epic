import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SpaceIcon } from "@/components/space-icon";
import { requireViewer } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import type { Space } from "@/lib/types";

const SPACE_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  "front-porch": { bg: "bg-sky/10", text: "text-sky", ring: "ring-sky/20" },
  campfire: { bg: "bg-coral/10", text: "text-coral", ring: "ring-coral/20" },
  "break-room": { bg: "bg-sun/20", text: "text-ink", ring: "ring-sun/30" },
  "ask-epic": { bg: "bg-teal/10", text: "text-teal", ring: "ring-teal/20" },
  "ive-been-there": { bg: "bg-coral/10", text: "text-coral", ring: "ring-coral/20" },
};

export default async function SpacesPage() {
  const { supabase } = await requireViewer();

  const { data: spaces } = await supabase
    .from("spaces")
    .select("id, slug, name, description, icon, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order");

  const { data: recentPosts } = await supabase
    .from("posts")
    .select("space_id, created_at")
    .eq("is_removed", false);

  const stats = new Map<string, { count: number; latest: string | null }>();
  for (const row of recentPosts ?? []) {
    const entry = stats.get(row.space_id) ?? { count: 0, latest: null };
    entry.count += 1;
    if (!entry.latest || row.created_at > entry.latest) {
      entry.latest = row.created_at;
    }
    stats.set(row.space_id, entry);
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-ink">
          Spaces
        </h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          A few rooms, not a hundred empty forums. Pick the one that fits the
          moment and pull up a chair.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {(spaces as Space[] | null)?.map((space) => {
          const style = SPACE_STYLES[space.slug] ?? {
            bg: "bg-cream-deep",
            text: "text-ink",
            ring: "ring-line",
          };
          const stat = stats.get(space.id);

          return (
            <Link
              key={space.id}
              href={`/spaces/${space.slug}`}
              className="card group flex flex-col p-5 transition hover:border-teal/60 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ${style.bg} ${style.text} ${style.ring}`}
                >
                  <SpaceIcon icon={space.icon} className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold text-ink group-hover:text-coral">
                    {space.name}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {space.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3 text-xs font-bold text-ink-soft">
                <span>
                  {stat?.count ?? 0} {stat?.count === 1 ? "post" : "posts"}
                  {stat?.latest ? ` · last ${timeAgo(stat.latest)}` : ""}
                </span>
                <span className="inline-flex items-center gap-1 text-coral">
                  Visit <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
