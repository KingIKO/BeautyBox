import { AuthUser } from "./auth-server";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";

export function isAdmin(user: AuthUser): boolean {
  if (!ADMIN_USER_ID) return false;
  return user.id === ADMIN_USER_ID;
}
