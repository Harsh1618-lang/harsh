import { NextResponse } from "next/server";
import { db } from "@/db";
import { music } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, any> = {
      title: body.title,
      artist: body.artist,
      album: body.album,
      category: body.category,
      coverUrl: body.coverUrl,
      audioUrl: body.audioUrl,
      duration: body.duration,
      isTrending: body.isTrending,
    };
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const updated = await db
      .update(music)
      .set(updates)
      .where(eq(music.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return apiError(error, "PUT /api/music/[id]");
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    await db.delete(music).where(eq(music.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "DELETE /api/music/[id]");
  }
}
