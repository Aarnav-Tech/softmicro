"use client";

import { useEffect, useState } from "react";

/* ---------- Types ---------- */

type StoreFile = {
  url: string;
  filename: string;
  type: string;
  arch: string;
  size?: number | null;
};

const PRIMARY_TYPES = ["msix", "msixbundle", "appx", "appxbundle"];

/* ---------- Helpers ---------- */

function groupByArch(files: StoreFile[]) {
  return {
    x64: files.filter(f => f.arch === "x64"),
    arm64: files.filter(f => f.arch === "arm64"),
    x86: files.filter(f => f.arch === "x86"),
    neutral: files.filter(f => f.arch === "neutral")
  };
}

function formatSize(bytes?: number | null) {
  if (bytes === undefined) return "fetching…";
  if (bytes === null) return "—";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/* ---------- Page ---------- */

export default function Home() {
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState<StoreFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [dark, setDark] = useState(true);

  /* ---------- Theme ---------- */

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  /* ---------- Fetch flow ---------- */

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setFiles([]);
    setShowAdvanced(false);

    try {
      // 1️⃣ Extract productId
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const extractData = await extractRes.json();
      if (!extractRes.ok) {
        setError(extractData.error || "Invalid Microsoft Store URL");
        return;
      }

      // 2️⃣ Fetch store files
      const storeRes = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: extractData.productId })
      });

      const storeData = await storeRes.json();
      setFiles(storeData.files ?? []);
    } catch {
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Filtering ---------- */

  const primaryFiles = files.filter(f =>
    PRIMARY_TYPES.includes(f.type)
  );

  const advancedFiles = files.filter(
    f => !PRIMARY_TYPES.includes(f.type)
  );

  const grouped = groupByArch(primaryFiles);

  /* ---------- Fetch file sizes (primary only) ---------- */

  useEffect(() => {
    if (!primaryFiles.length) return;

    fetch("/api/size", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: primaryFiles.map(f => f.url)
      })
    })
      .then(res => res.json())
      .then((sizes) => {
        setFiles(prev =>
          prev.map(f => ({
            ...f,
            size: sizes[f.url] ?? f.size
          }))
        );
      })
      .catch(() => {});
  }, [primaryFiles]);

  /* ---------- Render ---------- */

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <div className="max-w-3xl mx-auto relative">

        {/* Theme toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="absolute top-0 right-0 px-3 py-1.5 rounded-md
                     text-sm font-medium
                     bg-slate-200 text-slate-900
                     dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
        >
          {dark ? "Light mode" : "Dark mode"}
        </button>

        <h1 className="text-2xl font-semibold mb-2">
          Microsoft Store Downloader
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Download official Microsoft Store packages without the Store app
        </p>

        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://apps.microsoft.com/detail/..."
            className="flex-1 p-3 rounded-lg
                       bg-white dark:bg-slate-800
                       border border-slate-300 dark:border-slate-700
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 rounded-lg bg-sky-500 text-black font-semibold
                       hover:bg-sky-400 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Loading…" : "Fetch"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-500">{error}</p>
        )}

        {/* Downloads */}
        {primaryFiles.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-3">
              Downloads
            </h2>

            {Object.entries(grouped).map(([arch, items]) =>
              items.length > 0 ? (
                <div key={arch} className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    {arch}
                  </h3>

                  <div className="space-y-2">
                    {items.map(file => (
                      <FileCard key={file.url} file={file} />
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </section>
        )}

        {/* Advanced files */}
        {advancedFiles.length > 0 && (
          <section className="mt-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sky-500 hover:underline text-sm"
            >
              {showAdvanced
                ? "Hide advanced files"
                : `Show advanced files (${advancedFiles.length})`}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-2 opacity-90">
                {advancedFiles.map(file => (
                  <FileCard key={file.url} file={file} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

/* ---------- File Card ---------- */

function FileCard({ file }: { file: StoreFile }) {
  return (
    <div
      className="flex items-center justify-between
                 bg-white dark:bg-slate-900
                 border border-slate-200 dark:border-slate-800
                 rounded-lg p-3"
    >
      <div className="overflow-hidden">
        <p className="text-sm truncate">
          {file.filename}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          {file.arch} • {file.type} • {formatSize(file.size)}
        </p>
      </div>

      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 px-3 py-1.5 rounded-md
                   bg-slate-200 dark:bg-slate-800
                   hover:bg-slate-300 dark:hover:bg-slate-700
                   text-sm font-medium"
      >
        Download
      </a>
    </div>
  );
}
