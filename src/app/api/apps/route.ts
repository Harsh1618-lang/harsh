import { NextResponse } from "next/server";
import { db } from "@/db";
import { apps } from "@/db/schema";
import { seedDatabaseIfEmpty } from "@/lib/seed-data";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

export async function GET(req: Request) {
  try {
    await seedDatabaseIfEmpty();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let allApps = await db.select().from(apps);

    if (category && category !== "All") {
      allApps = allApps.filter(
        (a) => a.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      allApps = allApps.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(allApps);
  } catch (error: any) {
    return apiError(error, "GET /api/apps");
  }
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();

    if (!body.name || !body.apkUrl) {
      return NextResponse.json(
        { error: "App name and APK download URL are required." },
        { status: 400 }
      );
    }

    // Only store link fields the admin actually filled in — previously these
    // silently fell back to placeholder/dead links (e.g. bare "https://t.me"
    // or "#"), which rendered clickable buttons on the public Apps sheet that
    // went nowhere useful. Leaving them null hides the button entirely
    // instead of showing a broken one.
    const newApp = await db
      .insert(apps)
      .values({
        name: body.name,
        version: body.version || "v1.0.0",
        category: body.category || "Utility",
        icon: body.icon || "📱",
        description: body.description || "",
        size: body.size || "15 MB",
        downloads: body.downloads || 100,
        apkUrl: body.apkUrl,
        telegramUrl: body.telegramUrl || null,
        websiteUrl: body.websiteUrl || null,
        playstoreUrl: body.playstoreUrl || null,
        rating: body.rating || 4.9,
      })
      .returning();

    return NextResponse.json(newApp[0]);
  } catch (error: any) {
    return apiError(error, "POST /api/apps");
  }
}

export async function DELETE(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }
    await db.delete(apps).where(eq(apps.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "DELETE /api/apps");
  }
}
