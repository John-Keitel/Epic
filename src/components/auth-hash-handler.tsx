"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Handles Supabase email links that land with tokens in the URL hash
 * (the implicit flow). This happens when the project's redirect allow-list
 * does not include the app callback, or with older email templates.
 */
export function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.slice(1));
    const clean = window.location.pathname + window.location.search;

    if (params.get("error_description")) {
      window.history.replaceState(null, "", clean);
      router.replace("/login?error=auth");
      return;
    }

    if (!hash.includes("access_token=")) return;

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !refreshToken) return;

    window.history.replaceState(null, "", clean);

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          router.replace("/login?error=auth");
          return;
        }
        router.replace(type === "recovery" ? "/auth/reset" : "/welcome");
        router.refresh();
      });
  }, [router]);

  return null;
}
