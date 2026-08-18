import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────
// Admin session tokens.
//
// The login route used to hand back `base64("username:timestamp")` — that
// has no signature at all, so anyone could construct their own token
// client-side. Worse, until this file existed, NO write route (settings,
// courses, apps, music, profile, social-links, resume, upload, messages)
// ever checked for a token in the first place, meaning every admin-only
// mutation was reachable by anyone who found the endpoint, logged in or not.
//
// This module fixes both: tokens are HMAC-signed and time-limited, and
// `requireAdmin()` is called at the top of every admin-only route handler.
// ─────────────────────────────────────────────────────────────────────────

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  // Fall back to the admin password so a token is still tied to a secret
  // only the site owner knows, even if ADMIN_SESSION_SECRET was never set.
  // Set ADMIN_SESSION_SECRET explicitly in production for a secret that's
  // independent of the login password.
  return `harshdev-fallback::${process.env.ADMIN_PASSWORD || "admin123"}`;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createAdminToken(username: string): string {
  const payload = JSON.stringify({ u: username, iat: Date.now(), exp: Date.now() + SESSION_TTL_MS });
  const encodedPayload = base64url(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [encodedPayload, signature] = parts;

  const expectedSig = sign(encodedPayload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Call at the top of every admin-only route handler. Returns null when the
 * request carries a valid admin session token, otherwise returns a 401
 * NextResponse that the caller should return immediately.
 *
 * Usage:
 *   const denied = requireAdmin(req);
 *   if (denied) return denied;
 */
export function requireAdmin(req: Request): NextResponse | null {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in to the admin panel again." },
      { status: 401 }
    );
  }
  return null;
}
