import { AuthUser } from "./auth-server";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";

export function isAdmin(user: AuthUser): boolean {
  console.log("[isAdmin] user.id:", user.id, "ADMIN_USER_ID:", ADMIN_USER_ID, "match:", user.id === ADMIN_USER_ID);
  if (!ADMIN_USER_ID) return false;
  return user.id === ADMIN_USER_ID;
}
