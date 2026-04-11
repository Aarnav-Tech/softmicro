/**
 * Validates and extracts a Microsoft Store Product ID from either:
 *   - A raw product ID  (9WZDNCRFHVJL)
 *   - A store URL      (https://apps.microsoft.com/detail/9WZDNCRFHVJL/...)
 *
 * Product IDs are 12-character alphanumeric strings starting with "9".
 */

const PRODUCT_ID_RE = /^9[A-Z0-9]{11}$/i;

// All valid Microsoft Store URL hostnames
const ALLOWED_HOSTNAMES = new Set([
  "apps.microsoft.com",
  "www.microsoft.com",
  "microsoft.com",
]);

export interface ValidationResult {
  ok: true;
  productId: string;
}

export interface ValidationError {
  ok: false;
  message: string;
}

export type ValidationOutcome = ValidationResult | ValidationError;

/**
 * Given a raw user-supplied string, return a normalized Product ID or an error.
 */
export function extractProductId(raw: string): ValidationOutcome {
  const input = raw.trim();

  if (!input) {
    return { ok: false, message: "Please enter a Product ID or Store URL." };
  }

  // 1. Direct product ID
  if (PRODUCT_ID_RE.test(input)) {
    return { ok: true, productId: input.toUpperCase() };
  }

  // 2. URL — parse safely
  let url: URL;
  try {
    // Prepend scheme if missing so URL() can parse it
    const withScheme = input.startsWith("http") ? input : `https://${input}`;
    url = new URL(withScheme);
  } catch {
    return {
      ok: false,
      message: "Invalid input: not a product ID or a valid URL.",
    };
  }

  // Validate the hostname is a real Microsoft Store domain
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!ALLOWED_HOSTNAMES.has(hostname) && !ALLOWED_HOSTNAMES.has(`www.${hostname}`)) {
    return {
      ok: false,
      message: "URL must be from apps.microsoft.com or microsoft.com.",
    };
  }

  // Extract product ID from path segments
  const segments = url.pathname.split("/").filter(Boolean);
  for (const seg of segments) {
    if (PRODUCT_ID_RE.test(seg)) {
      return { ok: true, productId: seg.toUpperCase() };
    }
  }

  return {
    ok: false,
    message:
      "Could not find a Product ID in the URL. Make sure it's a direct app link.",
  };
}
