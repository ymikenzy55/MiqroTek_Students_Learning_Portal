import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

// Image uploads are stored in Vercel Blob (cloud storage) so they work in both
// development and production (Vercel's serverless filesystem is read-only).
// Auth is required; any signed-in user may upload (instructors create course
// cover images, students set avatars).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File too large. Maximum size is 5 MB." }, { status: 413 });
  }

  // Check for Vercel Blob token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Upload storage is not configured. Set BLOB_READ_WRITE_TOKEN in your environment variables." },
      { status: 500 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `uploads/${session.user.id}-${Date.now()}.${ext}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error("Upload failed:", error);
    return Response.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
