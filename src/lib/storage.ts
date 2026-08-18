import path from "path";

// User-uploaded files (custom background, avatar photos, resume PDFs) are
// stored OUTSIDE the `public/` directory and served through a dedicated
// dynamic API route (`/api/files/[...path]`) instead of relying on Next.js's
// static `public/` file serving.
//
// Why: Next.js's production server (`next start`) was returning 404 (with
// `x-nextjs-prerender`/`x-nextjs-cache` response headers, meaning the request
// fell through to the app's catch-all/not-found route) for files written to
// `public/` AFTER the server process had already started — i.e. exactly the
// runtime-upload scenario used by the Admin Panel. Reading the file fresh
// from disk inside a normal Route Handler on every request sidesteps that
// entirely, since Route Handlers always execute live and are never affected
// by any public-asset manifest/caching computed at server startup.
export const STORAGE_DIR = path.join(process.cwd(), "storage");

export function storagePathFor(...segments: string[]): string {
  return path.join(STORAGE_DIR, ...segments);
}

export function publicUrlFor(...segments: string[]): string {
  return `/api/files/${segments.map(encodeURIComponent).join("/")}`;
}

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export function mimeTypeForExt(ext: string): string {
  return MIME_TYPES[ext.toLowerCase()] || "application/octet-stream";
}
