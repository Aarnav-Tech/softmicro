# SoftMicro — Microsoft Store Downloader

A production-ready Next.js web app for downloading Microsoft Store apps via the AdGuard Store API.

## Architecture & CORS Bypass

```
Browser (CORS-restricted)
    │  GET /api/fetchApp?q=<ProductID>
    ▼
Next.js API Route  (/api/fetchApp/route.ts)  ← Node.js, no CORS restrictions
    │  [1] Validate + sanitize input
    │  [2] Check in-memory cache (TTL 10 min)
    │  [3] POST to store.rg-adguard.net with spoofed browser headers
    │  [4] Parse HTML response -> structured JSON
    │  [5] Store in cache, return JSON to browser
    ▼
Browser receives clean JSON — never sees the upstream API
```

The Next.js server-to-AdGuard request is server-to-server — no browser, no CORS policy applies.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import in vercel.com
3. Set env vars (optional — defaults work)
4. Deploy

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| RATE_LIMIT_WINDOW_MS | 60000 | Rate limit window (ms) |
| RATE_LIMIT_MAX | 20 | Max requests per IP per window |
| CACHE_TTL_SECONDS | 600 | Cache TTL in seconds |

## Example Product IDs

| App | ID |
|---|---|
| VLC | 9NBLGGH4VVNH |
| WhatsApp | 9NKSQGP7F2NH |
| Spotify | 9NCBCSZSJRSB |
| Windows Terminal | 9N0DX20HK701 |

## License

MIT
