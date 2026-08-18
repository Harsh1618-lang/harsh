import { createHmac, timingSafeEqual } from "crypto";

// ─────────────────────────────────────────────────────────────────────────
// Real Razorpay integration (replaces the old "Razorpay Simulated" flow,
// which just wrote whatever the client claimed straight into the DB with no
// verification at all).
//
// Flow:
//   1. Client asks POST /api/donations/order for an amount -> we create a
//      real Razorpay Order via their REST API and store a `pending`
//      donation row tied to that order id.
//   2. Client opens Razorpay's checkout.js with that order id. User pays.
//   3. On success, checkout.js hands the client razorpay_payment_id +
//      razorpay_order_id + razorpay_signature. Client posts those to
//      POST /api/donations/verify, which recomputes the HMAC signature
//      SERVER-SIDE using our secret key and only marks the donation
//      `confirmed` if it matches — the client can't forge this because it
//      never has RAZORPAY_KEY_SECRET.
//   4. POST /api/donations/webhook is configured in the Razorpay dashboard
//      as a defense-in-depth backstop: even if the user closes the tab
//      right after paying (before step 3 completes), Razorpay's own server
//      will still call our webhook with a payment.captured event, verified
//      against RAZORPAY_WEBHOOK_SECRET, and confirm the donation anyway.
//
// Only donations that reach `status = "confirmed"` through one of these
// signature-verified paths are eligible to appear on the public Wall of
// Supporters — see the GET handler in /api/donations/route.ts.
// ─────────────────────────────────────────────────────────────────────────

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayKeyId(): string | undefined {
  return process.env.RAZORPAY_KEY_ID;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

/**
 * Creates a real Order via Razorpay's REST API (Basic Auth with key_id:key_secret).
 * Amount must be in the smallest currency unit (paise for INR, i.e. rupees * 100).
 * Throws on any non-2xx response — caller should catch and surface a clean error.
 */
export async function createRazorpayOrder(amountPaise: number, receipt: string): Promise<RazorpayOrder> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured on this server.");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      payment_capture: 1, // auto-capture on successful auth, standard for donation-style flows
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[razorpay] order creation failed:", res.status, detail);
    throw new Error("Could not create Razorpay order.");
  }

  return res.json();
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verifies the signature Razorpay's checkout.js returns to the client after
 * a successful payment: HMAC-SHA256 of `${order_id}|${payment_id}` signed
 * with our key_secret. Only the party holding key_secret (us, server-side)
 * can produce this, so a match proves the payment_id genuinely belongs to
 * that order and wasn't fabricated by the client.
 */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/**
 * Verifies an incoming Razorpay webhook call: HMAC-SHA256 of the RAW request
 * body, signed with the separate webhook secret configured in the Razorpay
 * dashboard. Must be computed over the exact raw bytes Razorpay sent —
 * re-serializing parsed JSON can produce a different byte sequence and break
 * verification, so callers must pass the untouched request body text.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
