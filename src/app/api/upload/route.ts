import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { storagePathFor, publicUrlFor } from "@/lib/storage";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudStorage";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

// Generic image upload endpoint used by the Admin Panel for: custom site
// background, navbar logo image, and hero avatar photo. Accepts multipart
// form-data with a "file" field and an optional "folder" field (e.g. "backgrounds").
//
// Files are written to a non-public storage directory and served back via
// the `/api/files/[...path]` route handler — see src/lib/storage.ts for why
// (Next.js's static `public/` serving does not reliably pick up files
// written to disk after the production server has already started).
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = ((formData.get("folder") as string) || "general").replace(/[^a-z0-9_-]/gi, "");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PNG, JPG, WEBP, GIF or SVG image." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large. Maximum size is 8MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const safeName = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Prefer Cloudinary when configured — it persists across deploys/
    // restarts on ephemeral/serverless hosts, unlike local disk. See
    // src/lib/cloudStorage.ts and the README for setup.
    if (isCloudinaryConfigured()) {
      const result = await uploadToCloudinary(buffer, folder, safeName);
      return NextResponse.json({ success: true, url: result.secure_url });
    }

    const uploadDir = storagePathFor("uploads", folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), buffer);

    const url = publicUrlFor("uploads", folder, safeName);
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    return apiError(error, "POST /api/upload");
  }
}
