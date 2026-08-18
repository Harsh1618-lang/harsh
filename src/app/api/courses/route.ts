import { NextResponse } from "next/server";
import { db } from "@/db";
import { courses, courseCategories } from "@/db/schema";
import { seedDatabaseIfEmpty } from "@/lib/seed-data";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : "dQw4w9WgXcQ";
}

export async function GET(req: Request) {
  try {
    await seedDatabaseIfEmpty();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let query = db.select().from(courses);
    const allCourses = await query;

    let filtered = allCourses;
    if (category && category !== "All") {
      filtered = allCourses.filter(
        (c) => c.category.toLowerCase() === category.toLowerCase()
      );
    }

    const categories = await db.select().from(courseCategories);

    return NextResponse.json({
      courses: filtered,
      categories: categories,
    });
  } catch (error: any) {
    return apiError(error, "GET /api/courses");
  }
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const videoId = extractYouTubeId(body.youtubeUrl || "");
    const slug = (body.title || "course")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4);

    const thumbnail =
      body.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    const newCourse = await db
      .insert(courses)
      .values({
        title: body.title,
        slug,
        category: body.category || "Programming",
        description: body.description || "",
        thumbnail,
        duration: body.duration || "2h 15m",
        level: body.level || "Beginner to Advanced",
        youtubeUrl: body.youtubeUrl,
        youtubeVideoId: videoId,
        views: 0,
        isFeatured: body.isFeatured ?? true,
      })
      .returning();

    return NextResponse.json(newCourse[0]);
  } catch (error: any) {
    return apiError(error, "POST /api/courses");
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
    await db.delete(courses).where(eq(courses.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "DELETE /api/courses");
  }
}
