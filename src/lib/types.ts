export type MemberRole = "member" | "moderator" | "admin";
export type MemberStatus = "pending" | "active" | "restricted" | "deactivated";
export type ReactionKind = "heart" | "torch" | "clap";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export interface Profile {
  id: string;
  handle: string;
  display_name: string;
  role_title: string | null;
  region: string | null;
  bio: string | null;
  avatar_url: string | null;
  community_role: MemberRole;
  status: MemberStatus;
  show_role: boolean;
  show_region: boolean;
  show_bio: boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectoryProfile {
  id: string;
  handle: string;
  display_name: string;
  role_title: string | null;
  region: string | null;
  bio: string | null;
  avatar_url: string | null;
  community_role: MemberRole;
  created_at: string;
}

export interface Space {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface PostAuthor {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Post {
  id: string;
  space_id: string;
  author_id: string;
  title: string | null;
  body: string;
  is_removed: boolean;
  created_at: string;
  updated_at: string;
  author: PostAuthor | null;
  space?: Pick<Space, "slug" | "name"> | null;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  kind: ReactionKind;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  is_removed: boolean;
  created_at: string;
  author: PostAuthor | null;
}

export interface AppNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: "reply" | "mention" | "moderation";
  post_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
  actor: Pick<PostAuthor, "handle" | "display_name" | "avatar_url"> | null;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  target_type: "post" | "comment" | "member";
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  handled_at: string | null;
}

export const REACTION_META: Record<
  ReactionKind,
  { label: string; emoji: string }
> = {
  heart: { label: "Heart", emoji: "❤️" },
  torch: { label: "Torch", emoji: "🔥" },
  clap: { label: "Clap", emoji: "👏" },
};
