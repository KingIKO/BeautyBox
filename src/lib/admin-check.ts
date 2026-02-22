import { AuthUser } from "./auth-server";

/** Strip everything except hex chars and hyphens (kills invisible chars). */
function sanitizeUUID(s: string): string {
  return s.replace(/[^a-f0-9-]/gi, "").toLowerCase();
}

export function isAdmin(user: AuthUser): boolean {
  // Read at call time (not module scope) to avoid cold-start race conditions
  const adminId = sanitizeUUID(process.env.ADMIN_USER_ID || "");
  if (!adminId) return false;
  return sanitizeUUID(user.id) === adminId;
}
