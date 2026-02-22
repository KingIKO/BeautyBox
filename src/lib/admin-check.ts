import { AuthUser } from "./auth-server";

const ADMIN_USER_ID = (process.env.ADMIN_USER_ID || "").trim();

export function isAdmin(user: AuthUser): boolean {
  console.log("[isAdmin] uid len:", user.id.length, "admin len:", ADMIN_USER_ID.length, "uid chars:", JSON.stringify(user.id), "admin chars:", JSON.stringify(ADMIN_USER_ID));
  if (!ADMIN_USER_ID) return false;
  return user.id === ADMIN_USER_ID;
}
