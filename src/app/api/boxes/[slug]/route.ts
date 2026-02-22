import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";
import { problemJson } from "@/lib/api-utils";

/**
 * GET /api/boxes/:slug
 * Public — fetch a published box by slug with all sections and products.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug || typeof slug !== "string") {
    return problemJson(400, "Bad Request", "Missing or invalid slug");
  }

  const db = getServiceSupabase();

  const { data, error } = await db
    .from("boxes")
    .select(
      "id, title, slug, description, cover_image_url, is_published, created_at, updated_at, box_sections(id, box_id, event_type, description, sort_order, created_at, products(*))"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .order("sort_order", { referencedTable: "box_sections", ascending: true })
    .order("sort_order", {
      referencedTable: "box_sections.products",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    console.error("[GET /api/boxes/:slug] DB error:", error.message);
    return problemJson(500, "Internal Server Error", "Failed to fetch box");
  }

  if (!data) {
    return problemJson(404, "Not Found", "Box not found");
  }

  // Rename box_sections -> sections for cleaner API response
  const { box_sections, ...rest } = data as typeof data & {
    box_sections: unknown[];
  };
  const box = { ...rest, sections: box_sections ?? [] };

  return NextResponse.json(box);
}
