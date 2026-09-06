/**
 * Moolre payment integration — server-side helpers.
 *
 * Docs: https://docs.moolre.com/
 * Generate Payment Link: POST {MOOLRE_BASE_URL}/embed/link
 * Verify Payment Status: POST {MOOLRE_BASE_URL}/open/transact/status
 *
 * Credentials (all required for payment link generation):
 *   MOOLRE_API_USER      — your Moolre username (sent as X-API-USER header)
 *   MOOLRE_PUBLIC_KEY    — your public API key (sent as X-API-PUBKEY header)
 *   MOOLRE_ACCOUNT_NUMBER — your Moolre wallet account number
 */

const BASE_URL = process.env.MOOLRE_BASE_URL || "https://api.moolre.com";
const API_USER = process.env.MOOLRE_API_USER;
const PUBLIC_KEY = process.env.MOOLRE_PUBLIC_KEY;
const ACCOUNT_NUMBER = process.env.MOOLRE_ACCOUNT_NUMBER;
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export interface MoolrePaymentLink {
  authorizationUrl: string;
  reference: string;
}

export interface MoolrePaymentStatus {
  txstatus: number; // 1 = success
  amount: string;
  transactionid: string;
  externalref: string;
  accountnumber: string;
}

function checkCredentials() {
  if (!API_USER || !PUBLIC_KEY || !ACCOUNT_NUMBER) {
    throw new Error(
      "Moolre credentials not configured. Set MOOLRE_API_USER, MOOLRE_PUBLIC_KEY, and MOOLRE_ACCOUNT_NUMBER in .env.local"
    );
  }
}

/**
 * Generate a hosted Moolre payment link. The student is redirected to the
 * returned `authorizationUrl` to complete payment. Moolre will call the
 * callback webhook and redirect the user back to the redirect URL afterwards.
 */
export async function generatePaymentLink(params: {
  amount: number;
  currency: string;
  email: string;
  externalRef: string;
  metadata?: Record<string, string>;
}): Promise<MoolrePaymentLink> {
  checkCredentials();

  const body = {
    type: 1,
    amount: params.amount.toFixed(2),
    email: params.email,
    externalref: params.externalRef,
    callback: `${APP_URL}/api/payment/moolre/callback`,
    redirect: `${APP_URL}/payment/success?ref=${params.externalRef}`,
    reusable: "0",
    currency: params.currency,
    accountnumber: ACCOUNT_NUMBER,
    expiration_time: 30, // 30 minutes
    metadata: params.metadata,
  };

  const res = await fetch(`${BASE_URL}/embed/link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-USER": API_USER!,
      "X-API-PUBKEY": PUBLIC_KEY!,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.status !== 1 || !data.data?.authorization_url) {
    console.error("Moolre payment link failed:", data);
    throw new Error(data.message || "Failed to generate Moolre payment link.");
  }

  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

/**
 * Verify a payment by its external reference. Always call this before marking
 * an order as paid — the callback/redirect are notifications, not proof.
 */
export async function verifyPayment(externalRef: string): Promise<MoolrePaymentStatus | null> {
  checkCredentials();

  const res = await fetch(`${BASE_URL}/open/transact/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-USER": API_USER!,
      "X-API-PUBKEY": PUBLIC_KEY!,
    },
    body: JSON.stringify({
      type: 1,
      idtype: 1, // 1 = externalref
      id: externalRef,
      accountnumber: ACCOUNT_NUMBER,
    }),
  });

  const data = await res.json();

  if (data.status !== 1 || !data.data) {
    console.error("Moolre verification failed:", data);
    return null;
  }

  return {
    txstatus: data.data.txstatus,
    amount: data.data.amount,
    transactionid: data.data.transactionid,
    externalref: data.data.externalref,
    accountnumber: data.data.accountnumber,
  };
}
