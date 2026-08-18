import { NextResponse } from "next/server";
import { db } from "@/db";
import { apps } from "@/db/schema";
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
      name: body.name,
      version: body.version,
      category: body.category,
      icon: body.icon,
      description: body.description,
      size: body.size,
      apkUrl: body.apkUrl,
      telegramUrl: body.telegramUrl,
      websiteUrl: body.websiteUrl,
      playstoreUrl: body.playstoreUrl,
      rating: body.rating !== undefined ? Number(body.rating) : undefined,
    };
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const updated = await db
      .update(apps)
      .set(updates)
      .where(eq(apps.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return apiError(error, "PUT /api/apps/[id]");
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    await db.delete(apps).where(eq(apps.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "DELETE /api/apps/[id]");
  }
}
