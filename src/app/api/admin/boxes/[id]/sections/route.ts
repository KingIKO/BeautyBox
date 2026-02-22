import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthError } from "@/lib/auth-server";
import { isAdmin } from "@/lib/admin-check";
import { getServiceSupabase } from "@/lib/supabase-server";
import { pick, problemJson, SECTION_CREATE_FIELDS } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/boxes/:id/sections
 * Admin — add a section to a box.
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

  // Validate box exists
  const { data: box, error: boxError } = await db
    .from("boxes")
    .select("id")
    .eq("id", boxId)
    .maybeSingle();

  if (boxError) {
    console.error(
      "[POST /api/admin/boxes/:id/sections] Box lookup error:",
      boxError.message
    );
    return problemJson(500, "Internal Server Error", "Failed to validate box");
  }

  if (!box) {
    return problemJson(404, "Not Found", "Box not found");
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return problemJson(400, "Bad Request", "Invalid JSON body");
  }

  const cleaned = pick(body, SECTION_CREATE_FIELDS);

  if (!cleaned.event_type || typeof cleaned.event_type !== "string") {
    return problemJson(400, "Bad Request", "event_type is required");
  }

  const validEventTypes = ["day", "night", "party", "everyday"];
  if (!validEventTypes.includes(cleaned.event_type as string)) {
    return problemJson(
      400,
      "Bad Request",
      `event_type must be one of: ${validEventTypes.join(", ")}`
    );
  }

  const insertPayload = { ...cleaned, box_id: boxId };

  const { data, error } = await db
    .from("box_sections")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation (event_type already exists for this box)
    if (error.code === "23505") {
      return problemJson(
        409,
        "Conflict",
        `A "${cleaned.event_type}" section already exists for this box`
      );
    }
    console.error(
      "[POST /api/admin/boxes/:id/sections] DB error:",
      error.message
    );
    return problemJson(
      500,
      "Internal Server Error",
      "Failed to create section"
    );
  }

  return NextResponse.json(data, { status: 201 });
}
