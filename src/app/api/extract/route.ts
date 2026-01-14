import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json(
      { error: "Missing URL" },
      { status: 400 }
    );
  }

  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const candidate = parts[parts.length - 1];

    if (!/^[A-Z0-9]{12}$/.test(candidate)) {
      throw new Error();
    }

    return NextResponse.json({ productId: candidate });
  } catch {
    return NextResponse.json(
      { error: "Invalid Microsoft Store URL" },
      { status: 400 }
    );
  }
}
