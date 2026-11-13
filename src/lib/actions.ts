"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TERMS_VERSION } from "@/lib/constants";
import type { Profile, ReactionKind } from "@/lib/types";

export type ActionResult = { error?: string; success?: string } | null;

const REACTION_KINDS: ReactionKind[] = ["heart", "torch", "clap"];

async function requireActingMember() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Please sign in to continue.");

  const { data: profile } = await supabase
    .from("my_profile")
    .select("*")
    .maybeSingle();

  if (!profile) throw new Error("Your member profile is not ready yet.");
  if ((profile as Profile).status !== "active") {
    throw new Error("Your membership is not active. Contact a moderator.");
  }

  return { supabase, user, profile: profile as Profile };
}

function message(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export async function createPost(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let postId: string | null = null;
  let spaceSlug = "";

  try {
    const { supabase, user } = await requireActingMember();
    const spaceId = String(formData.get("space_id") ?? "");
    spaceSlug = String(formData.get("space_slug") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();

    if (!spaceId) return { error: "Choose a space for your post." };
    if (body.length < 2) return { error: "Share a little more before posting." };
    if (body.length > 5000) return { error: "Posts are limited to 5,000 characters." };
    if (title.length > 120) return { error: "Titles are limited to 120 characters." };

    const { data, error } = await supabase
      .from("posts")
      .insert({
        space_id: spaceId,
        author_id: user.id,
        title: title || null,
        body,
      })
      .select("id")
      .single();

    if (error) return { error: "We could not save that post. Please try again." };
    postId = data.id;
  } catch (error) {
    return { error: message(error) };
  }

  revalidatePath("/home");
  revalidatePath("/spaces");
  if (spaceSlug) revalidatePath(`/spaces/${spaceSlug}`);
  redirect(`/posts/${postId}`);
}

export async function addComment(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireActingMember();
    const postId = String(formData.get("post_id") ?? "");
    const body = String(formData.get("body") ?? "").trim();

    if (!postId) return { error: "That discussion could not be found." };
    if (body.length < 1) return { error: "Write a reply first." };
    if (body.length > 2000) return { error: "Replies are limited to 2,000 characters." };

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: user.id,
      body,
    });

    if (error) return { error: "We could not save that reply. Please try again." };
  } catch (error) {
    return { error: message(error) };
  }

  revalidatePath(`/posts/${formData.get("post_id")}`);
  revalidatePath("/home");
  return { success: "Reply posted." };
}

export async function toggleReaction(formData: FormData) {
  const postId = String(formData.get("post_id") ?? "");
  const kind = String(formData.get("kind") ?? "") as ReactionKind;
  const path = String(formData.get("path") ?? "/home");

  if (!postId || !REACTION_KINDS.includes(kind)) return;

  const { supabase, user } = await requireActingMember();

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("kind", kind)
    .maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
  } else {
    await supabase.from("reactions").insert({
      post_id: postId,
      user_id: user.id,
      kind,
    });
  }

  revalidatePath(path);
}

export async function reportContent(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireActingMember();
    const targetType = String(formData.get("target_type") ?? "");
    const targetId = String(formData.get("target_id") ?? "");
    const reason = String(formData.get("reason") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim();

    if (!["post", "comment", "member"].includes(targetType)) {
      return { error: "That report type is not supported." };
    }
    if (!targetId || !reason) return { error: "Choose a reason for the report." };
    if (details.length > 1000) return { error: "Keep details under 1,000 characters." };

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details || null,
    });

    if (error) return { error: "We could not file that report. Please try again." };
  } catch (error) {
    return { error: message(error) };
  }

  revalidatePath("/admin");
  return {
    success:
      "Thank you. A moderator will review this. For urgent safety concerns, use the contact route in Help.",
  };
}

export async function completeOnboarding(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let handle = "";

  try {
    const { supabase, user, profile } = await requireActingMember();

    const displayName = String(formData.get("display_name") ?? "").trim();
    const roleTitle = String(formData.get("role_title") ?? "").trim();
    const region = String(formData.get("region") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();

    if (displayName.length < 1) return { error: "Add the name you want members to see." };
    if (displayName.length > 60) return { error: "Keep your display name under 60 characters." };
    if (bio.length > 500) return { error: "Bios are limited to 500 characters." };

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        role_title: roleTitle || null,
        region: region || null,
        bio: bio || null,
        show_role: formData.get("show_role") === "on",
        show_region: formData.get("show_region") === "on",
        show_bio: formData.get("show_bio") === "on",
      })
      .eq("id", user.id);

    if (error) return { error: "We could not save your profile. Please try again." };

    await supabase.from("terms_acceptance").upsert(
      { user_id: user.id, version: TERMS_VERSION },
      { onConflict: "user_id,version", ignoreDuplicates: true },
    );

    handle = profile.handle;
  } catch (error) {
    return { error: message(error) };
  }

  revalidatePath("/home");
  revalidatePath(`/members/${handle}`);
  redirect("/home");
}

export async function updateProfile(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { supabase, user, profile } = await requireActingMember();

    const displayName = String(formData.get("display_name") ?? "").trim();
    const roleTitle = String(formData.get("role_title") ?? "").trim();
    const region = String(formData.get("region") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();

    if (displayName.length < 1) return { error: "Add the name you want members to see." };
    if (displayName.length > 60) return { error: "Keep your display name under 60 characters." };
    if (bio.length > 500) return { error: "Bios are limited to 500 characters." };

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        role_title: roleTitle || null,
        region: region || null,
        bio: bio || null,
        show_role: formData.get("show_role") === "on",
        show_region: formData.get("show_region") === "on",
        show_bio: formData.get("show_bio") === "on",
      })
      .eq("id", user.id);

    if (error) return { error: "We could not save your profile. Please try again." };

    revalidatePath(`/members/${profile.handle}`);
    revalidatePath("/members");
    revalidatePath("/home");
    return { success: "Profile updated." };
  } catch (error) {
    return { error: message(error) };
  }
}

export async function markNotificationsRead() {
  const { supabase, user } = await requireActingMember();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  revalidatePath("/notifications");
}

export async function blockMember(formData: FormData) {
  const { supabase, user } = await requireActingMember();
  const blockedId = String(formData.get("blocked_id") ?? "");
  const path = String(formData.get("path") ?? "/home");

  if (!blockedId || blockedId === user.id) return;

  await supabase
    .from("blocked_members")
    .upsert(
      { blocker_id: user.id, blocked_id: blockedId },
      { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true },
    );

  revalidatePath(path);
}

export async function unblockMember(formData: FormData) {
  const { supabase, user } = await requireActingMember();
  const blockedId = String(formData.get("blocked_id") ?? "");
  if (!blockedId) return;

  await supabase
    .from("blocked_members")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", blockedId);

  revalidatePath("/settings");
}

export async function moderationAction(formData: FormData) {
  const { supabase, user, profile } = await requireActingMember();
  if (profile.community_role !== "moderator" && profile.community_role !== "admin") {
    return;
  }

  const action = String(formData.get("action") ?? "");
  const targetType = String(formData.get("target_type") ?? "");
  const targetId = String(formData.get("target_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const reportId = String(formData.get("report_id") ?? "");
  const returnPath = String(formData.get("return_path") ?? "/admin");

  if (!targetId || !reason) return;

  if (action === "remove" || action === "hide" || action === "restore") {
    if (targetType === "post") {
      await supabase
        .from("posts")
        .update({
          is_removed: action !== "restore",
          removed_by: action === "restore" ? null : user.id,
        })
        .eq("id", targetId);
    } else if (targetType === "comment") {
      await supabase
        .from("comments")
        .update({
          is_removed: action !== "restore",
          removed_by: action === "restore" ? null : user.id,
        })
        .eq("id", targetId);
    }
  } else if (action === "restrict" || action === "reinstate") {
    if (targetType === "member") {
      await supabase
        .from("profiles")
        .update({ status: action === "restrict" ? "restricted" : "active" })
        .eq("id", targetId);
    }
  } else if (action === "warn") {
    const recipient =
      targetType === "member"
        ? targetId
        : targetType === "post"
          ? (
              await supabase
                .from("posts")
                .select("author_id")
                .eq("id", targetId)
                .maybeSingle()
            ).data?.author_id
          : (
              await supabase
                .from("comments")
                .select("author_id")
                .eq("id", targetId)
                .maybeSingle()
            ).data?.author_id;

    if (recipient) {
      await supabase.from("notifications").insert({
        user_id: recipient,
        actor_id: user.id,
        type: "moderation",
      });
    }
  } else {
    return;
  }

  await supabase.from("moderation_actions").insert({
    moderator_id: user.id,
    target_type: targetType,
    target_id: targetId,
    action,
    reason,
  });

  await supabase.from("audit_events").insert({
    actor_id: user.id,
    action,
    entity_type: targetType,
    entity_id: targetId,
    metadata: { reason },
  });

  if (reportId) {
    await supabase
      .from("reports")
      .update({
        status: action === "hide" || action === "remove" || action === "restrict" ? "resolved" : "reviewing",
        handled_by: user.id,
        handled_at: new Date().toISOString(),
      })
      .eq("id", reportId);
  }

  revalidatePath(returnPath);
  revalidatePath("/admin");
  revalidatePath("/home");
}

export async function resolveReport(formData: FormData) {
  const { supabase, user, profile } = await requireActingMember();
  if (profile.community_role !== "moderator" && profile.community_role !== "admin") {
    return;
  }

  const reportId = String(formData.get("report_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!reportId || !["open", "reviewing", "resolved", "dismissed"].includes(status)) {
    return;
  }

  await supabase
    .from("reports")
    .update({
      status,
      handled_by: user.id,
      handled_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  revalidatePath("/admin");
}
