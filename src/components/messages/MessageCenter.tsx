"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { useToast } from "@/components/ui/Toast";
import {
  broadcastMessageAction,
  getThreadAction,
  markThreadReadAction,
  sendMessageAction,
} from "@/actions/message-actions";
import type { Contact, ThreadMessage } from "@/lib/messages";

interface MessageCenterProps {
  contacts: Contact[];
  role: "STUDENT" | "SUPER_ADMIN";
  /** Preselected counterpart id from the URL, if any. */
  initialContactId?: string;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function MessageCenter({ contacts, role, initialContactId }: MessageCenterProps) {
  const isStaff = role === "SUPER_ADMIN";
  const { clearUnreadFor, onMessage } = useRealtime();
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(
    initialContactId && contacts.some((c) => c.id === initialContactId)
      ? initialContactId
      : contacts[0]?.id ?? null
  );
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, startSend] = useTransition();

  // Broadcast composer (instructor only)
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastDraft, setBroadcastDraft] = useState("");
  const [broadcastTargets, setBroadcastTargets] = useState<"all" | "selected">("all");
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [broadcasting, startBroadcast] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);
  const liveContacts = useRef(contacts);
  liveContacts.current = contacts;

  // Load a thread when the selection changes.
  useEffect(() => {
    if (!selectedId) {
      setThread([]);
      return;
    }
    let cancelled = false;
    setLoadingThread(true);
    getThreadAction(selectedId)
      .then((res) => {
        if (cancelled) return;
        if (res.success) setThread(res.data);
        else showToast(res.error, "error");
      })
      .finally(() => !cancelled && setLoadingThread(false));

    // Mark as read immediately on open.
    markThreadReadAction(selectedId).then((res) => {
      if (res.success && res.count > 0) {
        const contact = liveContacts.current.find((c) => c.id === selectedId);
        clearUnreadFor(selectedId, res.count);
        if (contact) contact.unreadCount = 0;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedId, clearUnreadFor, showToast]);

  // Scroll to the latest message once a thread loads or grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [thread]);

  // Live-update the thread when a new message arrives for the open contact.
  useEffect(() => {
    const unsubscribe = onMessage((incoming) => {
      if (incoming.senderId === selectedId) {
        setThread((prev) => [
          ...prev,
          {
            id: incoming.messageId,
            body: incoming.preview,
            outgoing: false,
            broadcast: incoming.broadcast,
            createdAt: incoming.createdAt,
          },
        ]);
        markThreadReadAction(incoming.senderId).then((res) => {
          if (res.success && res.count > 0) clearUnreadFor(incoming.senderId, res.count);
        });
      }
    });
    return unsubscribe;
  }, [onMessage, selectedId, clearUnreadFor]);

  const selected = contacts.find((c) => c.id === selectedId) ?? null;

  function handleSend() {
    const body = draft.trim();
    if (!body || !selectedId || sending) return;
    const recipientId = selectedId;
    startSend(() => {
      sendMessageAction(recipientId, body).then((res) => {
        if (res.success) {
          setThread(res.data);
          setDraft("");
        } else {
          showToast(res.error, "error");
        }
      });
    });
  }

  function handleBroadcast() {
    const body = broadcastDraft.trim();
    if (!body || broadcasting) return;
    const targets =
      broadcastTargets === "selected" ? [...selectedTargets] : undefined;
    startBroadcast(() => {
      broadcastMessageAction(body, targets).then((res) => {
        if (res.success) {
          showToast(`Announcement delivered to ${res.count} student${res.count === 1 ? "" : "s"}.`, "success");
          setBroadcastDraft("");
          setBroadcastOpen(false);
          setSelectedTargets(new Set());
          setBroadcastTargets("all");
        } else {
          showToast(res.error, "error");
        }
      });
    });
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
        <Icon name="mail" className="h-8 w-8 text-[var(--muted)]" />
        <h3 className="mt-3 text-sm font-semibold text-[var(--foreground)]">No conversations yet</h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">
          {isStaff
            ? "Once students enroll in your courses, they will appear here and you can message them individually or send announcements."
            : "Your instructors will appear here once you are enrolled in a course. Enroll in a course to start a conversation."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Contact list */}
      <aside className="flex max-h-[70vh] flex-col rounded-xl border border-[var(--border)] bg-[var(--white)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            {isStaff ? "Students" : "Instructors"}
          </h2>
          {isStaff && (
            <button
              onClick={() => setBroadcastOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
            >
              <Icon name="megaphone" className="h-3.5 w-3.5" />
              Announce
            </button>
          )}
        </div>
        <ul className="flex-1 overflow-y-auto">
          {contacts.map((contact) => {
            const active = contact.id === selectedId;
            return (
              <li key={contact.id}>
                <button
                  onClick={() => setSelectedId(contact.id)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 border-l-2 px-4 py-3 text-left transition-colors",
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-transparent hover:bg-[var(--background)]"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-[var(--foreground)]">
                      {contact.name}
                    </span>
                    {contact.unreadCount > 0 && (
                      <span className="shrink-0 rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-semibold tabular-nums text-white">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  {contact.lastMessagePreview && (
                    <span className="truncate text-xs text-[var(--muted)]">
                      {contact.lastMessagePreview}
                    </span>
                  )}
                  {contact.courseTitles.length > 0 && (
                    <span className="truncate text-[11px] text-[var(--muted)]/80">
                      {contact.courseTitles.join(", ")}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Thread pane */}
      <section className="flex max-h-[70vh] flex-col rounded-xl border border-[var(--border)] bg-[var(--white)]">
        {selected ? (
          <>
            <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {selected.name}
                </p>
                <p className="truncate text-xs text-[var(--muted)]">{selected.email}</p>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {loadingThread && thread.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted)]">Loading messages…</p>
              ) : thread.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted)]">
                  No messages yet. Say hello 👋
                </p>
              ) : (
                thread.map((m) => (
                  <div
                    key={m.id}
                    className={cn("flex", m.outgoing ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                        m.outgoing
                          ? "rounded-br-sm bg-[var(--accent)] text-white"
                          : "rounded-bl-sm bg-[var(--background)] text-[var(--foreground)]"
                      )}
                    >
                      {m.broadcast && (
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                          Announcement
                        </span>
                      )}
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <span
                        className={cn(
                          "mt-1 block text-[10px]",
                          m.outgoing ? "text-white/70" : "text-[var(--muted)]"
                        )}
                      >
                        {formatTime(m.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <footer className="border-t border-[var(--border)] p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Type a message…  (Enter to send, Shift+Enter for newline)"
                  className="max-h-32 flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-dark)] disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Icon name="send" className="h-4 w-4" />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-[var(--muted)]">
            Select a conversation to view messages.
          </div>
        )}
      </section>

      {/* Broadcast composer (instructor only) */}
      {isStaff && broadcastOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setBroadcastOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[var(--white)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                Send an announcement
              </h3>
              <button
                onClick={() => setBroadcastOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setBroadcastTargets("all")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  broadcastTargets === "all"
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--background)]"
                )}
              >
                All enrolled students ({contacts.length})
              </button>
              <button
                onClick={() => setBroadcastTargets("selected")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  broadcastTargets === "selected"
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--background)]"
                )}
              >
                Select students ({selectedTargets.size})
              </button>
            </div>

            {broadcastTargets === "selected" && (
              <div className="mb-3 max-h-40 overflow-y-auto rounded-lg border border-[var(--border)] p-2">
                {contacts.map((c) => {
                  const checked = selectedTargets.has(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-[var(--background)]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedTargets((prev) => {
                            const next = new Set(prev);
                            if (next.has(c.id)) next.delete(c.id);
                            else next.add(c.id);
                            return next;
                          });
                        }}
                      />
                      <span className="truncate text-[var(--foreground)]">{c.name}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <textarea
              value={broadcastDraft}
              onChange={(e) => setBroadcastDraft(e.target.value)}
              rows={4}
              placeholder="Write your announcement…"
              className="mb-3 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setBroadcastOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[var(--background)]"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                disabled={
                  broadcasting ||
                  !broadcastDraft.trim() ||
                  (broadcastTargets === "selected" && selectedTargets.size === 0)
                }
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] disabled:opacity-40"
              >
                {broadcasting ? "Sending…" : "Send announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
