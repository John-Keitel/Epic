import Link from "next/link";
import { ShieldCheck, Users, MessageSquare, FileWarning, ArrowUpRight } from "lucide-react";
import { moderationAction, resolveReport } from "@/lib/actions";
import { requireStaff } from "@/lib/auth";
import { daysAgoISO, timeAgo } from "@/lib/format";
import type { ReportStatus } from "@/lib/types";

interface AdminReport {
  id: string;
  reporter_id: string;
  target_type: "post" | "comment" | "member";
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  reporter: { display_name: string; handle: string } | null;
}

export default async function AdminPage() {
  const { supabase } = await requireStaff();

  const [membersCount, postsWeek, commentsCount, openReports] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("is_removed", false)
        .gte("created_at", daysAgoISO(7)),
      supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("is_removed", false),
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "reviewing"]),
    ]);

  const { data: reportsRaw } = await supabase
    .from("reports")
    .select(
      `id, reporter_id, target_type, target_id, reason, details, status, created_at,
       reporter:profiles!reports_reporter_id_fkey (display_name, handle)`,
    )
    .in("status", ["open", "reviewing"])
    .order("created_at", { ascending: true })
    .limit(50);

  const reports = (reportsRaw ?? []) as unknown as AdminReport[];

  const postIds = reports
    .filter((report) => report.target_type === "post")
    .map((report) => report.target_id);
  const commentIds = reports
    .filter((report) => report.target_type === "comment")
    .map((report) => report.target_id);
  const memberIds = reports
    .filter((report) => report.target_type === "member")
    .map((report) => report.target_id);

  const [targetPosts, targetComments, targetMembers] = await Promise.all([
    postIds.length
      ? supabase
          .from("posts")
          .select("id, title, body, author_id, is_removed")
          .in("id", postIds)
      : Promise.resolve({ data: [] as { id: string; title: string | null; body: string; author_id: string; is_removed: boolean }[] }),
    commentIds.length
      ? supabase
          .from("comments")
          .select("id, post_id, body, author_id, is_removed")
          .in("id", commentIds)
      : Promise.resolve({ data: [] as { id: string; post_id: string; body: string; author_id: string; is_removed: boolean }[] }),
    memberIds.length
      ? supabase
          .from("profiles")
          .select("id, handle, display_name, status")
          .in("id", memberIds)
      : Promise.resolve({ data: [] as { id: string; handle: string; display_name: string; status: string }[] }),
  ]);

  const postsById = new Map((targetPosts.data ?? []).map((row) => [row.id, row]));
  const commentsById = new Map((targetComments.data ?? []).map((row) => [row.id, row]));
  const membersById = new Map((targetMembers.data ?? []).map((row) => [row.id, row]));

  const { data: recentMembers } = await supabase
    .from("profiles")
    .select("id, handle, display_name, community_role, status, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const metrics = [
    { label: "Active members", value: membersCount.count ?? 0, icon: Users },
    { label: "Posts this week", value: postsWeek.count ?? 0, icon: MessageSquare },
    { label: "Replies", value: commentsCount.count ?? 0, icon: ShieldCheck },
    { label: "Open reports", value: openReports.count ?? 0, icon: FileWarning },
  ];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-widest text-coral">
          Moderator tools
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
          Community health
        </h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Review reports with context, record a reason for every action, and
          protect a welcoming community.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4">
            <Icon className="h-5 w-5 text-teal" aria-hidden />
            <p className="mt-2 font-display text-3xl font-extrabold text-ink">
              {value}
            </p>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-soft/80">
              {label}
            </p>
          </div>
        ))}
      </div>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-ink">
            Reports queue
          </h2>
          <span className="rounded-full bg-coral/10 px-2.5 py-1 text-xs font-extrabold text-coral">
            {reports.length} waiting
          </span>
        </div>

        {reports.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            Nothing in the queue. Thank you for keeping an eye on the room.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reports.map((report) => {
              const post =
                report.target_type === "post"
                  ? postsById.get(report.target_id)
                  : undefined;
              const comment =
                report.target_type === "comment"
                  ? commentsById.get(report.target_id)
                  : undefined;
              const member =
                report.target_type === "member"
                  ? membersById.get(report.target_id)
                  : undefined;

              return (
                <li key={report.id} className="rounded-2xl border border-line bg-cream/50 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-ink-soft">
                    <span className="rounded-full bg-coral/10 px-2 py-0.5 uppercase tracking-wide text-coral">
                      {report.target_type}
                    </span>
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 uppercase tracking-wide">
                      {report.status}
                    </span>
                    <span>{timeAgo(report.created_at)}</span>
                    <span className="ml-auto">
                      Reported by {report.reporter?.display_name ?? "a member"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-ink">
                    {report.reason}
                  </p>
                  {report.details ? (
                    <p className="mt-1 text-sm text-ink-soft">{report.details}</p>
                  ) : null}

                  <div className="mt-2 rounded-xl bg-white/70 p-3 text-sm text-ink-soft ring-1 ring-line">
                    {post ? (
                      <>
                        {post.title ? (
                          <p className="font-bold text-ink">{post.title}</p>
                        ) : null}
                        <p className="line-clamp-3 whitespace-pre-wrap">{post.body}</p>
                        <Link
                          href={`/posts/${post.id}`}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-sky hover:underline"
                        >
                          Open post <ArrowUpRight className="h-3 w-3" aria-hidden />
                        </Link>
                      </>
                    ) : comment ? (
                      <>
                        <p className="line-clamp-3 whitespace-pre-wrap">{comment.body}</p>
                        <Link
                          href={`/posts/${comment.post_id}`}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-sky hover:underline"
                        >
                          Open discussion <ArrowUpRight className="h-3 w-3" aria-hidden />
                        </Link>
                      </>
                    ) : member ? (
                      <p>
                        <Link
                          href={`/members/${member.handle}`}
                          className="font-bold text-sky hover:underline"
                        >
                          {member.display_name}
                        </Link>{" "}
                        · status: {member.status}
                      </p>
                    ) : (
                      <p className="italic">Content is no longer available.</p>
                    )}
                  </div>

                  <form action={moderationAction} className="mt-3 space-y-2">
                    <input type="hidden" name="target_type" value={report.target_type} />
                    <input type="hidden" name="target_id" value={report.target_id} />
                    <input type="hidden" name="report_id" value={report.id} />
                    <input type="hidden" name="return_path" value="/admin" />
                    <input
                      name="reason"
                      required
                      maxLength={300}
                      placeholder="Reason for the action (recorded in the audit log)"
                      className="field text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      {report.target_type === "post" ||
                      report.target_type === "comment" ? (
                        <>
                          <button
                            type="submit"
                            name="action"
                            value="remove"
                            className="btn btn-primary btn-sm"
                          >
                            Remove content
                          </button>
                          <button
                            type="submit"
                            name="action"
                            value="restore"
                            className="btn btn-secondary btn-sm"
                          >
                            Restore
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="submit"
                            name="action"
                            value="restrict"
                            className="btn btn-primary btn-sm"
                          >
                            Restrict member
                          </button>
                          <button
                            type="submit"
                            name="action"
                            value="reinstate"
                            className="btn btn-secondary btn-sm"
                          >
                            Reinstate
                          </button>
                        </>
                      )}
                      <button
                        type="submit"
                        name="action"
                        value="warn"
                        className="btn btn-ghost btn-sm text-ink-soft"
                      >
                        Send warning
                      </button>
                    </div>
                  </form>

                  <form action={resolveReport} className="mt-2 flex gap-2">
                    <input type="hidden" name="report_id" value={report.id} />
                    <button
                      type="submit"
                      name="status"
                      value="resolved"
                      className="btn btn-ghost btn-sm text-teal"
                    >
                      Mark resolved
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="dismissed"
                      className="btn btn-ghost btn-sm text-ink-soft"
                    >
                      Dismiss
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-display text-xl font-bold text-ink">Newest members</h2>
        <ul className="mt-3 divide-y divide-line">
          {(recentMembers ?? []).map((member) => (
            <li key={member.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
              <Link
                href={`/members/${member.handle}`}
                className="font-bold text-ink hover:text-coral"
              >
                {member.display_name}
              </Link>
              <span className="text-ink-soft">@{member.handle}</span>
              <span className="ml-auto flex items-center gap-2 text-xs font-bold">
                <span className="rounded-full bg-ink/5 px-2 py-0.5 uppercase tracking-wide text-ink-soft">
                  {member.community_role}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 uppercase tracking-wide ${
                    member.status === "active"
                      ? "bg-teal/10 text-teal"
                      : "bg-coral/10 text-coral"
                  }`}
                >
                  {member.status}
                </span>
                <span className="text-ink-soft/70">{timeAgo(member.created_at)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
