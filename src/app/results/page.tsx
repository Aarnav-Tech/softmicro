"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import FileCard from "@/components/FileCard";
import FilterSidebar from "@/components/FilterSidebar";
import { ResultsPageSkeleton } from "@/components/Skeletons";
import type { AppFile, AppResult, FilterState, ApiResponse } from "@/lib/types";

type SortKey = "version" | "size" | "name" | "arch";

const DEFAULT_FILTERS: FilterState = {
  architectures: [],
  types: [],
  latestOnly: false,
};

export default function ResultsPage() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";

  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: AppResult }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("version");
  const [cacheHit, setCacheHit] = useState(false);

  const fetchData = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setState({ status: "loading" });
    setFilters(DEFAULT_FILTERS);

    try {
      const res = await fetch(`/api/fetchApp?q=${encodeURIComponent(q)}`);
      setCacheHit(res.headers.get("X-Cache") === "HIT");
      const json: ApiResponse = await res.json();

      if (json.ok) {
        setState({ status: "success", data: json.data });
      } else {
        setState({ status: "error", message: json.error });
      }
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }, []);

  useEffect(() => {
    if (query) fetchData(query);
  }, [query, fetchData]);

  const filteredFiles = useMemo<AppFile[]>(() => {
    if (state.status !== "success") return [];
    let files = [...state.data.files];

    if (filters.latestOnly) files = files.filter((f) => f.isLatest);
    if (filters.architectures.length > 0)
      files = files.filter((f) => filters.architectures.includes(f.architecture));
    if (filters.types.length > 0)
      files = files.filter((f) => filters.types.includes(f.type));

    files.sort((a, b) => {
      switch (sort) {
        case "version": return b.version.localeCompare(a.version, undefined, { numeric: true });
        case "size":    return b.fileSize - a.fileSize;
        case "name":    return a.fileName.localeCompare(b.fileName);
        case "arch":    return a.architecture.localeCompare(b.architecture);
        default:        return 0;
      }
    });

    return files;
  }, [state, filters, sort]);

  const totalCount = state.status === "success" ? state.data.files.length : 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky compact header */}
      <div className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <a href="/" className="shrink-0 flex items-center gap-2 group" aria-label="Home">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center brand-glow transition-all group-hover:scale-105">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8l4 4 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="hidden sm:block font-display font-bold text-lg tracking-tight">
              Soft<span className="text-brand-400">Micro</span>
            </span>
          </a>
          <div className="flex-1">
            <SearchBar initialValue={query} compact />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Title + sort row */}
        {state.status !== "idle" && (
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-display font-bold text-xl text-slate-200">
                {state.status === "loading" && "Fetching packages..."}
                {state.status === "success" && <>Packages for <span className="font-mono text-brand-400">{state.data.productId}</span></>}
                {state.status === "error" && "Something went wrong"}
              </h1>
              {state.status === "success" && (
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                  {totalCount} packages found
                  {cacheHit && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-surface-hover text-slate-500 border border-surface-border">cached</span>
                  )}
                  <span>·</span>
                  <span>Fetched at {new Date(state.data.fetchedAt).toLocaleTimeString()}</span>
                </p>
              )}
            </div>

            {state.status === "success" && totalCount > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-slate-500 shrink-0">Sort by</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-8 px-2 pr-8 text-sm bg-surface-card border border-surface-border rounded-lg text-slate-300 focus:outline-none focus:border-brand-500 transition-colors appearance-none cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                >
                  <option value="version">Version</option>
                  <option value="size">File size</option>
                  <option value="name">Name</option>
                  <option value="arch">Architecture</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Idle */}
        {state.status === "idle" && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-card border border-surface-border flex items-center justify-center mb-4 text-slate-500">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium mb-1">No search yet</p>
            <p className="text-sm text-slate-600">Enter a Product ID or Store URL above to get started.</p>
          </div>
        )}

        {/* Loading */}
        {state.status === "loading" && <ResultsPageSkeleton />}

        {/* Error */}
        {state.status === "error" && (
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-semibold text-slate-200 mb-2">Failed to fetch packages</p>
            <p className="text-sm text-slate-500 mb-6">{state.message}</p>
            <button
              onClick={() => fetchData(query)}
              className="px-4 py-2 text-sm font-medium bg-surface-card border border-surface-border rounded-lg text-slate-300 hover:bg-surface-hover hover:text-slate-200 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Success */}
        {state.status === "success" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              totalCount={totalCount}
              filteredCount={filteredFiles.length}
            />
            <div className="flex-1">
              {filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-slate-400 font-medium mb-1">No packages match your filters</p>
                  <p className="text-sm text-slate-600">Try adjusting or resetting the filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredFiles.map((file, i) => (
                    <FileCard key={`${file.fileName}-${i}`} file={file} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
