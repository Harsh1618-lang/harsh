import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

export async function GET() {
  try {
    const dbAdmins = await db.select().from(adminUsers).limit(1);
    const username = dbAdmins[0]?.username || process.env.ADMIN_USERNAME || "admin";
    return NextResponse.json({ username, hasCustomPassword: dbAdmins.length > 0 });
  } catch (error: any) {
    return apiError(error, "GET /api/admin/change-password");
  }
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { currentPassword, newUsername, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const envUsername = process.env.ADMIN_USERNAME || "admin";
    const envPassword = process.env.ADMIN_PASSWORD || "admin123";

    const dbAdmins = await db.select().from(adminUsers).limit(1);

    let currentIsValid = false;
    let existingUsername = envUsername;

    if (dbAdmins.length > 0) {
      existingUsername = dbAdmins[0].username;
      currentIsValid = verifyPassword(currentPassword, dbAdmins[0].passwordHash);
    } else {
      currentIsValid = currentPassword === envPassword;
    }

    if (!currentIsValid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const finalUsername = (newUsername && String(newUsername).trim()) || existingUsername;
    const passwordHash = hashPassword(newPassword);

    if (dbAdmins.length > 0) {
      await db
        .update(adminUsers)
        .set({ username: finalUsername, passwordHash, updatedAt: new Date() })
        .where(eq(adminUsers.id, dbAdmins[0].id));
    } else {
      await db.insert(adminUsers).values({
        username: finalUsername,
        passwordHash,
        role: "owner",
      });
    }

    return NextResponse.json({ success: true, username: finalUsername });
  } catch (error: any) {
    return apiError(error, "POST /api/admin/change-password");
  }
}
