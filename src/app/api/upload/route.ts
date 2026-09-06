import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Image uploads are written to /public/uploads so they are served statically
// without any external storage dependency. Auth is required; any signed-in
// user may upload a cover image (instructors create courses, students set
// avatars).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return new Response("No file provided", { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(
      `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return new Response("File too large. Maximum size is 5 MB.", { status: 413 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);

    return Response.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload failed:", error);
    return new Response("Failed to save file", { status: 500 });
  }
}
