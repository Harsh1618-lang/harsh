import { NextResponse } from "next/server";
import { db } from "@/db";
import { music, musicCategories } from "@/db/schema";
import { seedDatabaseIfEmpty } from "@/lib/seed-data";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

export async function GET(req: Request) {
  try {
    await seedDatabaseIfEmpty();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let allMusic = await db.select().from(music);

    if (category && category !== "All") {
      if (category.toLowerCase() === "trending") {
        allMusic = allMusic.filter((m) => m.isTrending);
      } else {
        allMusic = allMusic.filter(
          (m) => m.category.toLowerCase() === category.toLowerCase()
        );
      }
    }

    const categories = await db.select().from(musicCategories);

    return NextResponse.json({
      music: allMusic,
      categories,
    });
  } catch (error: any) {
    return apiError(error, "GET /api/music");
  }
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const newTrack = await db
      .insert(music)
      .values({
        title: body.title,
        artist: body.artist || "Harsh Dev Studio",
        album: body.album || "Single",
        category: body.category || "LoFi",
        coverUrl:
          body.coverUrl ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
        audioUrl: body.audioUrl,
        duration: body.duration || "3:30",
        plays: 0,
        isTrending: body.isTrending ?? false,
      })
      .returning();

    return NextResponse.json(newTrack[0]);
  } catch (error: any) {
    return apiError(error, "POST /api/music");
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
    await db.delete(music).where(eq(music.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "DELETE /api/music");
  }
}
