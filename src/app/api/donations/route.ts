import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations, analytics } from "@/db/schema";
import { seedDatabaseIfEmpty } from "@/lib/seed-data";
import { sql, desc, eq, inArray } from "drizzle-orm";
import { getClientIp, rateLimit } from "@/lib/security";
import { getSingletonAnalytics } from "@/lib/singleton";
import { apiError } from "@/lib/apiError";

// Only two statuses are ever shown publicly:
//  - "confirmed": a Razorpay payment whose signature was verified server-side
//    (see /api/donations/verify and /api/donations/webhook)
//  - "unverified": a self-reported UPI/manual entry — real money may well
//    have moved (UPI QR/deep-link payments are real), but we have no
//    programmatic way to confirm it, so it's labelled as such rather than
//    presented with the same confidence as a verified Razorpay payment.
// "pending" (Razorpay order created, not yet paid) and "failed" rows are
// never shown — an abandoned checkout shouldn't appear on the wall.
const PUBLIC_STATUSES = ["confirmed", "unverified"] as const;

export async function GET() {
  try {
    await seedDatabaseIfEmpty();
    const list = await db
      .select()
      .from(donations)
      .where(inArray(donations.status, [...PUBLIC_STATUSES]))
      .orderBy(desc(donations.createdAt));
    return NextResponse.json(list);
  } catch (error: any) {
    return apiError(error, "GET /api/donations");
  }
}

// This endpoint is for the UPI / manual-payment path only, where there is no
// payment gateway callback to verify against. It always saves as
// "unverified" — it does NOT fabricate a fake Razorpay payment id or claim
// verification it can't back up. Real card/netbanking/UPI-via-Razorpay
// payments go through POST /api/donations/order -> checkout -> /verify
// instead, which DOES cryptographically confirm the payment.
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`donate:${ip}`, { limit: 10, windowMs: 10 * 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many donation attempts. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const amount = Math.max(1, Math.min(1_000_000, parseInt(body.amount) || 100));

    const newDonation = await db
      .insert(donations)
      .values({
        donorName: body.donorName || "Anonymous Supporter",
        donorEmail: body.donorEmail || null,
        amount,
        currency: "INR",
        message: body.message || "Supported Harsh Dev Platform",
        paymentMethod: "UPI / QR Code",
        status: "unverified",
      })
      .returning();

    // Update analytics. Note: this counts self-reported UPI entries
    // immediately (same as before), since there's no verification step to
    // wait for on this path. Razorpay donations are counted only once
    // confirmed — see /api/donations/verify and /api/donations/webhook.
    const currentAnalytics = await getSingletonAnalytics();
    if (currentAnalytics) {
      await db
        .update(analytics)
        .set({
          totalDonations: sql`${analytics.totalDonations} + ${amount}`,
        })
        .where(eq(analytics.id, currentAnalytics.id));
    }

    return NextResponse.json(newDonation[0]);
  } catch (error: any) {
    return apiError(error, "POST /api/donations");
  }
}
