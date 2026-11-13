import { COMMUNITY_ROLES } from "@/lib/constants";

export function ProfileFields({
  defaults,
}: {
  defaults?: {
    display_name?: string;
    role_title?: string | null;
    region?: string | null;
    bio?: string | null;
    show_role?: boolean;
    show_region?: boolean;
    show_bio?: boolean;
  };
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="display_name" className="field-label">
            Name you go by
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            maxLength={60}
            defaultValue={defaults?.display_name ?? ""}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="role_title" className="field-label">
            What do you do?
          </label>
          <select
            id="role_title"
            name="role_title"
            defaultValue={defaults?.role_title ?? ""}
            className="field"
          >
            <option value="">Prefer not to say</option>
            {COMMUNITY_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="region" className="field-label">
          Region
        </label>
        <input
          id="region"
          name="region"
          maxLength={80}
          defaultValue={defaults?.region ?? ""}
          className="field"
          placeholder="Ohio, or just “Midwest”"
        />
      </div>

      <div>
        <label htmlFor="bio" className="field-label">
          A little about you
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={500}
          defaultValue={defaults?.bio ?? ""}
          className="field resize-y"
          placeholder="Years in the work, what you care about, or what you'd love to learn."
        />
      </div>

      <fieldset className="rounded-xl border border-line bg-cream/60 p-3">
        <legend className="px-1 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
          Show on my profile
        </legend>
        <div className="mt-1 space-y-2 text-sm font-semibold text-ink-soft">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="show_role"
              defaultChecked={defaults?.show_role ?? true}
              className="h-4 w-4 accent-[#14a8a2]"
            />
            My role
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="show_region"
              defaultChecked={defaults?.show_region ?? true}
              className="h-4 w-4 accent-[#14a8a2]"
            />
            My region
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="show_bio"
              defaultChecked={defaults?.show_bio ?? true}
              className="h-4 w-4 accent-[#14a8a2]"
            />
            My bio
          </label>
        </div>
        <p className="mt-2 text-xs text-ink-soft/80">
          Your name and handle are always visible to signed-in members. Hidden
          fields are never sent to other members.
        </p>
      </fieldset>
    </>
  );
}
