import { NextResponse } from "next/server";

const PRODUCT_ID_REGEX = /^[A-Z0-9]{12}$/i;

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Missing input" },
      { status: 400 }
    );
  }

  const input = url.trim();

  // 1️⃣ Plain Product ID
  if (PRODUCT_ID_REGEX.test(input)) {
    return NextResponse.json({
      productId: input.toUpperCase()
    });
  }

  let productId: string | null = null;

  try {
    const parsed = new URL(input);

    // 2️⃣ apps.microsoft.com
    if (parsed.hostname.includes("apps.microsoft.com")) {
      const parts = parsed.pathname.split("/");
      const last = parts[parts.length - 1];

      if (PRODUCT_ID_REGEX.test(last)) {
        productId = last.toUpperCase();
      }
    }

    // 3️⃣ microsoft.com/store
    if (
      parsed.hostname.includes("microsoft.com") &&
      parsed.pathname.includes("/productId/")
    ) {
      const match = parsed.pathname.match(/productId\/([A-Z0-9]{12})/i);
      if (match) {
        productId = match[1].toUpperCase();
      }
    }
  } catch {
    // Invalid URL, fall through
  }

  if (!productId) {
    return NextResponse.json(
      { error: "Unsupported Microsoft Store link or ID" },
      { status: 400 }
    );
  }

  return NextResponse.json({ productId });
}
