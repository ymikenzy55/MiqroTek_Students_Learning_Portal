import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

// File uploads (PDF, PPT) for course resources and student CVs.
// Stored in Vercel Blob (cloud storage) so they work in production.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

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
      { error: `Unsupported file type: ${file.type}. Allowed: PDF, PPT, PPTX` },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File too large. Maximum size is 20 MB." }, { status: 413 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Upload storage is not configured. Set BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const folder = formData.get("folder") as string || "resources";
  const filename = `${folder}/${session.user.id}-${Date.now()}.${ext}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

    return Response.json({
      url: blob.url,
      filename: file.name,
      contentType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("File upload failed:", error);
    return Response.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
