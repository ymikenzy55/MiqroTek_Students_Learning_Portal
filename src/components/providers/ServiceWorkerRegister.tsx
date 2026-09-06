"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      // Register the service worker
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        // Check for updates every time the page loads
        registration.update().catch(() => {});

        // When a new SW takes over, reload the page once so the user
        // gets the latest HTML + JS bundle together (no stale mismatch).
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        // Also listen for new SW waiting to activate
        registration.addEventListener("waiting", () => {
          // Send SKIP_WAITING to force the new SW to activate immediately
          registration.waiting?.postMessage("SKIP_WAITING");
        });
      }).catch(() => {});

      // Also check for updates on visibility change (when user tabs back)
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          navigator.serviceWorker.getRegistration().then((reg) => {
            reg?.update().catch(() => {});
          });
        }
      });
    }
  }, []);

  return null;
}
