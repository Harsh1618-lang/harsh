import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { STORAGE_DIR, mimeTypeForExt } from "@/lib/storage";
import { apiError } from "@/lib/apiError";

// Serves admin-uploaded files (custom backgrounds, avatars, resume PDFs)
// directly from disk on every request. See src/lib/storage.ts for why this
// dynamic route exists instead of relying on Next.js's static `public/`
// folder serving for files written at runtime.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Prevent path traversal — resolve and ensure the final path stays
    // inside STORAGE_DIR before ever touching the filesystem.
    const requestedPath = path.join(STORAGE_DIR, ...segments);
    const resolved = path.resolve(requestedPath);
    if (!resolved.startsWith(path.resolve(STORAGE_DIR))) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const fileStat = await stat(resolved).catch(() => null);
    if (!fileStat || !fileStat.isFile()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const buffer = await readFile(resolved);
    const ext = path.extname(resolved);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeTypeForExt(ext),
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    return apiError(error, "GET /api/files/[...path]");
  }
}
