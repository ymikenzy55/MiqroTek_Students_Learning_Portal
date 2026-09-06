"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { initiateMoolrePaymentAction } from "@/actions/payment-actions";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  price: number;
  currency: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  price,
  currency,
}: PaymentModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handlePay() {
    setLoading(true);

    const result = await initiateMoolrePaymentAction(courseId);
    setLoading(false);

    if (result.success) {
      if (result.free) {
        showToast(`You are now enrolled in ${courseTitle}!`, "success");
        onClose();
        return;
      }
      // Redirect to Moolre hosted checkout
      window.location.href = result.authorizationUrl;
    } else {
      showToast(result.error || "Could not start payment. Please try again.", "error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--white)] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">Pay for Course</h3>
            <p className="text-xs text-[var(--muted)]">{courseTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-[var(--surface)] p-4 text-center border border-[var(--border)]">
            <p className="text-xs text-[var(--muted)]">Total Payable Amount</p>
            <p className="text-3xl font-extrabold text-[var(--accent)] mt-1">
              {price > 0 ? `${currency} ${price.toFixed(2)}` : "FREE"}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 space-y-2">
            <p className="text-sm font-medium text-[var(--foreground)]">
              You will be redirected to Moolre's secure checkout
            </p>
            <p className="text-xs text-[var(--muted)]">
              Moolre supports Mobile Money (MTN, Telecel, AirtelTigo), bank cards,
              and bank transfers. Your payment is processed securely by Moolre.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                MTN MoMo
              </span>
              <span className="rounded-md bg-red-400/20 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                Telecel Cash
              </span>
              <span className="rounded-md bg-blue-400/20 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                AirtelTigo
              </span>
              <span className="rounded-md bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)] border border-[var(--border)]">
                Visa / Mastercard
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handlePay} disabled={loading} className="w-full sm:w-auto">
              {loading
                ? "Redirecting to checkout..."
                : `Pay ${price > 0 ? `${currency} ${price.toFixed(2)}` : "Now"}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
