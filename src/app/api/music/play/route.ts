import { NextResponse } from "next/server";
import { db } from "@/db";
import { music, analytics, playLogs } from "@/db/schema";
import { getSingletonAnalytics } from "@/lib/singleton";
import { eq, sql } from "drizzle-orm";
import { apiError } from "@/lib/apiError";

export async function POST(req: Request) {
  try {
    const { trackId } = await req.json();
    let trackTitle = "Unknown Track";
    if (trackId) {
      const [track] = await db.select().from(music).where(eq(music.id, trackId)).limit(1);
      trackTitle = track?.title || trackTitle;
      await db
        .update(music)
        .set({ plays: sql`${music.plays} + 1` })
        .where(eq(music.id, trackId));
    }

    await db.insert(playLogs).values({ trackId: trackId || null, trackTitle });

    const currentAnalytics = await getSingletonAnalytics();
    if (currentAnalytics) {
      await db
        .update(analytics)
        .set({ musicPlays: sql`${analytics.musicPlays} + 1` })
        .where(eq(analytics.id, currentAnalytics.id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "POST /api/music/play");
  }
}
