import { PRODUCT_CATEGORIES } from "./constants";

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";
const LLM_TIMEOUT_MS = 8_000;
const MAX_TEXT_CHARS = 4_000;

/** Check whether a DeepSeek API key is configured. */
export function isLlmConfigured(): boolean {
  return !!process.env.DEEPSEEK_API_KEY;
}

/* ------------------------------------------------------------------ */
/*  HTML → plain text cleaning                                         */
/* ------------------------------------------------------------------ */

/**
 * Strip HTML down to readable text suitable for LLM input.
 * Removes scripts, styles, nav, footer, and all tags.
 * Truncates to ~4000 chars (~1000 tokens).
 */
export function cleanHtmlForProduct(html: string): string {
  let text = html;

  // Remove script, style, noscript, svg, iframe blocks
  text = text.replace(/<(script|style|noscript|svg|iframe)[^>]*>[\s\S]*?<\/\1>/gi, " ");

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Remove nav, footer, header blocks (boilerplate noise)
  text = text.replace(/<(nav|footer|header)[^>]*>[\s\S]*?<\/\1>/gi, " ");

  // Replace block-level tags with newlines for readability
  text = text.replace(/<\/(div|p|h[1-6]|li|tr|td|th|section|article|main)>/gi, "\n");

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ");

  // Collapse whitespace
  text = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  // Truncate to limit token usage
  if (text.length > MAX_TEXT_CHARS) {
    text = text.slice(0, MAX_TEXT_CHARS);
  }

  return text;
}

/* ------------------------------------------------------------------ */
/*  DeepSeek API call                                                  */
/* ------------------------------------------------------------------ */

export interface LlmProductResult {
  name: string | null;
  brand: string | null;
  price: string | null;
  category: string | null;
}

const CATEGORIES_LIST = PRODUCT_CATEGORIES.join(", ");

function buildSystemPrompt(store: string, url: string): string {
  return `You are a beauty product data extractor. You will receive text scraped from a product page on ${store} (${url}).

Extract the following fields from the text. ONLY extract what is clearly stated — do NOT invent or guess data.

RULES:
1. "name": The product's actual name (NOT the store name, NOT a generic page title). Include the full product name as a customer would recognize it.
2. "brand": The company/brand that makes the product (e.g., "Maybelline", "Giorgio Armani", "NARS").
3. "price": The current/sale price in USD as a plain number string without $ sign (e.g., "29.99"). If multiple prices, use the current/lowest price.
4. "category": Categorize into EXACTLY ONE of: ${CATEGORIES_LIST}
5. Set any field to null if you cannot determine it from the text.

Respond with ONLY a JSON object:
{"name": "...", "brand": "...", "price": "...", "category": "..."}`;
}

/**
 * Call DeepSeek to extract product details from cleaned page text.
 * Returns null on any failure (timeout, bad response, API error).
 */
export async function extractProductWithLLM(
  cleanedText: string,
  store: string,
  url: string
): Promise<LlmProductResult | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  // If page text is very short (anti-bot page), supplement with the URL itself
  // which often contains the product name in the slug
  let textForLLM = cleanedText;
  if (cleanedText.length < 100) {
    textForLLM = `URL: ${url}\n\n${cleanedText}`;
  }

  // Skip only if truly empty
  if (textForLLM.trim().length < 10) return null;

  try {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(store, url) },
          { role: "user", content: textForLLM },
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.warn(`DeepSeek API returned ${res.status}: ${await res.text().catch(() => "")}`);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.warn("DeepSeek returned empty content");
      return null;
    }

    const parsed = JSON.parse(content);

    // Validate and sanitize the response
    const result: LlmProductResult = {
      name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : null,
      brand: typeof parsed.brand === "string" && parsed.brand.trim() ? parsed.brand.trim() : null,
      price: null,
      category: null,
    };

    // Validate price — must be a valid number string
    if (parsed.price != null) {
      const priceStr = String(parsed.price).replace(/[^0-9.]/g, "");
      if (priceStr && !isNaN(Number(priceStr))) {
        result.price = priceStr;
      }
    }

    // Validate category — must be in our allowed list
    if (
      typeof parsed.category === "string" &&
      PRODUCT_CATEGORIES.includes(parsed.category as typeof PRODUCT_CATEGORIES[number])
    ) {
      result.category = parsed.category;
    }

    return result;
  } catch (err) {
    // Timeout, network error, JSON parse error — all non-fatal
    console.warn(
      "DeepSeek extraction failed:",
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}
