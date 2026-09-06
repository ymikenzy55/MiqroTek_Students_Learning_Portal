"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface ImageUploaderProps {
  /** Current image URL (preset or previously uploaded). */
  value: string;
  onChange: (url: string) => void;
  /** Preset images to pick from. */
  presets: { label: string; url: string }[];
}

/**
 * Cover-image picker: lets the user choose a preset, paste a URL, or upload a
 * file from their device. Uploads go to /api/upload and come back as a static
 * /uploads/... URL — no external storage needed.
 */
export function ImageUploader({ value, onChange, presets }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"presets" | "upload" | "url">(
    value && !presets.some((p) => p.url === value) ? "url" : "presets"
  );
  const { showToast } = useToast();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5 MB.", "error");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const text = await res.text();
        showToast(text || "Upload failed.", "error");
        return;
      }
      const data = (await res.json()) as { url: string };
      onChange(data.url);
      showToast("Image uploaded.", "success");
    } catch {
      showToast("Upload failed. Try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Mode switcher */}
      <div className="flex gap-1.5">
        <ModeButton active={mode === "presets"} onClick={() => setMode("presets")}>
          Presets
        </ModeButton>
        <ModeButton active={mode === "upload"} onClick={() => setMode("upload")}>
          Upload
        </ModeButton>
        <ModeButton active={mode === "url"} onClick={() => setMode("url")}>
          URL
        </ModeButton>
      </div>

      {/* Preview */}
      {value && (
        <div className="relative aspect-video overflow-hidden rounded-xl border border-[var(--border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover preview" className="h-full w-full object-cover" />
        </div>
      )}

      {mode === "presets" && (
        <div className="grid grid-cols-5 gap-2">
          {presets.map((img) => (
            <button
              key={img.label}
              type="button"
              onClick={() => onChange(img.url)}
              className={cn(
                "group relative aspect-video overflow-hidden rounded-xl border-2 transition-all",
                value === img.url
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                  : "border-[var(--border)] opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-center text-white truncate">
                {img.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {mode === "upload" && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] p-8 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {uploading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <span className="text-2xl">📁</span>
                Click to select an image (JPEG, PNG, WebP — max 5 MB)
              </>
            )}
          </button>
        </div>
      )}

      {mode === "url" && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--white)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
        />
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
          : "text-[var(--muted)] hover:bg-[var(--surface)]"
      )}
    >
      {children}
    </button>
  );
}
