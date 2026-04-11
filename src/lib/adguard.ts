import type { AppFile, AppResult, Architecture, PackageType } from "./types";

const ADGUARD_API = "https://store.rg-adguard.net/api/GetFiles";

const SPOOF_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate",
  Referer: "https://store.rg-adguard.net/",
  Origin: "https://store.rg-adguard.net",
};

const ARCH_PATTERNS: [RegExp, Architecture][] = [
  [/_arm64[._]/i,  "arm64"],
  [/_arm[._]/i,    "arm"],
  [/_x64[._]/i,    "x64"],
  [/_x86[._]/i,    "x86"],
  [/_neutral[._]/i,"neutral"],
  [/\barm64\b/i,   "arm64"],
  [/\barm\b/i,     "arm"],
  [/\bx64\b/i,     "x64"],
  [/\bx86\b/i,     "x86"],
  [/\bneutral\b/i, "neutral"],
];

function detectArchitecture(name: string): Architecture {
  for (const [re, arch] of ARCH_PATTERNS) {
    if (re.test(name)) return arch;
  }
  return "unknown";
}

function detectType(name: string): PackageType {
  const lower = name.toLowerCase();
  if (lower.endsWith(".msixbundle"))  return "msixbundle";
  if (lower.endsWith(".appxbundle"))  return "appxbundle";
  if (lower.endsWith(".eappxbundle") || lower.endsWith(".emsixbundle")) return "msixbundle";
  if (lower.endsWith(".eappx"))       return "eappx";
  if (lower.endsWith(".emsix"))       return "emsix";
  if (lower.endsWith(".msix"))        return "msix";
  if (lower.endsWith(".appx"))        return "appx";
  return "unknown";
}

const VERSION_RE = /(\d+\.\d+[\d.]*)/;

function extractVersion(name: string): string {
  const match = VERSION_RE.exec(name);
  return match ? match[1] : "unknown";
}

const LINK_RE = /<a\s+[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
const SIZE_RE = /(\d+(?:\.\d+)?)\s*(KB|MB|GB|B)\b/i;

function parseSize(text: string): number {
  const m = SIZE_RE.exec(text);
  if (!m) return 0;
  const value = parseFloat(m[1]);
  switch (m[2].toUpperCase()) {
    case "GB": return Math.round(value * 1024 * 1024 * 1024);
    case "MB": return Math.round(value * 1024 * 1024);
    case "KB": return Math.round(value * 1024);
    default:   return Math.round(value);
  }
}

function markLatest(files: AppFile[]): void {
  // Use a plain object instead of Map.values() to avoid downlevelIteration requirement
  const byArch: Record<string, AppFile[]> = {};
  for (const f of files) {
    if (!byArch[f.architecture]) byArch[f.architecture] = [];
    byArch[f.architecture].push(f);
  }
  for (const arch of Object.keys(byArch)) {
    const sorted = byArch[arch].slice().sort((a, b) =>
      b.version.localeCompare(a.version, undefined, { numeric: true })
    );
    if (sorted[0]) sorted[0].isLatest = true;
  }
}

function parseHtmlResponse(html: string, productId: string): AppResult {
  const files: AppFile[] = [];

  let match: RegExpExecArray | null;
  while ((match = LINK_RE.exec(html)) !== null) {
    const [, href, name] = match;
    const fileName = name.trim();

    const type = detectType(fileName);
    if (type === "unknown") continue;

    const sliceAfterLink = html.slice(match.index, match.index + 500);
    const sizeMatch = SIZE_RE.exec(sliceAfterLink);
    const fileSize = sizeMatch ? parseSize(sizeMatch[0]) : 0;

    files.push({
      fileName,
      version: extractVersion(fileName),
      architecture: detectArchitecture(fileName),
      fileSize,
      type,
      downloadUrl: href,
      isLatest: false,
    });
  }

  markLatest(files);
  return { productId, files, fetchedAt: Date.now() };
}

export class UpstreamError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "UpstreamError";
  }
}

export async function fetchAppFiles(productId: string): Promise<AppResult> {
  const body = new URLSearchParams({
    type: "ProductId",
    url: productId,
    ring: "Retail",
    lang: "en-US",
  });

  let res: Response;
  try {
    res = await fetch(ADGUARD_API, {
      method: "POST",
      headers: {
        ...SPOOF_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new UpstreamError(`Network error reaching AdGuard API: ${(err as Error).message}`);
  }

  if (!res.ok) {
    throw new UpstreamError(`AdGuard API returned HTTP ${res.status}`, res.status);
  }

  const html = await res.text();

  if (process.env.API_VERBOSE === "true") {
    const sampleLinks = Array.from(html.matchAll(/<a\s+[^>]*href="[^"]*"[^>]*>([^<]+)<\/a>/gi))
      .slice(0, 5)
      .map((m) => m[1].trim());
    console.log("[adguard] Sample filenames:", sampleLinks);
  }

  if (html.includes("The entered URL is not correct")) {
    throw new UpstreamError("Product not found or not available in the Store.", 404);
  }

  const result = parseHtmlResponse(html, productId);

  if (result.files.length === 0) {
    throw new UpstreamError("No downloadable packages found for this product.", 404);
  }

  return result;
}