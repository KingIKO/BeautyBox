import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthError } from "@/lib/auth-server";
import { isAdmin } from "@/lib/admin-check";
import { getServiceSupabase } from "@/lib/supabase-server";
import { problemJson } from "@/lib/api-utils";

interface ReorderItem {
  id: string;
  sort_order: number;
}

/**
 * PUT /api/admin/reorder
 * Admin — batch reorder products by updating sort_order values.
 */
export async function PUT(request: NextRequest) {
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

  const { items } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return problemJson(
      400,
      "Bad Request",
      "items array is required and must be non-empty"
    );
  }

  // Validate each item has id (string) and sort_order (number)
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Record<string, unknown>;
    if (!item.id || typeof item.id !== "string") {
      return problemJson(
        400,
        "Bad Request",
        `items[${i}].id must be a non-empty string`
      );
    }
    if (typeof item.sort_order !== "number" || !Number.isFinite(item.sort_order)) {
      return problemJson(
        400,
        "Bad Request",
        `items[${i}].sort_order must be a finite number`
      );
    }
  }

  const validItems = items as ReorderItem[];

  let updated = 0;
  for (const item of validItems) {
    const { error } = await db
      .from("products")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id);

    if (error) {
      console.error(
        `[PUT /api/admin/reorder] Failed to update product ${item.id}:`,
        error.message
      );
      // Continue with remaining items rather than aborting entirely
      continue;
    }
    updated++;
  }

  return NextResponse.json({ success: true, updated });
}
