import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthError } from "@/lib/auth-server";
import { isAdmin } from "@/lib/admin-check";
import { getServiceSupabase } from "@/lib/supabase-server";
import { pick, problemJson, BOX_CREATE_FIELDS } from "@/lib/api-utils";
import { generateSlug, makeUniqueSlug } from "@/lib/slug-utils";

/**
 * GET /api/admin/boxes
 * Admin — list all boxes (published + drafts), ordered by updated_at desc.
 */
export async function GET(request: NextRequest) {
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

  const { data, error } = await db
    .from("boxes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[GET /api/admin/boxes] DB error:", error.message);
    return problemJson(500, "Internal Server Error", "Failed to list boxes");
  }

  return NextResponse.json(data);
}

/**
 * POST /api/admin/boxes
 * Admin — create a new box.
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return problemJson(400, "Bad Request", "Invalid JSON body");
  }

  const cleaned = pick(body, BOX_CREATE_FIELDS);

  if (!cleaned.title || typeof cleaned.title !== "string") {
    return problemJson(400, "Bad Request", "title is required");
  }

  const slug = generateSlug(cleaned.title as string);
  if (!slug) {
    return problemJson(
      400,
      "Bad Request",
      "Title must contain at least one alphanumeric character"
    );
  }

  const insertPayload = { ...cleaned, slug };

  // First attempt with generated slug
  const { data, error } = await db
    .from("boxes")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation on slug
    if (error.code === "23505" && error.message?.includes("slug")) {
      const uniqueSlug = makeUniqueSlug(slug);
      const { data: retryData, error: retryError } = await db
        .from("boxes")
        .insert({ ...cleaned, slug: uniqueSlug })
        .select()
        .single();

      if (retryError) {
        console.error(
          "[POST /api/admin/boxes] Retry DB error:",
          retryError.message
        );
        return problemJson(
          500,
          "Internal Server Error",
          "Failed to create box"
        );
      }

      return NextResponse.json(retryData, { status: 201 });
    }

    console.error("[POST /api/admin/boxes] DB error:", error.message);
    return problemJson(500, "Internal Server Error", "Failed to create box");
  }

  return NextResponse.json(data, { status: 201 });
}
