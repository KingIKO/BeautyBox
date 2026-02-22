import * as cheerio from "cheerio";
import { PRODUCT_CATEGORIES } from "./constants";
import type { ScrapedProduct } from "@/types";

/* ------------------------------------------------------------------ */
/*  Domain → Store mapping                                            */
/* ------------------------------------------------------------------ */

const DOMAIN_STORE_MAP: [string, string][] = [
  ["sephora.com", "Sephora"],
  ["ulta.com", "Ulta"],
  ["amazon.com", "Amazon"],
  ["target.com", "Target"],
  ["walmart.com", "Walmart"],
  ["cvs.com", "CVS"],
  ["glossier.com", "Glossier"],
];

function detectStore(hostname: string): string {
  const h = hostname.toLowerCase();
  for (const [domain, store] of DOMAIN_STORE_MAP) {
    if (h === domain || h.endsWith(`.${domain}`)) return store;
  }
  return "Other";
}

/* ------------------------------------------------------------------ */
/*  Category keyword matching                                         */
/* ------------------------------------------------------------------ */

const CATEGORY_KEYWORDS: [string, string[]][] = [
  ["Primer", ["primer"]],
  ["Foundation", ["foundation"]],
  ["Concealer", ["concealer"]],
  ["Powder", ["powder", "setting powder", "pressed powder"]],
  ["Blush", ["blush"]],
  ["Bronzer", ["bronzer"]],
  ["Highlighter", ["highlighter", "highlight"]],
  ["Eyeshadow", ["eyeshadow", "eye shadow", "palette"]],
  ["Eyeliner", ["eyeliner", "eye liner", "kohl"]],
  ["Mascara", ["mascara"]],
  ["Brows", ["brow", "eyebrow"]],
  ["Lipstick", ["lipstick", "lip color", "lip colour"]],
  ["Lip Gloss", ["lip gloss", "gloss"]],
  ["Lip Liner", ["lip liner", "lipliner"]],
  ["Setting Spray", ["setting spray", "fixing spray"]],
  ["Moisturizer", ["moisturizer", "moisturiser", "cream", "lotion"]],
  ["Sunscreen", ["sunscreen", "spf", "sun protection"]],
  ["Skincare", ["serum", "cleanser", "toner", "exfoliant", "skincare", "skin care"]],
  ["Tools", ["brush", "sponge", "tool", "applicator"]],
  ["Fragrance", ["perfume", "fragrance", "eau de", "cologne"]],
];

function detectCategory(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Name cleanup — strip store suffixes                               */
/* ------------------------------------------------------------------ */

const STORE_SUFFIXES = [
  / \| Sephora$/i,
  / - Sephora$/i,
  / \| Ulta$/i,
  / - Ulta Beauty$/i,
  / \| Ulta Beauty$/i,
  / - Target$/i,
  / \| Target$/i,
  / : Amazon\.com.*$/i,
  / - Amazon\.com.*$/i,
  / \| Amazon\.com.*$/i,
  / - Walmart\.com$/i,
  / \| Walmart$/i,
  / \| CVS$/i,
  / - CVS Pharmacy$/i,
  / \| Glossier$/i,
];

function cleanName(raw: string): string {
  let name = raw.trim();
  for (const re of STORE_SUFFIXES) {
    name = name.replace(re, "");
  }
  return name.trim();
}

/* ------------------------------------------------------------------ */
/*  Price extraction                                                  */
/* ------------------------------------------------------------------ */

function extractPrice(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).replace(/[^0-9.]/g, "");
  if (!s || isNaN(Number(s))) return null;
  return s;
}

/* ------------------------------------------------------------------ */
/*  Image extraction                                                  */
/* ------------------------------------------------------------------ */

function extractImage(raw: unknown, origin: string): string | null {
  let url: string | null = null;
  if (typeof raw === "string") {
    url = raw;
  } else if (Array.isArray(raw) && raw.length > 0) {
    // Could be array of strings or array of {url: string}
    const first = raw[0];
    url = typeof first === "string" ? first : first?.url ?? first?.contentUrl ?? null;
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    url = (obj.url as string) ?? (obj.contentUrl as string) ?? null;
  }
  if (!url) return null;

  // Make absolute
  if (url.startsWith("//")) url = `https:${url}`;
  else if (url.startsWith("/")) url = `${origin}${url}`;

  return url;
}

/* ------------------------------------------------------------------ */
/*  JSON-LD extraction                                                */
/* ------------------------------------------------------------------ */

interface JsonLdProduct {
  name?: string;
  brand?: { name?: string } | string;
  offers?:
    | { price?: unknown; lowPrice?: unknown }
    | Array<{ price?: unknown; lowPrice?: unknown }>;
  image?: unknown;
  category?: string;
}

function findJsonLdProduct(
  $: cheerio.CheerioAPI
): JsonLdProduct | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const raw = JSON.parse($(scripts[i]).html() || "");

      // Direct product
      if (raw?.["@type"] === "Product") return raw;

      // Inside @graph array
      if (Array.isArray(raw?.["@graph"])) {
        const product = raw["@graph"].find(
          (item: Record<string, unknown>) => item?.["@type"] === "Product"
        );
        if (product) return product;
      }

      // Top-level array
      if (Array.isArray(raw)) {
        const product = raw.find(
          (item: Record<string, unknown>) => item?.["@type"] === "Product"
        );
        if (product) return product;
      }
    } catch {
      // Malformed JSON-LD — skip
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Main scraper                                                      */
/* ------------------------------------------------------------------ */

export async function scrapeProductUrl(url: string): Promise<ScrapedProduct> {
  const parsed = new URL(url); // throws if invalid
  const origin = parsed.origin;
  const store = detectStore(parsed.hostname);

  // Fetch with realistic headers + 10s timeout
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(10_000),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(
      `The site returned status ${res.status}. Try entering details manually.`
    );
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  let name: string | null = null;
  let brand: string | null = null;
  let price: string | null = null;
  let image_url: string | null = null;
  let category: string | null = null;

  // --- Priority 1: JSON-LD structured data ---
  const jsonLd = findJsonLdProduct($);
  if (jsonLd) {
    if (jsonLd.name) name = cleanName(jsonLd.name);

    if (typeof jsonLd.brand === "string") {
      brand = jsonLd.brand;
    } else if (jsonLd.brand?.name) {
      brand = jsonLd.brand.name;
    }

    // Price from offers
    const offers = Array.isArray(jsonLd.offers)
      ? jsonLd.offers[0]
      : jsonLd.offers;
    price = extractPrice(offers?.price ?? offers?.lowPrice);

    image_url = extractImage(jsonLd.image, origin);

    if (jsonLd.category) category = jsonLd.category;
  }

  // --- Priority 2: OpenGraph meta tags (fill gaps) ---
  if (!name) {
    const ogTitle = $('meta[property="og:title"]').attr("content");
    if (ogTitle) name = cleanName(ogTitle);
  }

  if (!image_url) {
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) image_url = extractImage(ogImage, origin);
  }

  if (!brand) {
    const productBrand =
      $('meta[property="product:brand"]').attr("content") ||
      $('meta[property="og:brand"]').attr("content");
    if (productBrand) brand = productBrand;
  }

  if (!price) {
    const productPrice =
      $('meta[property="product:price:amount"]').attr("content") ||
      $('meta[property="og:price:amount"]').attr("content");
    if (productPrice) price = extractPrice(productPrice);
  }

  // --- Priority 3: <title> tag (last resort for name) ---
  if (!name) {
    const titleTag = $("title").text();
    if (titleTag) name = cleanName(titleTag);
  }

  // --- Category detection from name + JSON-LD category ---
  if (!category || !PRODUCT_CATEGORIES.includes(category as typeof PRODUCT_CATEGORIES[number])) {
    const textForCategory = [name, category].filter(Boolean).join(" ");
    category = detectCategory(textForCategory);
  }

  return { name, brand, price, image_url, store, category };
}
