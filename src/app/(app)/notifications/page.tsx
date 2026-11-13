import Link from "next/link";
import { Bell } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { markNotificationsRead } from "@/lib/actions";
import { requireViewer } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import type { AppNotification } from "@/lib/types";

export default async function NotificationsPage() {
  const { supabase, user } = await requireViewer();
  if (!user) return null;

  const { data } = await supabase
    .from("notifications")
    .select(
      `id, user_id, actor_id, type, post_id, comment_id, is_read, created_at,
       actor:profiles!notifications_actor_id_fkey (handle, display_name, avatar_url)`,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = (data ?? []) as unknown as AppNotification[];
  const unread = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            Notifications
          </h1>
          <p className="mt-1 text-ink-soft">
            Replies, mentions, and notes from the moderation team.
          </p>
        </div>
        {unread > 0 ? (
          <form action={markNotificationsRead}>
            <button type="submit" className="btn btn-secondary btn-sm">
              Mark all read
            </button>
          </form>
        ) : null}
      </header>

      {notifications.length === 0 ? (
        <div className="card p-8 text-center">
          <Bell className="mx-auto h-8 w-8 text-teal" aria-hidden />
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">
            All quiet for now
          </h2>
          <p className="mt-1 text-ink-soft">
            When someone replies to you, it will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((item) => (
            <li key={item.id}>
              <div
                className={`card flex items-start gap-3 p-4 ${
                  item.is_read ? "" : "border-teal/50 bg-teal/[0.04]"
                }`}
              >
                <Avatar name={item.actor?.display_name ?? "EPIC"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-soft">
                    <span className="font-bold text-ink">
                      {item.actor?.display_name ?? "A moderator"}
                    </span>{" "}
                    {item.type === "reply"
                      ? "replied to your post."
                      : item.type === "mention"
                        ? "mentioned you."
                        : "sent you a moderation note."}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-ink-soft/70">
                    {timeAgo(item.created_at)}
                  </p>
                </div>
                {item.post_id ? (
                  <Link
                    href={`/posts/${item.post_id}`}
                    className="btn btn-ghost btn-sm text-teal"
                  >
                    View
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
