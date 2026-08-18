import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations, analytics } from "@/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { getSingletonAnalytics } from "@/lib/singleton";
import { apiError } from "@/lib/apiError";

// Step 4 of the real Razorpay flow — configure this URL
// (https://yourdomain.com/api/donations/webhook) in the Razorpay Dashboard
// under Settings > Webhooks, subscribed to at least `payment.captured` and
// `payment.failed`, with RAZORPAY_WEBHOOK_SECRET set to the same secret
// shown there.
//
// This is the authoritative confirmation path: it comes directly from
// Razorpay's servers (not the user's browser), so it still fires and
// confirms the donation even if the user closed the tab right after paying
// and /api/donations/verify never ran.
//
// IMPORTANT: signature verification requires the RAW request body bytes —
// req.text() is used deliberately instead of req.json() so nothing is
// re-serialized before the HMAC check.
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event as string;
    const paymentEntity = payload?.payload?.payment?.entity;

    if (!paymentEntity?.order_id) {
      // Not a payment-related event we care about — acknowledge and exit.
      return NextResponse.json({ received: true });
    }

    const orderId: string = paymentEntity.order_id;
    const paymentId: string = paymentEntity.id;

    if (event === "payment.captured") {
      const updated = await db
        .update(donations)
        .set({ status: "confirmed", razorpayPaymentId: paymentId })
        .where(and(eq(donations.razorpayOrderId, orderId), ne(donations.status, "confirmed")))
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
    } else if (event === "payment.failed") {
      await db
        .update(donations)
        .set({ status: "failed" })
        .where(and(eq(donations.razorpayOrderId, orderId), ne(donations.status, "confirmed")));
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return apiError(error, "POST /api/donations/webhook");
  }
}
