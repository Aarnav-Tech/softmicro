import { NextResponse } from "next/server";

type StoreFile = {
  url: string;
  filename: string;
  type: string;
  arch: string;
};

function getArch(filename: string): string {
  const lower = filename.toLowerCase();

  if (lower.includes("_x64_")) return "x64";
  if (lower.includes("_arm64_")) return "arm64";
  if (lower.includes("_x86_")) return "x86";

  return "neutral";
}

export async function POST(req: Request) {
  const { productId } = await req.json();

  if (!productId || typeof productId !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid productId" },
      { status: 400 }
    );
  }

  // Build form body (this mimics how the Store itself calls the backend)
  const form = new URLSearchParams();
  form.append("type", "ProductId");
  form.append("url", productId);
  form.append("ring", "Retail");
  form.append("lang", "en-US");

  // Call the Store backend (via RG AdGuard endpoint)
  const response = await fetch(
    "https://store.rg-adguard.net/api/GetFiles",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString()
    }
  );

  const html = await response.text();

  // Match: <a href="URL">FILENAME</a>
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;

  const files: StoreFile[] = [];
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const rawName = match[2].trim();

    if (!url.startsWith("http")) continue;

    const filename = decodeURIComponent(rawName);

    const extMatch = filename.match(
      /\.(msixbundle|msix|appxbundle|appx|blockmap|eappx|emsix|xml)$/i
    );

    const type = extMatch ? extMatch[1].toLowerCase() : "other";

    files.push({
      url,
      filename,
      type,
      arch: getArch(filename)
    });
  }

  // Deduplicate by URL (some files appear multiple times)
  const uniqueFiles = Array.from(
    new Map(files.map(f => [f.url, f])).values()
  );

  return NextResponse.json({
    total: uniqueFiles.length,
    files: uniqueFiles
  });
}
