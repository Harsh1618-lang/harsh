import { createHash } from "crypto";

// ─────────────────────────────────────────────────────────────────────────
// Optional Cloudinary-backed uploads.
//
// Why this exists: local-disk storage (src/lib/storage.ts) works fine on a
// normal VM/server, but its files are wiped on every deploy/restart on
// ephemeral or serverless hosts (Vercel, most PaaS). Cloudinary gives free
// persistent object storage with zero extra npm dependency — we just call
// their REST upload API directly with a signed request.
//
// If CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET are
// all set, uploads go to Cloudinary and the returned secure_url is stored
// directly (no need for our own /api/files proxy route for these). If they
// aren't set, src/app/api/upload/route.ts falls back to local disk exactly
// as before — nothing breaks for anyone who hasn't configured this.
// ─────────────────────────────────────────────────────────────────────────

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured on this server.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = filename.replace(/\.[^/.]+$/, ""); // strip extension, Cloudinary manages that

  // Cloudinary signed-upload requirement: sign every param EXCEPT file,
  // cloud_name, resource_type and api_key — sorted alphabetically as
  // key=value pairs joined with '&', with the api_secret appended, then
  // SHA-1 hashed. See https://cloudinary.com/documentation/authentication_signatures
  const paramsToSign: Record<string, string> = {
    folder: `harshdev/${folder}`,
    public_id: publicId,
    timestamp: String(timestamp),
  };
  const signatureBase =
    Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&") + apiSecret;
  const signature = createHash("sha1").update(signatureBase).digest("hex");

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(buffer)]));
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", paramsToSign.folder);
  formData.append("public_id", publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[cloudinary] upload failed:", res.status, detail);
    throw new Error("Cloud upload failed.");
  }

  return res.json();
}
