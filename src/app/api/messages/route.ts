import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getClientIp, rateLimit, isValidEmail, sanitizeText } from "@/lib/security";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const list = await db.select().from(messages).orderBy(desc(messages.createdAt));
    return NextResponse.json(list);
  } catch (error: any) {
    return apiError(error, "GET /api/messages");
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { error: "You're sending messages too fast. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const name = sanitizeText(body.name, 200);
    const email = sanitizeText(body.email, 200);
    const subject = sanitizeText(body.subject, 300) || "General Inquiry";
    const message = sanitizeText(body.message, 5000);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    const newMessage = await db
      .insert(messages)
      .values({
        name,
        email,
        subject,
        message,
        isRead: false,
      })
      .returning();

    return NextResponse.json(newMessage[0]);
  } catch (error: any) {
    return apiError(error, "POST /api/messages");
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
    await db.delete(messages).where(eq(messages.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error, "DELETE /api/messages");
  }
}
