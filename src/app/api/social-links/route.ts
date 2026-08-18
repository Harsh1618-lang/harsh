import { NextResponse } from "next/server";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

async function seedSocialLinksIfEmpty() {
  const existing = await db.select().from(socialLinks).limit(1);
  if (existing.length > 0) return;
  await db.insert(socialLinks).values([
    { platform: "github", label: "GitHub", url: "https://github.com", icon: "Github", color: "#e2e8f0", sortOrder: 1 },
    { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin", color: "#0A66C2", sortOrder: 2 },
    { platform: "telegram", label: "Telegram", url: "https://t.me/harshdev_official", icon: "Send", color: "#229ED9", sortOrder: 3 },
    { platform: "instagram", label: "Instagram", url: "https://instagram.com/harshdev_official", icon: "Instagram", color: "#E1306C", sortOrder: 4 },
    { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/919999999999", icon: "MessageCircle", color: "#25D366", sortOrder: 5 },
    { platform: "facebook", label: "Facebook", url: "https://facebook.com", icon: "Facebook", color: "#1877F2", sortOrder: 6 },
    { platform: "email", label: "Email", url: "mailto:contact@harshdev.io", icon: "Mail", color: "#00ff88", sortOrder: 7 },
  ]);
}

export async function GET() {
  try {
    await seedSocialLinksIfEmpty();
    const data = await db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder));
    return NextResponse.json(data);
  } catch (error: any) {
    return apiError(error, "GET /api/social-links");
  }
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const created = await db
      .insert(socialLinks)
      .values({
        platform: body.platform,
        label: body.label,
        url: body.url,
        icon: body.icon || "Globe",
        color: body.color || "#00ff88",
        sortOrder: body.sortOrder ?? 99,
        isVisible: body.isVisible ?? true,
      })
      .returning();
    return NextResponse.json(created[0]);
  } catch (error: any) {
    return apiError(error, "POST /api/social-links");
  }
}

export async function PUT(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Only include fields actually provided in the request so partial updates
    // (e.g. just toggling isVisible, or just editing the label/url from the
    // Admin Panel's Edit form) never accidentally null-out other columns.
    const updates: Record<string, any> = {
      platform: body.platform,
      label: body.label,
      url: body.url,
      icon: body.icon,
      color: body.color,
      sortOrder: body.sortOrder,
      isVisible: body.isVisible,
    };
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const updated = await db
      .update(socialLinks)
      .set(updates)
      .where(eq(socialLinks.id, body.id))
      .returning();
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return apiError(error, "PUT /api/social-links");
  }
}

export async function DELETE(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    await db.delete(socialLinks).where(eq(socialLinks.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "DELETE /api/social-links");
  }
}
