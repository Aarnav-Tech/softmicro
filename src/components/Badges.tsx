import type { Architecture, PackageType } from "@/lib/types";

// ─── Architecture badge ──────────────────────────────────────────────────────

const ARCH_STYLES: Record<Architecture, string> = {
  x64:     "bg-blue-500/15 text-blue-300 border-blue-500/30",
  x86:     "bg-purple-500/15 text-purple-300 border-purple-500/30",
  arm64:   "bg-amber-500/15 text-amber-300 border-amber-500/30",
  arm:     "bg-orange-500/15 text-orange-300 border-orange-500/30",
  neutral: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  unknown: "bg-slate-600/15 text-slate-400 border-slate-600/30",
};

export function ArchBadge({ arch }: { arch: Architecture }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${ARCH_STYLES[arch]}`}
    >
      {arch}
    </span>
  );
}

// ─── Package type badge ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<PackageType, string> = {
  msixbundle: "Bundle",
  appxbundle: "Bundle",
  msix:       "MSIX",
  appx:       "AppX",
  eappx:      "Encrypted AppX",
  emsix:      "Encrypted MSIX",
  unknown:    "Unknown",
};

const TYPE_STYLES: Record<PackageType, string> = {
  msixbundle: "bg-brand-500/15 text-brand-300 border-brand-500/30",
  appxbundle: "bg-brand-500/15 text-brand-300 border-brand-500/30",
  msix:       "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  appx:       "bg-teal-500/15 text-teal-300 border-teal-500/30",
  eappx:      "bg-rose-500/15 text-rose-300 border-rose-500/30",
  emsix:      "bg-rose-500/15 text-rose-300 border-rose-500/30",
  unknown:    "bg-slate-600/15 text-slate-400 border-slate-600/30",
};

export function TypeBadge({ type }: { type: PackageType }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${TYPE_STYLES[type]}`}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}

// ─── Latest badge ────────────────────────────────────────────────────────────

export function LatestBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/40">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
      Latest
    </span>
  );
}
