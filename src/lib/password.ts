import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// Simple, dependency-free password hashing using Node's built-in scrypt KDF.
// Format stored in DB: "<saltHex>:<hashHex>"

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hashHex] = stored.split(":");
    if (!salt || !hashHex) return false;
    const hash = scryptSync(password, salt, 64);
    const storedHash = Buffer.from(hashHex, "hex");
    if (hash.length !== storedHash.length) return false;
    return timingSafeEqual(hash, storedHash);
  } catch {
    return false;
  }
}
