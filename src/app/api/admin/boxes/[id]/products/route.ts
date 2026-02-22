import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthError } from "@/lib/auth-server";
import { isAdmin } from "@/lib/admin-check";
import { getServiceSupabase } from "@/lib/supabase-server";
import { pick, problemJson, PRODUCT_CREATE_FIELDS } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/boxes/:id/products
 * Admin — add a product to a section within a box.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
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

  const { id: boxId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return problemJson(400, "Bad Request", "Invalid JSON body");
  }

  const cleaned = pick(body, PRODUCT_CREATE_FIELDS);

  if (!cleaned.name || typeof cleaned.name !== "string") {
    return problemJson(400, "Bad Request", "name is required");
  }

  if (!cleaned.section_id || typeof cleaned.section_id !== "string") {
    return problemJson(400, "Bad Request", "section_id is required");
  }

  // Validate that section_id belongs to this box
  const { data: section, error: sectionError } = await db
    .from("box_sections")
    .select("id")
    .eq("id", cleaned.section_id)
    .eq("box_id", boxId)
    .maybeSingle();

  if (sectionError) {
    console.error(
      "[POST /api/admin/boxes/:id/products] Section lookup error:",
      sectionError.message
    );
    return problemJson(
      500,
      "Internal Server Error",
      "Failed to validate section"
    );
  }

  if (!section) {
    return problemJson(
      404,
      "Not Found",
      "Section not found or does not belong to this box"
    );
  }

  const { data, error } = await db
    .from("products")
    .insert(cleaned)
    .select()
    .single();

  if (error) {
    console.error(
      "[POST /api/admin/boxes/:id/products] DB error:",
      error.message
    );
    return problemJson(
      500,
      "Internal Server Error",
      "Failed to create product"
    );
  }

  return NextResponse.json(data, { status: 201 });
}
