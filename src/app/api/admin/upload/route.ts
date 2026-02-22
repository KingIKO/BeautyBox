import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthError } from "@/lib/auth-server";
import { isAdmin } from "@/lib/admin-check";
import { getServiceSupabase } from "@/lib/supabase-server";
import { problemJson } from "@/lib/api-utils";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKET = "beauty-box-images";

const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * POST /api/admin/upload
 * Admin — upload a product image to Supabase Storage.
 */
export async function POST(request: NextRequest) {
  const db = getServiceSupabase();
  let user;
  try {
    user = await getCurrentUser(request);
  } catch (err) {
    if (err instanceof AuthError)
      return problemJson(err.statusCode, "Unauthorized", err.message);
    return problemJson(401, "Unauthorized", "Auth error");
  }
  if (!isAdmin(user)) {
    return problemJson(403, "Forbidden", "Admin access required");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return problemJson(400, "Bad Request", "Invalid form data");
  }

  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return problemJson(400, "Bad Request", "Missing 'image' file field");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return problemJson(
      400,
      "Bad Request",
      `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return problemJson(
      400,
      "Bad Request",
      `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 5MB`
    );
  }

  const ext = EXTENSION_MAP[file.type] || "jpg";
  const storagePath = `products/${crypto.randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[POST /api/admin/upload] Upload error:", uploadError.message);
    return problemJson(
      500,
      "Internal Server Error",
      "Failed to upload image"
    );
  }

  const {
    data: { publicUrl },
  } = db.storage.from(BUCKET).getPublicUrl(storagePath);

  return NextResponse.json({ url: publicUrl }, { status: 201 });
}
