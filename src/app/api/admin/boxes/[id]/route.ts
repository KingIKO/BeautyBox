import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthError } from "@/lib/auth-server";
import { isAdmin } from "@/lib/admin-check";
import { getServiceSupabase } from "@/lib/supabase-server";
import { pick, problemJson, BOX_UPDATE_FIELDS } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/boxes/:id
 * Admin — get single box with sections + products (for admin editor).
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
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

  const { id } = await params;

  const { data, error } = await db
    .from("boxes")
    .select(
      "id, title, slug, description, cover_image_url, is_published, created_at, updated_at, box_sections(id, box_id, event_type, description, sort_order, created_at, products(*))"
    )
    .eq("id", id)
    .order("sort_order", { referencedTable: "box_sections", ascending: true })
    .order("sort_order", {
      referencedTable: "box_sections.products",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    console.error("[GET /api/admin/boxes/:id] DB error:", error.message);
    return problemJson(500, "Internal Server Error", "Failed to fetch box");
  }

  if (!data) {
    return problemJson(404, "Not Found", "Box not found");
  }

  // Rename box_sections -> sections
  const { box_sections, ...rest } = data as typeof data & {
    box_sections: unknown[];
  };
  const box = { ...rest, sections: box_sections ?? [] };

  return NextResponse.json(box);
}

/**
 * PUT /api/admin/boxes/:id
 * Admin — update box metadata.
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
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

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return problemJson(400, "Bad Request", "Invalid JSON body");
  }

  const cleaned = pick(body, BOX_UPDATE_FIELDS);

  if (Object.keys(cleaned).length === 0) {
    return problemJson(400, "Bad Request", "No valid fields to update");
  }

  // If slug is being changed, check uniqueness
  if (cleaned.slug && typeof cleaned.slug === "string") {
    const { data: existing } = await db
      .from("boxes")
      .select("id")
      .eq("slug", cleaned.slug)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return problemJson(
        409,
        "Conflict",
        "A box with this slug already exists"
      );
    }
  }

  const updatePayload = {
    ...cleaned,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from("boxes")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return problemJson(404, "Not Found", "Box not found");
    }
    console.error("[PUT /api/admin/boxes/:id] DB error:", error.message);
    return problemJson(500, "Internal Server Error", "Failed to update box");
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/admin/boxes/:id
 * Admin — delete box (cascades to sections + products via FK).
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
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

  const { id } = await params;

  const { error, count } = await db
    .from("boxes")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    console.error("[DELETE /api/admin/boxes/:id] DB error:", error.message);
    return problemJson(500, "Internal Server Error", "Failed to delete box");
  }

  if (count === 0) {
    return problemJson(404, "Not Found", "Box not found");
  }

  return new NextResponse(null, { status: 204 });
}
