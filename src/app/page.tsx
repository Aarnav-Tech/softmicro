"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
    neutral: files.filter(f => f.arch === "neutral"),
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
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);


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

  /* ---------- Core fetch logic (reusable) ---------- */

  function showToast(message: string) {
  setToast(message);
  setTimeout(() => setToast(null), 2000);
  }


  async function fetchWithInput(input: string) {
    setLoading(true);
    setError(null);
    setFiles([]);
    setShowAdvanced(false);

    try {
      // 1️⃣ Extract productId
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input }),
      });

      const extractData = await extractRes.json();
      if (!extractRes.ok) {
        setError(extractData.error || "Invalid Microsoft Store link or ID");
        return;
      }

      const productId = extractData.productId;

      // 🔗 Update URL to be shareable
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("id", productId);
      window.history.replaceState({}, "", newUrl.toString());

      // 2️⃣ Fetch store files
      const storeRes = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const storeData = await storeRes.json();

      if (!storeData.files || storeData.files.length === 0) {
        setError(
          "No downloadable installers found for this app. Some Microsoft Store apps only work via the Store."
        );
      }

      setFiles(storeData.files ?? []);
    } catch {
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Button handler ---------- */

  async function handleSubmit() {
    if (!url.trim()) {
      setError("Please paste a Microsoft Store link or Product ID");
      return;
    }

    await fetchWithInput(url);
  }

  /* ---------- Auto-load from shared URL ---------- */

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setUrl(id);
      fetchWithInput(id);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        urls: primaryFiles.map(f => f.url),
      }),
    })
      .then(res => res.json())
      .then((sizes) => {
        setFiles(prev =>
          prev.map(f => ({
            ...f,
            size: sizes[f.url] ?? f.size,
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

        {/* Share link button */}
        {files.length > 0 && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast("Link Copied. 📋");
            }}
            className="text-sm text-sky-500 hover:underline mb-3 cursor-pointer"
          >
            🔗 Copy shareable link
          </button>
        )}

        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Microsoft Store link or Product ID"
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
              className="text-sky-500 hover:underline text-sm cursor-pointer"
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
      {toast && (
  <div
    className="
      fixed bottom-6 left-1/2 -translate-x-1/2
      bg-slate-900 text-white
      dark:bg-slate-100 dark:text-black
      px-4 py-2 rounded-lg
      text-sm font-medium
      shadow-lg
      animate-fade-in
    "
  >
    {toast}
  </div>
)}

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
