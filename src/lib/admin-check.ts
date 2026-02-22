import { AuthUser } from "./auth-server";

/** Strip everything except hex chars and hyphens (kills invisible chars). */
function sanitizeUUID(s: string): string {
  return s.replace(/[^a-f0-9-]/gi, "").toLowerCase();
}

export function isAdmin(user: AuthUser): boolean {
  const rawEnv = process.env.ADMIN_USER_ID || "";
  const adminId = sanitizeUUID(rawEnv);
  const uid = sanitizeUUID(user.id);
  const match = uid === adminId;
  console.log("[isAdmin] rawEnv:", JSON.stringify(rawEnv), "rawEnvLen:", rawEnv.length, "adminId:", adminId, "uid:", uid, "match:", match);
  if (!adminId) return false;
  return match;
}
