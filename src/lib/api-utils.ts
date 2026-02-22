import { NextResponse } from "next/server";

/** Whitelist allowed fields from a request body */
export function pick<T extends Record<string, unknown>>(
  obj: T,
  allowedKeys: string[]
): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    if (key in obj && obj[key] !== undefined && obj[key] !== null) {
      result[key] = obj[key];
    }
  }
  return result as Partial<T>;
}

/** RFC 9457 Problem Details error response */
export function problemJson(status: number, title: string, detail: string) {
  return NextResponse.json(
    { type: "about:blank", title, status, detail },
    { status, headers: { "Content-Type": "application/problem+json" } }
  );
}

// Field whitelists
export const BOX_CREATE_FIELDS = [
  "title",
  "description",
  "cover_image_url",
  "is_published",
];
export const BOX_UPDATE_FIELDS = [
  "title",
  "slug",
  "description",
  "cover_image_url",
  "is_published",
];
export const SECTION_CREATE_FIELDS = ["event_type", "description", "sort_order"];
export const SECTION_UPDATE_FIELDS = ["description", "sort_order"];
export const PRODUCT_CREATE_FIELDS = [
  "section_id",
  "name",
  "brand",
  "category",
  "price",
  "product_url",
  "image_url",
  "store",
  "shade",
  "instructions",
  "sort_order",
];
export const PRODUCT_UPDATE_FIELDS = [
  "name",
  "brand",
  "category",
  "price",
  "product_url",
  "image_url",
  "store",
  "shade",
  "instructions",
  "sort_order",
];
