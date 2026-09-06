import { NextResponse } from "next/server";

// Temporary debug endpoint — delete after fixing OAuth
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextauthUrl = process.env.NEXTAUTH_URL;
  const authSecret = process.env.AUTH_SECRET;

  return NextResponse.json({
    google_client_id_exists: !!clientId,
    google_client_id_length: clientId?.length ?? 0,
    google_client_id_first_20: clientId?.substring(0, 20) ?? "MISSING",
    google_client_id_last_20: clientId?.substring(clientId.length - 20) ?? "MISSING",
    google_client_secret_exists: !!clientSecret,
    google_client_secret_length: clientSecret?.length ?? 0,
    nextauth_url: nextauthUrl ?? "MISSING",
    auth_secret_exists: !!authSecret,
    callback_url: `${nextauthUrl}/api/auth/callback/google`,
  });
}
