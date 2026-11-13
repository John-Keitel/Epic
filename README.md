# EPIC — The Funeral Community Where Everyone Belongs

A light, private social platform for the funeral-service profession. Free to
join, non-commercial, non-political, and built so every role belongs.

Built with **Next.js 16 (App Router)**, **Tailwind CSS 4**, **Supabase**
(Auth, Postgres, Storage), ready for **Vercel** + Supabase.

The original design briefs and logo source files are kept locally for reference
and are intentionally git-ignored; the app uses the optimized copies in
`public/`.

## What is implemented

- Public marketing site (`/`) based on the provided brand and mockup
- Email/password sign-up, email verification, sign-in, password reset
- Onboarding + editable profile with per-field visibility
- Launch spaces: Front Porch, Campfire, Break Room, Ask EPIC, I've Been There
- Posts, replies, reactions (heart / torch / clap), chronological feeds
- Home feed and space feeds with pagination
- Member directory and privacy-aware member profiles
- Notifications for replies and moderation notes
- Reporting, blocking, moderator queue, restrict/reinstate, audit log
- Server-enforced permissions via Postgres RLS and column privileges
- Mobile-first layout with accessible components
- Admin snapshot: member, post, reply, and report counts

## Local development

Prerequisites: Node 20.9+, Docker Desktop, npm.

```bash
npm install
npm run db:start        # starts local Supabase (Docker)
npx supabase status     # copy the API URL + publishable key
```

`db:start` skips Supabase Studio on purpose (its health check is unreliable on
Windows). Run `npx supabase start` if you want Studio at http://127.0.0.1:54323.

Create `.env.local` from `.env.example` and paste the values:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
```

Then apply the schema and start the app:

```bash
npm run db:reset        # applies supabase/migrations/*.sql
npm run dev             # http://localhost:3000
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:start` / `db:stop` | Start/stop local Supabase |
| `npm run db:reset` | Recreate local DB and apply migrations |
| `npm run db:push` | Push migrations to a linked Supabase project |

Local mail (confirmation/reset links) is captured by Mailpit at
http://127.0.0.1:54324.

## Making yourself a moderator locally

After signing up, promote the account with SQL (trusted operations are allowed
outside a member request):

```bash
docker exec supabase_db_epic_project psql -U postgres -d postgres \
  -c "update public.profiles set community_role='moderator' where handle='your_handle';"
```

## Production setup

1. Create a Supabase project.
2. In **Authentication → URL Configuration** set:
   - **Site URL:** `https://your-domain.com`
   - **Redirect URLs:** `https://your-domain.com/**` (and
     `http://localhost:3000/**` if you test against the same project locally)
3. Turn on **Confirm email** in Auth settings.
4. Push the schema: `npx supabase link --project-ref <ref>` then
   `npm run db:push`.
5. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel.
6. Deploy. Keep the service-role key out of the frontend.
7. Replace `hello@epic.community` in `src/app/help/page.tsx` with the official
   contact address and have the guidelines/terms reviewed legally.
8. Promote the first administrator with the SQL above (in the Supabase SQL
   editor).

## Troubleshooting auth links

**"no Route matched with those values"** is a Supabase gateway (Kong) message.
It means the browser landed on the Supabase API root
(`http://127.0.0.1:54321` locally, `https://<ref>.supabase.co` in production)
instead of the EPIC website.

- The **Project URL** shown by `npx supabase status` is the API, not the site.
  Open http://localhost:3000 for the app.
- Confirm **Site URL** is the app domain, not the Supabase project URL.
- Add the app callback to **Redirect URLs**, e.g.
  `http://localhost:3000/**` and `https://your-domain.com/**`.
- Email links generated before this fix are stale; request a new one.
- The app also understands legacy hash-token links (`/#access_token=...`) and
  `/auth/confirm?token_hash=...` templates, so older links recover gracefully.

Local email links are captured at http://127.0.0.1:54324 (Mailpit).

## Security model

- Every table has RLS enabled; writes are validated by the database.
- `profiles` hides optional fields at the column-privilege level. Ordinary
  members read their own row through `my_profile` and everyone else through the
  sanitized `member_directory` view.
- A guard trigger blocks members from changing their own role or status.
- Authors can edit text but cannot flip their own moderation flags.
- Removed content is invisible to members, visible to staff for review.
- Blocks hide posts and replies in both directions.
- All moderation actions require a reason and are written to `audit_events`.
- Private community content is behind auth; no public API reads.

## Project layout

```
src/app/
  (app)/           signed-in shell: home, spaces, posts, members, notifications, settings, admin
  auth/            OAuth/email callback + password reset
  join, login, welcome, guidelines, help
  actions in src/lib/actions.ts
src/components/    shared UI (feed, composer, report form, nav, ...)
src/lib/           auth helpers, Supabase clients, queries, formatting
supabase/
  config.toml
  migrations/      schema, RLS, triggers, seed spaces
```

## Not in this MVP

Native apps, direct messages, events, job listings, vendor catalogs, paid tiers,
advertising, and AI-generated community responses. The roadmap adds these only
after the pilot proves a real need.
