import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { createAdminToken } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

// Very small in-memory rate limiter to slow down brute-force login attempts.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const now = Date.now();
    const entry = attempts.get(ip);

    if (entry && now < entry.resetAt && entry.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();

    const envUsername = process.env.ADMIN_USERNAME || "admin";
    const envPassword = process.env.ADMIN_PASSWORD || "admin123";

    // Prefer a DB-stored admin account (created/updated via the "Change Password"
    // feature in the admin panel) so a password change actually takes effect.
    // If no DB account exists yet, fall back to the env-var default credentials.
    const dbAdmins = await db.select().from(adminUsers).limit(1);
    let isValid = false;

    if (dbAdmins.length > 0) {
      const admin = dbAdmins[0];
      isValid =
        (username === admin.username || !username) && verifyPassword(password, admin.passwordHash);
    } else {
      isValid = (username === envUsername || !username) && password === envPassword;
    }

    if (!isValid) {
      const next = entry && now < entry.resetAt
        ? { count: entry.count + 1, resetAt: entry.resetAt }
        : { count: 1, resetAt: now + WINDOW_MS };
      attempts.set(ip, next);
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    attempts.delete(ip);
    return NextResponse.json({
      success: true,
      token: createAdminToken(username || envUsername),
    });
  } catch (error: any) {
    return apiError(error, "POST /api/admin/login");
  }
}
