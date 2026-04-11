/**
 * /api/fetchApp
 *
 * CORS bypass architecture:
 *   Browser → GET /api/fetchApp?q=<input>
 *             → [validator] extract Product ID
 *             → [rate limiter] check per-IP quota
 *             → [cache] return cached result if fresh
 *             → [adguard client] POST to store.rg-adguard.net (server-side, no CORS)
 *             → [parser] normalize HTML → structured JSON
 *             → [cache] store result
 *             ← structured JSON to browser
 *
 * The browser never touches the AdGuard domain directly, so CORS never applies.
 * The server's outbound request carries spoofed browser headers to avoid 403s.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractProductId } from "@/lib/validator";
import { fetchAppFiles, UpstreamError } from "@/lib/adguard";
import { cache } from "@/lib/cache";
import { checkRateLimit } from "@/lib/rateLimit";
import type { ApiResponse, AppResult } from "@/lib/types";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const ip = getClientIp(req);

  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a moment.", code: "RATE_LIMITED" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const validation = extractProductId(q);

  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, error: validation.message, code: "INVALID_INPUT" },
      { status: 400 }
    );
  }

  const { productId } = validation;
  const cacheKey = `app:${productId}`;

  // Explicitly type the cache lookup so TypeScript knows the shape
  const cached = cache.get<AppResult>(cacheKey);
  if (cached) {
    return NextResponse.json(
      { ok: true, data: cached } satisfies ApiResponse,
      {
        status: 200,
        headers: {
          "X-Cache": "HIT",
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      }
    );
  }

  try {
    const result = await fetchAppFiles(productId);
    cache.set<AppResult>(cacheKey, result);

    return NextResponse.json(
      { ok: true, data: result } satisfies ApiResponse,
      {
        status: 200,
        headers: {
          "X-Cache": "MISS",
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      }
    );
  } catch (err) {
    if (err instanceof UpstreamError) {
      const is404 = err.status === 404;
      return NextResponse.json(
        {
          ok: false,
          error: err.message,
          code: is404 ? "NOT_FOUND" : "UPSTREAM_ERROR",
        } satisfies ApiResponse,
        { status: is404 ? 404 : 502 }
      );
    }

    console.error("[/api/fetchApp] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "An unexpected server error occurred.", code: "UPSTREAM_ERROR" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
