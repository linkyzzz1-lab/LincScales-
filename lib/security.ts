import { createHmac, timingSafeEqual } from "node:crypto";

const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(key: string, limit = 12) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.expiresAt <= now) { attempts.set(key, { count: 1, expiresAt: now + WINDOW_MS }); return true; }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function createSessionToken(email: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  const payload = `${email}.${Date.now() + 8 * 60 * 60 * 1000}`;
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

export function verifySessionToken(token: string | undefined) {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret || !token) return false;
    const parts = token.split(".");
    if (parts.length !== 3 || Number(parts[1]) < Date.now()) return false;
    const expected = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest("hex");
    return timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected));
  } catch { return false; }
}

export function getClientKey(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"; }