import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getClientIp, rateLimit } from "@/lib/security";
import { createRazorpayOrder, isRazorpayConfigured, getRazorpayKeyId } from "@/lib/razorpay";
import { apiError } from "@/lib/apiError";

// Step 1 of the real Razorpay flow: create a Razorpay Order server-side and
// a matching `pending` donation row. Nothing here is trusted as "paid" yet —
// that only happens once /api/donations/verify or /api/donations/webhook
// confirms a signature-verified payment against this order id.
export async function POST(req: Request) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          error:
            "Razorpay isn't configured on this server yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, or use the UPI option instead.",
        },
        { status: 503 }
      );
    }

    const ip = getClientIp(req);
    const { allowed } = rateLimit(`donate-order:${ip}`, { limit: 10, windowMs: 10 * 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many donation attempts. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const amount = Math.max(10, Math.min(1_000_000, parseInt(body.amount) || 100));
    const donorName = (body.donorName || "Anonymous Supporter").toString().slice(0, 200);
    const donorEmail = body.donorEmail ? body.donorEmail.toString().slice(0, 200) : null;
    const message = (body.message || "Supported Harsh Dev Platform").toString().slice(0, 1000);

    // Insert the pending row first so we have a donation id to use as the
    // Razorpay receipt reference (useful for reconciliation in the Razorpay
    // dashboard), then create the order and store its id on the row.
    const inserted = await db
      .insert(donations)
      .values({
        donorName,
        donorEmail,
        amount,
        currency: "INR",
        message,
        paymentMethod: "Razorpay",
        status: "pending",
      })
      .returning();

    const donation = inserted[0];

    let order;
    try {
      order = await createRazorpayOrder(amount * 100, `donation_${donation.id}`);
    } catch (orderErr) {
      // Don't leave an orphaned pending row with no order behind it if
      // Razorpay's API call itself failed.
      await db.update(donations).set({ status: "failed" }).where(eq(donations.id, donation.id));
      throw orderErr;
    }

    await db.update(donations).set({ razorpayOrderId: order.id }).where(eq(donations.id, donation.id));

    return NextResponse.json({
      donationId: donation.id,
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: getRazorpayKeyId(),
    });
  } catch (error: any) {
    return apiError(error, "POST /api/donations/order");
  }
}
