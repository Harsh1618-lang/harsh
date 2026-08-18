import { NextResponse } from "next/server";
import { getSingletonProfile, updateSingletonProfile } from "@/lib/singleton";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

// Always reflect the latest admin edits (name, bio, avatar, resume link,
// etc.) — never let this route get cached by the platform/browser.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSingletonProfile();
    return NextResponse.json(data || null);
  } catch (error: any) {
    return apiError(error, "GET /api/profile");
  }
}

export async function PUT(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    delete body.id;
    delete body.singletonKey;

    const updated = await updateSingletonProfile({ ...body, updatedAt: new Date() });
    return NextResponse.json(updated);
  } catch (error: any) {
    return apiError(error, "PUT /api/profile");
  }
}
