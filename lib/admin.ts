import { cookies } from "next/headers";
import { verifySessionToken } from "./security";

export async function isAdminAuthenticated() {
  const store = await cookies();
  return verifySessionToken(store.get("lincscales_admin")?.value);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) throw new Error("UNAUTHORIZED");
}