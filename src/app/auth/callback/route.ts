import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description");
  const nextParam = searchParams.get("next") ?? "/welcome";
  const next = nextParam.startsWith("/") ? nextParam : "/welcome";

  if (errorDescription) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Some email templates send token_hash instead of a PKCE code.
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (tokenHash && type) {
    const url = new URL(`${origin}/auth/confirm`);
    url.searchParams.set("token_hash", tokenHash);
    url.searchParams.set("type", type);
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
