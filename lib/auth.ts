import crypto from "crypto";

const SECRET = process.env.ADMIN_SECRET || "ffzstore-admin-secret-key-2026";
const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";

export function verifyAdminCredentials(user: string, pass: string): boolean {
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

export function createAdminToken(user: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 hari
  const payload = `${user}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${signature}`;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return false;

    const payload = Buffer.from(encodedPayload, "base64").toString("utf-8");
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (signature !== expectedSignature) return false;

    const [user, expiresAtStr] = payload.split(":");
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) return false;

    return user === ADMIN_USER;
  } catch {
    return false;
  }
}
