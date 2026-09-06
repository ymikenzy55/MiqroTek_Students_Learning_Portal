import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/moolre";

// Moolre calls this webhook after a payment is processed. It is a notification,
// not proof — we verify the transaction server-side before fulfilling.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reference = body?.externalref || body?.reference || body?.data?.externalref;

    if (!reference || typeof reference !== "string") {
      return NextResponse.json({ status: "error", message: "Missing reference" }, { status: 400 });
    }

    // Find the pending payment
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { enrollment: true },
    });

    if (!payment) {
      return NextResponse.json({ status: "error", message: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "PAID") {
      // Already fulfilled — idempotent response
      return NextResponse.json({ status: "ok", message: "Already confirmed" });
    }

    // Verify with Moolre
    const verification = await verifyPayment(reference);
    if (!verification || verification.txstatus !== 1) {
      // Payment not successful — keep as PENDING
      return NextResponse.json({ status: "ok", message: "Payment not successful, keeping pending" });
    }

    // Mark as paid
    await prisma.payment.update({
      where: { reference },
      data: {
        status: "PAID",
        paystackRef: verification.transactionid,
      },
    });

    if (payment.enrollment) {
      await prisma.enrollment.update({
        where: { id: payment.enrollment.id },
        data: { status: "ACTIVE" },
      });
    }

    return NextResponse.json({ status: "ok", message: "Payment confirmed" });
  } catch (error) {
    console.error("Moolre callback error:", error);
    return NextResponse.json({ status: "error", message: "Callback failed" }, { status: 500 });
  }
}

// Moolre may also send GET callbacks
export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("externalref") || url.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ status: "error", message: "Missing reference" }, { status: 400 });
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { enrollment: true },
    });

    if (!payment) {
      return NextResponse.json({ status: "error", message: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "PAID") {
      return NextResponse.json({ status: "ok", message: "Already confirmed" });
    }

    const verification = await verifyPayment(reference);
    if (!verification || verification.txstatus !== 1) {
      return NextResponse.json({ status: "ok", message: "Payment not successful" });
    }

    await prisma.payment.update({
      where: { reference },
      data: {
        status: "PAID",
        paystackRef: verification.transactionid,
      },
    });

    if (payment.enrollment) {
      await prisma.enrollment.update({
        where: { id: payment.enrollment.id },
        data: { status: "ACTIVE" },
      });
    }

    return NextResponse.json({ status: "ok", message: "Payment confirmed" });
  } catch (error) {
    console.error("Moolre GET callback error:", error);
    return NextResponse.json({ status: "error", message: "Callback failed" }, { status: 500 });
  }
}
