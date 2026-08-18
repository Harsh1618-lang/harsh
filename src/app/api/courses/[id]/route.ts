import { NextResponse } from "next/server";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : "";
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, any> = {
      title: body.title,
      category: body.category,
      description: body.description,
      duration: body.duration,
      level: body.level,
    };

    if (body.youtubeUrl) {
      const videoId = extractYouTubeId(body.youtubeUrl);
      updates.youtubeUrl = body.youtubeUrl;
      if (videoId) {
        updates.youtubeVideoId = videoId;
        updates.thumbnail = body.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    if (body.thumbnail) updates.thumbnail = body.thumbnail;

    // Strip undefined keys so we don't overwrite existing values with undefined
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const updated = await db
      .update(courses)
      .set(updates)
      .where(eq(courses.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return apiError(error, "PUT /api/courses/[id]");
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    await db.delete(courses).where(eq(courses.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "DELETE /api/courses/[id]");
  }
}
