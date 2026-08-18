import { NextResponse } from "next/server";
import { resumeVersions } from "@/db/schema";
import { db } from "@/db";
import { desc } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSingletonProfile, updateSingletonProfile } from "@/lib/singleton";
import { storagePathFor, publicUrlFor } from "@/lib/storage";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

export async function GET() {
  try {
    const prof = await getSingletonProfile();
    const history = await db
      .select()
      .from(resumeVersions)
      .orderBy(desc(resumeVersions.uploadedAt))
      .limit(10);

    const resumeUrl = prof?.resumeUrl || "/resume/Harsh_Dev_Resume.pdf";

    return NextResponse.json({
      resumeUrl,
      updatedAt: prof?.updatedAt || new Date().toISOString(),
      name: prof?.name || "Harsh Dev",
      title: prof?.roleTitle || "Full Stack Developer",
      history,
    });
  } catch (error: any) {
    return apiError(error, "GET /api/resume");
  }
}

// Accepts either JSON { resumeUrl } (external / Cloudinary link)
// or multipart/form-data with a "file" field (admin PDF upload).
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const contentType = req.headers.get("content-type") || "";
    let resumeUrl = "";
    let label = "Resume";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      label = (formData.get("label") as string) || "Resume";

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = `resume_${Date.now()}.pdf`;
      // Served dynamically via /api/files/[...path] — see src/lib/storage.ts
      // for why runtime uploads can't rely on Next.js's static public/ serving.
      const uploadDir = storagePathFor("resume");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, safeName), buffer);
      resumeUrl = publicUrlFor("resume", safeName);
    } else {
      const body = await req.json();
      resumeUrl = body.resumeUrl;
      label = body.label || "Resume";
    }

    if (!resumeUrl) {
      return NextResponse.json({ error: "resumeUrl is required" }, { status: 400 });
    }

    // Deactivate old versions, insert new active version
    await db.update(resumeVersions).set({ isActive: false });
    await db.insert(resumeVersions).values({ url: resumeUrl, label, isActive: true });

    await updateSingletonProfile({ resumeUrl, updatedAt: new Date() });

    return NextResponse.json({ success: true, resumeUrl });
  } catch (error: any) {
    return apiError(error, "POST /api/resume");
  }
}
