import type { Metadata } from "next";
import { getServiceSupabase } from "@/lib/supabase-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let title = "BeautyBox";
  let description = "Beauty recommendations, curated for you";

  try {
    const db = getServiceSupabase();
    const { data } = await db
      .from("boxes")
      .select("title, description")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (data) {
      title = data.title;
      if (data.description) {
        description = data.description;
      }
    }
  } catch {
    // Fallback to defaults
  }

  const url = `https://beauty-box-two.vercel.app/b/${slug}`;

  return {
    title: `${title} | BeautyBox`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "BeautyBox",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function SharedBoxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
