import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReactionSummary } from "@/components/reaction-bar";
import type { ReactionKind } from "@/lib/types";

const ALL_KINDS: ReactionKind[] = ["heart", "torch", "clap"];

export function emptyReactionSummary(): ReactionSummary[] {
  return ALL_KINDS.map((kind) => ({ kind, count: 0, mine: false }));
}

export async function getReactionSummaries(
  supabase: SupabaseClient,
  postIds: string[],
  viewerId: string,
) {
  const map = new Map<string, ReactionSummary[]>();
  for (const id of postIds) map.set(id, emptyReactionSummary());
  if (postIds.length === 0) return map;

  const { data } = await supabase
    .from("reactions")
    .select("post_id, user_id, kind")
    .in("post_id", postIds);

  for (const row of data ?? []) {
    const summary = map.get(row.post_id);
    if (!summary) continue;
    const item = summary.find((entry) => entry.kind === row.kind);
    if (!item) continue;
    item.count += 1;
    if (row.user_id === viewerId) item.mine = true;
  }

  return map;
}

export async function getCommentCounts(
  supabase: SupabaseClient,
  postIds: string[],
) {
  const map = new Map<string, number>();
  for (const id of postIds) map.set(id, 0);
  if (postIds.length === 0) return map;

  const { data } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", postIds)
    .eq("is_removed", false);

  for (const row of data ?? []) {
    map.set(row.post_id, (map.get(row.post_id) ?? 0) + 1);
  }

  return map;
}

export function searchTerm(raw: string | undefined) {
  if (!raw) return "";
  return raw.replace(/[%,()*]/g, "").trim().slice(0, 60);
}
