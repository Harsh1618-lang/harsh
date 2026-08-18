import { NextResponse } from "next/server";
import { db } from "@/db";
import { apps, analytics, downloadLogs } from "@/db/schema";
import { getSingletonAnalytics } from "@/lib/singleton";
import { eq, sql } from "drizzle-orm";
import { apiError } from "@/lib/apiError";

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: Request) {
  try {
    const { appId } = await req.json();
    let appName = "Unknown App";
    if (appId) {
      const [app] = await db.select().from(apps).where(eq(apps.id, appId)).limit(1);
      appName = app?.name || appName;
      await db
        .update(apps)
        .set({ downloads: sql`${apps.downloads} + 1` })
        .where(eq(apps.id, appId));
    }

    await db.insert(downloadLogs).values({
      appId: appId || null,
      appName,
      ip: getClientIp(req),
    });

    const currentAnalytics = await getSingletonAnalytics();
    if (currentAnalytics) {
      await db
        .update(analytics)
        .set({ downloads: sql`${analytics.downloads} + 1` })
        .where(eq(analytics.id, currentAnalytics.id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "POST /api/apps/download");
  }
}
