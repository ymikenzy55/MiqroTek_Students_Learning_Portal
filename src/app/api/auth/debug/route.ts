import { NextResponse } from "next/server";

// Temporary debug endpoint — delete after fixing OAuth
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextauthUrl = process.env.NEXTAUTH_URL;
  const authSecret = process.env.AUTH_SECRET;

  // The client ID is public (it's sent to the browser in the OAuth URL anyway)
  // so showing it here is safe for debugging. The secret stays hidden.
  return NextResponse.json({
    google_client_id_full: clientId ?? "MISSING",
    google_client_id_length: clientId?.length ?? 0,
    google_client_secret_exists: !!clientSecret,
    google_client_secret_length: clientSecret?.length ?? 0,
    nextauth_url: nextauthUrl ?? "MISSING",
    auth_secret_exists: !!authSecret,
    callback_url: `${nextauthUrl}/api/auth/callback/google`,
    // Check for invisible/unicode characters
    has_non_ascii: clientId ? /[^\x20-\x7E]/.test(clientId) : false,
    char_codes: clientId
      ? Array.from(clientId.substring(0, 25)).map((c) => c.charCodeAt(0))
      : [],
  });
}
