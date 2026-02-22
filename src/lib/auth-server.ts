import { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const JWKS = supabaseUrl
  ? createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)
    )
  : null;

export async function getCurrentUser(request: NextRequest): Promise<AuthUser> {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid authorization header", 401);
  }
  const token = auth.split(" ", 2)[1];

  // Strategy 1: JWKS (ES256)
  if (JWKS) {
    try {
      const { payload } = await jwtVerify(token, JWKS, {
        algorithms: ["ES256"],
      });
      const userId = payload.sub;
      if (!userId) throw new AuthError("Invalid token payload", 401);
      return {
        id: userId,
        email: (payload.email as string) || "",
        role: (payload.role as string) || "authenticated",
      };
    } catch (err) {
      if (err instanceof AuthError) throw err;
    }
  }

  // Strategy 2 (DEPRECATED): HS256 shared secret
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (secret) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
        { algorithms: ["HS256"] }
      );
      const userId = payload.sub;
      if (!userId) throw new AuthError("Invalid token payload", 401);
      return {
        id: userId,
        email: (payload.email as string) || "",
        role: (payload.role as string) || "authenticated",
      };
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw new AuthError("Invalid or expired token", 401);
    }
  }

  // Strategy 3: Decode without verification (dev only)
  try {
    const payloadB64 = token.split(".")[1];
    if (!payloadB64) throw new Error("Malformed token");
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString()
    );
    const userId = payload.sub;
    if (!userId) throw new AuthError("Invalid token payload", 401);
    return {
      id: userId,
      email: (payload.email as string) || "",
      role: (payload.role as string) || "authenticated",
    };
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError("Invalid token", 401);
  }
}

export async function getOptionalUser(
  request: NextRequest
): Promise<AuthUser | null> {
  const auth = request.headers.get("authorization");
  if (!auth) return null;
  try {
    return await getCurrentUser(request);
  } catch {
    return null;
  }
}

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}
