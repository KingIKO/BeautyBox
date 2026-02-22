import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, AuthError } from "@/lib/auth-server";
import { isAdmin } from "@/lib/admin-check";
import { problemJson } from "@/lib/api-utils";
import { scrapeProductUrl } from "@/lib/scrape-product";

/**
 * POST /api/admin/scrape-url
 * Admin — extract product metadata from a URL.
 * Body: { url: string }
 */
export async function POST(request: NextRequest) {
  // Auth guard
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

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return problemJson(400, "Bad Request", "Invalid JSON body");
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return problemJson(400, "Bad Request", "URL is required");
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return problemJson(400, "Bad Request", "Invalid URL format");
  }

  // Scrape
  try {
    const data = await scrapeProductUrl(url);
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not fetch the URL.";

    // Detect timeout
    if (message.includes("abort") || message.includes("timeout")) {
      return problemJson(
        422,
        "Unprocessable Entity",
        "The site took too long to respond. Try again or enter details manually."
      );
    }

    return problemJson(
      422,
      "Unprocessable Entity",
      message.length > 200
        ? "Could not extract product details. Enter details manually."
        : message
    );
  }
}
