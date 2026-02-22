import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthError } from "@/lib/auth-server";
import { isAdmin } from "@/lib/admin-check";
import { getServiceSupabase } from "@/lib/supabase-server";
import { pick, problemJson, PRODUCT_UPDATE_FIELDS } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PUT /api/admin/products/:id
 * Admin — update a product.
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

  const cleaned = pick(body, PRODUCT_UPDATE_FIELDS);

  if (Object.keys(cleaned).length === 0) {
    return problemJson(400, "Bad Request", "No valid fields to update");
  }

  const updatePayload = {
    ...cleaned,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from("products")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return problemJson(404, "Not Found", "Product not found");
    }
    console.error(
      "[PUT /api/admin/products/:id] DB error:",
      error.message
    );
    return problemJson(
      500,
      "Internal Server Error",
      "Failed to update product"
    );
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/admin/products/:id
 * Admin — delete a product.
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
    .from("products")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    console.error(
      "[DELETE /api/admin/products/:id] DB error:",
      error.message
    );
    return problemJson(
      500,
      "Internal Server Error",
      "Failed to delete product"
    );
  }

  if (count === 0) {
    return problemJson(404, "Not Found", "Product not found");
  }

  return new NextResponse(null, { status: 204 });
}
