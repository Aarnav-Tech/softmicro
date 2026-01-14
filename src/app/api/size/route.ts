import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { urls } = await req.json();

  if (!Array.isArray(urls)) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }

  const results: Record<string, number | null> = {};

  await Promise.all(
    urls.slice(0, 10).map(async (url: string) => {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Range: "bytes=0-0"
          }
        });

        const contentRange = res.headers.get("content-range");
        // example: bytes 0-0/12345678

        if (contentRange) {
          const size = contentRange.split("/")[1];
          results[url] = size ? Number(size) : null;
        } else {
          results[url] = null;
        }
      } catch {
        results[url] = null;
      }
    })
  );

  return NextResponse.json(results);
}
