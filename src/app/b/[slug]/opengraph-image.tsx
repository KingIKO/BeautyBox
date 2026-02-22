import { ImageResponse } from "next/og";
import { getServiceSupabase } from "@/lib/supabase-server";

export const runtime = "edge";
export const alt = "BeautyBox";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch box data for dynamic title
  let title = "BeautyBox";
  let description = "Beauty recommendations, curated for you";
  let productCount = 0;

  try {
    const db = getServiceSupabase();
    const { data } = await db
      .from("boxes")
      .select("title, description, box_sections(products(id))")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (data) {
      title = data.title;
      if (data.description) description = data.description;
      // Count products across all sections
      const sections = (data as Record<string, unknown>).box_sections as
        | { products: { id: string }[] }[]
        | null;
      if (sections) {
        productCount = sections.reduce(
          (sum, s) => sum + (s.products?.length || 0),
          0
        );
      }
    }
  } catch {
    // Fallback to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #b5365a 0%, #d4637e 50%, #f0b4c4 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Sparkle icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "rgba(255,255,255,0.2)",
            marginBottom: 24,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            maxWidth: 700,
            marginBottom: 24,
          }}
        >
          {description}
        </div>

        {/* Product count badge */}
        {productCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "8px 20px",
              fontSize: 18,
              color: "white",
            }}
          >
            {productCount} product{productCount !== 1 ? "s" : ""} curated for you
          </div>
        )}

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 18,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          ✨ BeautyBox
        </div>
      </div>
    ),
    { ...size }
  );
}
