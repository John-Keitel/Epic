import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const getViewer = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null as Profile | null };
  }

  const { data: profile } = await supabase
    .from("my_profile")
    .select("*")
    .maybeSingle();

  return { supabase, user, profile: profile as Profile | null };
});

export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer.user) redirect("/login");
  return viewer;
}

export async function requireStaff() {
  const viewer = await requireViewer();
  const isStaff =
    viewer.profile?.community_role === "moderator" ||
    viewer.profile?.community_role === "admin";
  if (!isStaff) redirect("/home");
  return viewer;
}

export async function requireAdmin() {
  const viewer = await requireViewer();
  if (viewer.profile?.community_role !== "admin") redirect("/home");
  return viewer;
}
