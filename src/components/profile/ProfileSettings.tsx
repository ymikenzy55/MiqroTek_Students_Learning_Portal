"use client";

import { useState, useTransition, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  changePasswordAction,
  updateProfileAction,
  updateSettingsAction,
} from "@/actions/profile-actions";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
    role: "STUDENT" | "SUPER_ADMIN";
    notifyOnMessage: boolean;
  };
  profile: {
    bio: string | null;
    avatarUrl: string | null;
    title: string | null;
  } | null;
  basePath: string;
}

type Tab = "profile" | "settings" | "security";

export function ProfileSettings({ user, profile, basePath }: ProfileSettingsProps) {
  const isStudent = user.role === "STUDENT";
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, startSave] = useTransition();
  const [pwdSaving, startPwdSave] = useTransition();
  const [settingsSaving, startSettingsSave] = useTransition();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.image || profile?.avatarUrl || "");

  // Local state for settings toggle so it feels instant
  const [notifyOnMessage, setNotifyOnMessage] = useState(user.notifyOnMessage);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5 MB.", "error");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      showToast("Please upload a JPG, PNG, WebP, or GIF image.", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Upload failed.", "error");
        return;
      }
      const data = await res.json();
      setAvatarUrl(data.url);
      showToast("Image uploaded! Click Save Profile to apply.", "success");
    } catch {
      showToast("Failed to upload image.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleProfileSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startSave(async () => {
      const result = await updateProfileAction(formData);
      if (result.success) showToast("Profile updated successfully.", "success");
      else showToast(result.error, "error");
    });
  }

  async function handleSettingsSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startSettingsSave(async () => {
      const result = await updateSettingsAction(formData);
      if (result.success) showToast("Settings saved.", "success");
      else showToast(result.error, "error");
    });
  }

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startPwdSave(async () => {
      const result = await changePasswordAction(formData);
      if (result.success) {
        showToast("Password changed successfully.", "success");
        (e.target as HTMLFormElement).reset();
      } else {
        showToast(result.error, "error");
      }
    });
  }

  const avatarSrc = avatarUrl;

  return (
    <div className="space-y-6">
      {/* Header with avatar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[var(--accent)]/10 text-xl font-bold text-[var(--accent)] transition-all hover:ring-2 hover:ring-[var(--accent)] disabled:opacity-50"
            title="Click to upload a photo"
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
            {/* Overlay on hover */}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {uploading ? "..." : "Change"}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{user.name}</h1>
            <p className="text-sm text-[var(--muted)]">{user.email}</p>
            <span className="mt-1 inline-flex rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
              {isStudent ? "Student" : "Instructor"}
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>
          Profile
        </TabButton>
        <TabButton active={tab === "settings"} onClick={() => setTab("settings")}>
          Settings
        </TabButton>
        <TabButton active={tab === "security"} onClick={() => setTab("security")}>
          Security
        </TabButton>
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <form onSubmit={handleProfileSave} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" name="name" defaultValue={user.name} required />
            <Input label="Email" name="email" type="email" defaultValue={user.email} disabled />
            <Input label="Phone" name="phone" defaultValue={user.phone || ""} placeholder="+233..." />
            {/* Hidden field carries the uploaded avatar URL */}
            <input type="hidden" name="avatarUrl" value={avatarUrl} />
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading
                  ? "Uploading..."
                  : avatarUrl
                    ? "Change Profile Photo"
                    : "Upload Profile Photo"}
              </Button>
            </div>
          </div>

          {!isStudent && (
            <Input
              label="Title"
              name="title"
              defaultValue={profile?.title || ""}
              placeholder="e.g. Senior Instructor"
            />
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              Bio
            </label>
            <textarea
              name="bio"
              rows={4}
              defaultValue={profile?.bio || ""}
              placeholder="Tell us about yourself..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end border-t border-[var(--border)] pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      )}

      {/* Settings tab */}
      {tab === "settings" && (
        <form
          onSubmit={handleSettingsSave}
          className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6"
        >
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">Notifications</h3>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Control how you receive alerts.
            </p>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] p-4">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Message notifications
              </p>
              <p className="text-xs text-[var(--muted)]">
                Show a toast when a new message arrives.
              </p>
            </div>
            <input
              type="checkbox"
              name="notifyOnMessage"
              checked={notifyOnMessage}
              onChange={(e) => setNotifyOnMessage(e.target.checked)}
              className="h-5 w-5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
          </label>

          <div className="flex justify-end border-t border-[var(--border)] pt-4">
            <Button type="submit" disabled={settingsSaving}>
              {settingsSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <form
          onSubmit={handlePasswordChange}
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6"
        >
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">Change Password</h3>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Use a strong, unique password of at least 6 characters.
            </p>
          </div>

          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
          />
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
          />

          <div className="flex justify-end border-t border-[var(--border)] pt-4">
            <Button type="submit" disabled={pwdSaving}>
              {pwdSaving ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function TabButton({
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
      onClick={onClick}
      className={cn(
        "relative px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "text-[var(--accent)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]"
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--accent)]" />
      )}
    </button>
  );
}
