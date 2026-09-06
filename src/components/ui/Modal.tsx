"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  destructive?: boolean;
  loading?: boolean;
  icon?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
  loading = false,
  icon,
}: ModalProps) {
  // The modal is rendered from inside the sidebar / mobile drawer, which are
  // themselves positioned and clipped. Portalling to <body> keeps the overlay
  // out of those stacking contexts so it always covers the whole viewport.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--primary)]/60 backdrop-blur-sm"
        style={{ animation: "backdropIn 160ms ease-out" }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-2xl"
        style={{ animation: "modalIn 160ms ease-out" }}
      >
        <div className="flex gap-4">
          {icon && (
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                destructive
                  ? "bg-[var(--danger)]/10 text-[var(--danger)]"
                  : "bg-[var(--accent)]/10 text-[var(--accent)]"
              }`}
            >
              <Icon name={icon} className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2
              id="modal-title"
              className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
            >
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                {description}
              </p>
            )}
          </div>
        </div>

        {children}

        {onConfirm && (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={loading}
              autoFocus
            >
              {loading ? "Please wait..." : confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
