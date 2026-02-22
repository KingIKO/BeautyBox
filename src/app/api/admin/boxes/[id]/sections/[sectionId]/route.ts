import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthError } from "@/lib/auth-server";
import { isAdmin } from "@/lib/admin-check";
import { getServiceSupabase } from "@/lib/supabase-server";
import { pick, problemJson, SECTION_UPDATE_FIELDS } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string; sectionId: string }> };

/**
 * PUT /api/admin/boxes/:id/sections/:sectionId
 * Admin — update a section.
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

  const { id: boxId, sectionId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return problemJson(400, "Bad Request", "Invalid JSON body");
  }

  const cleaned = pick(body, SECTION_UPDATE_FIELDS);

  if (Object.keys(cleaned).length === 0) {
    return problemJson(400, "Bad Request", "No valid fields to update");
  }

  const { data, error } = await db
    .from("box_sections")
    .update(cleaned)
    .eq("id", sectionId)
    .eq("box_id", boxId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return problemJson(404, "Not Found", "Section not found");
    }
    console.error(
      "[PUT /api/admin/boxes/:id/sections/:sectionId] DB error:",
      error.message
    );
    return problemJson(
      500,
      "Internal Server Error",
      "Failed to update section"
    );
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/admin/boxes/:id/sections/:sectionId
 * Admin — delete a section (cascades products via FK).
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

  const { id: boxId, sectionId } = await params;

  const { error, count } = await db
    .from("box_sections")
    .delete({ count: "exact" })
    .eq("id", sectionId)
    .eq("box_id", boxId);

  if (error) {
    console.error(
      "[DELETE /api/admin/boxes/:id/sections/:sectionId] DB error:",
      error.message
    );
    return problemJson(
      500,
      "Internal Server Error",
      "Failed to delete section"
    );
  }

  if (count === 0) {
    return problemJson(404, "Not Found", "Section not found");
  }

  return new NextResponse(null, { status: 204 });
}
