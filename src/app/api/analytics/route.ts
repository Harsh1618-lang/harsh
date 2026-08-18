import { NextResponse } from "next/server";
import { db } from "@/db";
import { analytics } from "@/db/schema";
import { getSingletonAnalytics } from "@/lib/singleton";
import { eq, sql } from "drizzle-orm";
import { apiError } from "@/lib/apiError";

export async function GET() {
  try {
    const data = await getSingletonAnalytics();
    return NextResponse.json(
      data || {
        pageviews: 18450,
        downloads: 5230,
        musicPlays: 24100,
        totalDonations: 34500,
      }
    );
  } catch (error: any) {
    return apiError(error, "GET /api/analytics");
  }
}

export async function POST() {
  try {
    const current = await getSingletonAnalytics();
    if (current) {
      await db
        .update(analytics)
        .set({ pageviews: sql`${analytics.pageviews} + 1` })
        .where(eq(analytics.id, current.id));
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "POST /api/analytics");
  }
}
