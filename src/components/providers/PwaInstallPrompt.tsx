"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or installed
    const dismissedBefore = localStorage.getItem("miqrotek-pwa-dismissed");
    if (dismissedBefore) {
      setDismissed(true);
      return;
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    function handler(e: Event) {
      // Prevent the default browser prompt
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handler);

    // Also listen for the installed event
    window.addEventListener("appinstalled", () => {
      setVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("miqrotek-pwa-dismissed", "true");
  }

  if (!visible || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-[var(--border)] bg-[var(--white)] p-4 shadow-xl"
      style={{ animation: "fadeSlideIn 250ms ease-out" }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-xl">
          📱
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Install Miqrotek</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Add to your home screen for quick access anytime, even offline.
          </p>
          <div className="mt-3 flex gap-2">
            <Button onClick={handleInstall} className="flex-1">
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface)]"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
