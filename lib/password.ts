import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function verifyPassword(password: string, stored: string | undefined) {
  if (!stored) return false;
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64).toString("hex");
  return actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function passwordHashCommand() {
  const salt = randomBytes(16).toString("hex");
  return `node -e "const c=require('node:crypto');const s='${salt}';console.log(s+':'+c.scryptSync(process.argv[1],s,64).toString('hex'))" 'YOUR-PASSWORD'`;
}