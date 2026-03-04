import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthError } from "@/lib/auth-server";
import { isAdmin } from "@/lib/admin-check";
import { getServiceSupabase } from "@/lib/supabase-server";
import { problemJson } from "@/lib/api-utils";
import { generateSlug, makeUniqueSlug } from "@/lib/slug-utils";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/boxes/:id/clone
 * Admin — deep-clone a box including all sections and products.
 * The cloned box is always created as a draft with a unique slug.
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

  const { id } = await params;

  // 1. Fetch the source box with sections and products
  const { data: source, error: fetchError } = await db
    .from("boxes")
    .select(
      "title, description, cover_image_url, box_sections(event_type, description, sort_order, products(name, brand, category, price, product_url, image_url, store, shade, instructions, sort_order))"
    )
    .eq("id", id)
    .order("sort_order", { referencedTable: "box_sections", ascending: true })
    .order("sort_order", {
      referencedTable: "box_sections.products",
      ascending: true,
    })
    .maybeSingle();

  if (fetchError) {
    console.error("[POST clone] DB error:", fetchError.message);
    return problemJson(500, "Internal Server Error", "Failed to fetch source box");
  }
  if (!source) {
    return problemJson(404, "Not Found", "Box not found");
  }

  // 2. Create the cloned box (always as draft)
  const clonedTitle = `${source.title} (Copy)`;
  const baseSlug = generateSlug(clonedTitle) || makeUniqueSlug("box");

  let newBox;
  const { data: boxData, error: boxError } = await db
    .from("boxes")
    .insert({
      title: clonedTitle,
      slug: baseSlug,
      description: source.description,
      cover_image_url: source.cover_image_url,
      is_published: false,
    })
    .select()
    .single();

  if (boxError) {
    // Handle slug collision
    if (boxError.code === "23505" && boxError.message?.includes("slug")) {
      const uniqueSlug = makeUniqueSlug(baseSlug);
      const { data: retryData, error: retryError } = await db
        .from("boxes")
        .insert({
          title: clonedTitle,
          slug: uniqueSlug,
          description: source.description,
          cover_image_url: source.cover_image_url,
          is_published: false,
        })
        .select()
        .single();

      if (retryError) {
        console.error("[POST clone] Retry DB error:", retryError.message);
        return problemJson(500, "Internal Server Error", "Failed to create cloned box");
      }
      newBox = retryData;
    } else {
      console.error("[POST clone] DB error:", boxError.message);
      return problemJson(500, "Internal Server Error", "Failed to create cloned box");
    }
  } else {
    newBox = boxData;
  }

  // 3. Clone sections and products
  const sections = (source as Record<string, unknown>).box_sections as Array<{
    event_type: string;
    description: string | null;
    sort_order: number;
    products: Array<Record<string, unknown>>;
  }> | null;

  if (sections && sections.length > 0) {
    for (const section of sections) {
      const { data: newSection, error: secError } = await db
        .from("box_sections")
        .insert({
          box_id: newBox.id,
          event_type: section.event_type,
          description: section.description,
          sort_order: section.sort_order,
        })
        .select("id")
        .single();

      if (secError) {
        console.error("[POST clone] Section error:", secError.message);
        continue;
      }

      if (section.products && section.products.length > 0) {
        const productRows = section.products.map((p) => ({
          section_id: newSection.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: p.price,
          product_url: p.product_url,
          image_url: p.image_url,
          store: p.store,
          shade: p.shade,
          instructions: p.instructions,
          sort_order: p.sort_order,
        }));

        const { error: prodError } = await db
          .from("products")
          .insert(productRows);

        if (prodError) {
          console.error("[POST clone] Products error:", prodError.message);
        }
      }
    }
  }

  return NextResponse.json(newBox, { status: 201 });
}
