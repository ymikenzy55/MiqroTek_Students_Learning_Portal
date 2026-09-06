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

export interface IncomingNotification {
  notificationId: string;
  notificationType: string;
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
}

interface RealtimeContextValue {
  unreadCount: number;
  unreadNotifications: number;
  /** Called by thread views after they mark a conversation as read. */
  clearUnreadFor: (senderId: string, amount: number) => void;
  /** Subscribe to incoming messages; returns an unsubscribe function. */
  onMessage: (listener: (message: IncomingMessage) => void) => () => void;
  /** Subscribe to incoming notifications; returns an unsubscribe function. */
  onNotification: (listener: (notification: IncomingNotification) => void) => () => void;
  /** Called when a notification is read to decrement the badge. */
  decrementNotifications: (amount: number) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error("useRealtime must be used within RealtimeProvider");
  return ctx;
}

interface RealtimeProviderProps {
  /** Initial unread message count from the database; defaults to 0. */
  initialUnreadCount?: number;
  /** Initial unread notification count from the database; defaults to 0. */
  initialUnreadNotifications?: number;
  /** Whether to show a toast on each incoming message; defaults to true. */
  notifyOnMessage?: boolean;
  children: ReactNode;
}

export function RealtimeProvider({
  initialUnreadCount = 0,
  initialUnreadNotifications = 0,
  notifyOnMessage = true,
  children,
}: RealtimeProviderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [unreadNotifications, setUnreadNotifications] = useState(initialUnreadNotifications);
  const messageListeners = useRef(new Set<(message: IncomingMessage) => void>());
  const notifListeners = useRef(new Set<(notification: IncomingNotification) => void>());

  // Keep the badge in sync when the server re-renders with a fresh count
  useEffect(() => {
    setUnreadCount(initialUnreadCount);
    setUnreadNotifications(initialUnreadNotifications);
  }, [initialUnreadCount, initialUnreadNotifications]);

  const onMessage = useCallback((listener: (message: IncomingMessage) => void) => {
    messageListeners.current.add(listener);
    return () => messageListeners.current.delete(listener);
  }, []);

  const onNotification = useCallback((listener: (notification: IncomingNotification) => void) => {
    notifListeners.current.add(listener);
    return () => notifListeners.current.delete(listener);
  }, []);

  const clearUnreadFor = useCallback((_senderId: string, amount: number) => {
    setUnreadCount((prev) => Math.max(0, prev - amount));
  }, []);

  const decrementNotifications = useCallback((amount: number) => {
    setUnreadNotifications((prev) => Math.max(0, prev - amount));
  }, []);

  useEffect(() => {
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
        messageListeners.current.forEach((listener) => listener(incoming));

        if (notifyOnMessage) {
          showToast(
            `${incoming.senderName}${incoming.broadcast ? " (announcement)" : ""}: ${incoming.preview}`,
            "info"
          );
        }
        return;
      }

      if (payload.type === "notification:new") {
        const incoming: IncomingNotification = payload;
        setUnreadNotifications((prev) => prev + 1);
        notifListeners.current.forEach((listener) => listener(incoming));
        showToast(incoming.title, "info");
        return;
      }

      if (payload.type === "enrollment:new") {
        showToast(
          `${payload.studentName} just enrolled in ${payload.courseTitle}`,
          "success"
        );
        router.refresh();
      }
    };

    return () => source.close();
  }, [notifyOnMessage, showToast, router]);

  return (
    <RealtimeContext.Provider
      value={{
        unreadCount,
        unreadNotifications,
        clearUnreadFor,
        onMessage,
        onNotification,
        decrementNotifications,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}
