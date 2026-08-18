import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations, analytics } from "@/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getSingletonAnalytics } from "@/lib/singleton";
import { apiError } from "@/lib/apiError";

// Step 3 of the real Razorpay flow. Called by the client immediately after
// checkout.js reports success. We recompute the HMAC signature server-side
// (the client never has access to RAZORPAY_KEY_SECRET, so it cannot forge
// this) and only flip the donation to "confirmed" if it matches.
//
// This is the fast path for UX (instant "Thank you" without waiting on a
// webhook round-trip). /api/donations/webhook is a backstop for cases where
// the client never reaches this endpoint at all (tab closed, network drop
// right after payment).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
    }

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      // Mark it failed rather than silently leaving it pending — a bad
      // signature here means either tampering or a genuine payment
      // failure, and either way it shouldn't stay in limbo.
      await db
        .update(donations)
        .set({ status: "failed" })
        .where(eq(donations.razorpayOrderId, razorpay_order_id));
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    // Only transition rows that aren't already confirmed — guards against
    // double-counting analytics if the webhook also fires for the same
    // payment (whichever one lands first wins; the second is a no-op).
    const updated = await db
      .update(donations)
      .set({ status: "confirmed", razorpayPaymentId: razorpay_payment_id })
      .where(and(eq(donations.razorpayOrderId, razorpay_order_id), ne(donations.status, "confirmed")))
      .returning();

    if (updated.length > 0) {
      const currentAnalytics = await getSingletonAnalytics();
      if (currentAnalytics) {
        await db
          .update(analytics)
          .set({ totalDonations: sql`${analytics.totalDonations} + ${updated[0].amount}` })
          .where(eq(analytics.id, currentAnalytics.id));
      }
    }

    const donation =
      updated[0] ||
      (await db.select().from(donations).where(eq(donations.razorpayOrderId, razorpay_order_id)).limit(1))[0];

    return NextResponse.json({ success: true, donation });
  } catch (error: any) {
    return apiError(error, "POST /api/donations/verify");
  }
}
