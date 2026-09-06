import { auth } from "@/lib/auth";
import { subscribe, type RealtimeEvent } from "@/lib/realtime";

// Must stay on Node and never be cached or statically analysed — this response
// is a long-lived stream, not a document.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 25_000;

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      function send(payload: string) {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          // The client vanished between our check and the write.
          closed = true;
        }
      }

      function sendEvent(event: RealtimeEvent) {
        send(`data: ${JSON.stringify(event)}\n\n`);
      }

      // Tells the browser to wait 5s before reconnecting, and flushes headers
      // so `onopen` fires immediately rather than on the first real event.
      send("retry: 5000\n\n");
      send(": connected\n\n");

      const unsubscribe = subscribe(userId, sendEvent);

      // Keeps intermediary proxies from closing an idle connection.
      const heartbeat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);

      function cleanup() {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed by the runtime.
        }
      }

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      // Disables response buffering on nginx, which would otherwise hold
      // events until the buffer filled.
      "X-Accel-Buffering": "no",
    },
  });
}
