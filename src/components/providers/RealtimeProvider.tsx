"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export interface IncomingMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  preview: string;
  broadcast: boolean;
  createdAt: string;
}

interface RealtimeContextValue {
  unreadCount: number;
  /** Called by thread views after they mark a conversation as read. */
  clearUnreadFor: (senderId: string, amount: number) => void;
  /** Subscribe to incoming messages; returns an unsubscribe function. */
  onMessage: (listener: (message: IncomingMessage) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error("useRealtime must be used within RealtimeProvider");
  return ctx;
}

interface RealtimeProviderProps {
  /** Initial unread count from the database; defaults to 0. */
  initialUnreadCount?: number;
  /** Whether to show a toast on each incoming message; defaults to true. */
  notifyOnMessage?: boolean;
  children: ReactNode;
}

export function RealtimeProvider({
  initialUnreadCount = 0,
  notifyOnMessage = true,
  children,
}: RealtimeProviderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const listeners = useRef(new Set<(message: IncomingMessage) => void>());

  // Keep the badge in sync when the server re-renders with a fresh count
  // (navigation, revalidatePath) so it never drifts from the database.
  useEffect(() => setUnreadCount(initialUnreadCount), [initialUnreadCount]);

  const onMessage = useCallback((listener: (message: IncomingMessage) => void) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const clearUnreadFor = useCallback((_senderId: string, amount: number) => {
    setUnreadCount((prev) => Math.max(0, prev - amount));
  }, []);

  useEffect(() => {
    // EventSource reconnects on its own using the `retry` hint from the server,
    // so there is no manual backoff to manage here.
    const source = new EventSource("/api/realtime");

    source.onmessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }

      if (payload.type === "message:new") {
        const incoming: IncomingMessage = payload;
        setUnreadCount((prev) => prev + 1);
        listeners.current.forEach((listener) => listener(incoming));

        if (notifyOnMessage) {
          showToast(
            `${incoming.senderName}${incoming.broadcast ? " (announcement)" : ""}: ${incoming.preview}`,
            "info"
          );
        }
        return;
      }

      if (payload.type === "enrollment:new") {
        showToast(
          `${payload.studentName} just enrolled in ${payload.courseTitle}`,
          "success"
        );
        // Pulls the instructor's student list/dashboard up to date in place.
        router.refresh();
      }
    };

    return () => source.close();
  }, [notifyOnMessage, showToast, router]);

  return (
    <RealtimeContext.Provider value={{ unreadCount, clearUnreadFor, onMessage }}>
      {children}
    </RealtimeContext.Provider>
  );
}
