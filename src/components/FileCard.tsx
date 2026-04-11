"use client";

import { useState } from "react";
import type { AppFile } from "@/lib/types";
import { ArchBadge, TypeBadge, LatestBadge } from "./Badges";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

interface FileCardProps {
  file: AppFile;
  index: number;
}

export default function FileCard({ file, index }: FileCardProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(file.downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = file.downloadUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const staggerClass = `stagger-${Math.min(index + 1, 6)}`;

  return (
    <div
      className={`
        bg-surface-card border border-surface-border rounded-xl p-5
        card-hover animate-slide-up opacity-0 ${staggerClass}
        [animation-fill-mode:forwards]
        ${file.isLatest ? "ring-1 ring-brand-500/20" : ""}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          {/* File icon + name */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-slate-400">
              <PackageIcon />
            </div>
            <p
              className="text-sm font-mono text-slate-200 leading-tight truncate"
              title={file.fileName}
            >
              {file.fileName}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 ml-10">
            {file.isLatest && <LatestBadge />}
            <ArchBadge arch={file.architecture} />
            <TypeBadge type={file.type} />
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 gap-3 mb-4 ml-10">
        <MetaItem label="Version" value={file.version} mono />
        <MetaItem label="Size" value={formatBytes(file.fileSize)} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-10">
        <a
          href={file.downloadUrl}
          download
          className="flex-1 flex items-center justify-center gap-2 h-9 px-4 text-sm font-semibold bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white rounded-lg transition-colors brand-glow"
        >
          <DownloadIcon />
          Download
        </a>
        <button
          onClick={copyLink}
          title={copied ? "Copied!" : "Copy download link"}
          className="flex items-center justify-center h-9 w-9 rounded-lg border border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:bg-surface-hover transition-all"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
        <a
          href={file.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open link in new tab"
          className="flex items-center justify-center h-9 w-9 rounded-lg border border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:bg-surface-hover transition-all"
        >
          <ExternalLinkIcon />
        </a>
      </div>
    </div>
  );
}

function MetaItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`text-sm text-slate-300 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function PackageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
      <path d="m7.5 4.27 9 5.15" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
      <circle cx="18.5" cy="18" r="2.5" />
      <path d="M18.5 15.5v1M18.5 20.5v1M15.75 16.75l.87.5M20.38 19.25l.87.5M15.75 19.25l.87-.5M20.38 16.75l.87-.5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
