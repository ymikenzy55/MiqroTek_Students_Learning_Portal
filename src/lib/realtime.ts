/**
 * In-process pub/sub used to push events to connected browsers over SSE.
 *
 * Scope and limits: subscribers live in the memory of a single Node process, so
 * this only fans out to clients connected to *this* instance. That is correct
 * for `next dev` and for a single long-running server (VPS / Render / Fly /
 * Docker). If this app is ever scaled to multiple instances or deployed to a
 * serverless platform, `publish` must be backed by a shared broker (Redis
 * pub/sub, Postgres LISTEN/NOTIFY, Ably/Pusher) — everything else can stay.
 */

export type RealtimeEvent =
  | {
      type: "message:new";
      messageId: string;
      senderId: string;
      senderName: string;
      preview: string;
      broadcast: boolean;
      createdAt: string;
    }
  | { type: "message:read"; byUserId: string }
  | { type: "enrollment:new"; studentName: string; courseTitle: string };

type Subscriber = (event: RealtimeEvent) => void;

// Survives Turbopack/webpack HMR module reloads in development, which would
// otherwise orphan every open connection on each edit.
const globalForRealtime = globalThis as unknown as {
  realtimeSubscribers: Map<string, Set<Subscriber>> | undefined;
};

const subscribers =
  globalForRealtime.realtimeSubscribers ??
  (globalForRealtime.realtimeSubscribers = new Map<string, Set<Subscriber>>());

/** Registers a listener for one user. Returns an unsubscribe function. */
export function subscribe(userId: string, listener: Subscriber) {
  let set = subscribers.get(userId);
  if (!set) {
    set = new Set();
    subscribers.set(userId, set);
  }
  set.add(listener);

  return () => {
    const current = subscribers.get(userId);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) subscribers.delete(userId);
  };
}

/** Delivers an event to every open connection belonging to `userId`. */
export function publish(userId: string, event: RealtimeEvent) {
  const set = subscribers.get(userId);
  if (!set) return;

  for (const listener of set) {
    // One broken connection must not stop delivery to the others.
    try {
      listener(event);
    } catch (error) {
      console.error("❌ Realtime delivery failed:", error);
    }
  }
}

export function publishToMany(userIds: string[], event: RealtimeEvent) {
  for (const userId of userIds) publish(userId, event);
}
