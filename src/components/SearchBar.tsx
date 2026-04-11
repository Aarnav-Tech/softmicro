"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const MAX_HISTORY = 5;
const HISTORY_KEY = "storedl:history";

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: string[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
  } catch {}
}

interface SearchBarProps {
  initialValue?: string;
  /** If true, show as compact bar (for header on results page) */
  compact?: boolean;
}

export default function SearchBar({ initialValue = "", compact = false }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) return;

      // Update history
      const updated = [q, ...history.filter((h) => h !== q)].slice(0, MAX_HISTORY);
      setHistory(updated);
      saveHistory(updated);

      setLoading(true);
      setShowHistory(false);
      router.push(`/results?q=${encodeURIComponent(q)}`);
    },
    [history, router]
  );

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(value);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  if (compact) {
    return (
      <form onSubmit={onFormSubmit} className="flex items-center gap-2 w-full max-w-xl">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Product ID or Store URL…"
            className="w-full h-9 px-3 pr-10 text-sm bg-surface-muted border border-surface-border rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label="Clear"
            >
              <XSmallIcon />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="h-9 px-4 text-sm font-medium bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          {loading ? "…" : "Search"}
        </button>
      </form>
    );
  }

  // Full hero search bar
  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <form onSubmit={onFormSubmit} className="relative">
        <div className="relative flex items-center">
          {/* Search icon */}
          <div className="absolute left-4 text-slate-500 pointer-events-none">
            <SearchIcon />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => history.length > 0 && setShowHistory(true)}
            placeholder="Enter Product ID (9WZDNCRFHVJL) or Store URL…"
            autoComplete="off"
            spellCheck={false}
            className="w-full h-14 pl-12 pr-36 text-base bg-surface-card border border-surface-border rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all shadow-lg"
          />

          {/* Clear + Submit */}
          <div className="absolute right-2 flex items-center gap-1.5">
            {value && (
              <button
                type="button"
                onClick={() => { setValue(""); inputRef.current?.focus(); }}
                className="p-1.5 text-slate-500 hover:text-slate-300 rounded-md hover:bg-surface-hover transition-colors"
                aria-label="Clear input"
              >
                <XSmallIcon />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="h-10 px-5 text-sm font-semibold bg-brand-600 hover:bg-brand-500 active:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all brand-glow"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <SpinnerIcon />
                  <span>Searching</span>
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* History dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border">
            <span className="text-xs text-slate-500 font-medium">Recent searches</span>
            <button
              onClick={clearHistory}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>
          {history.map((item) => (
            <button
              key={item}
              onClick={() => { setValue(item); handleSubmit(item); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-surface-hover transition-colors text-left"
            >
              <ClockIcon />
              <span className="truncate font-mono text-xs">{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function XSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" aria-hidden>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
