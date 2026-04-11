"use client";

import type { Architecture, FilterState, PackageType } from "@/lib/types";

const ARCHITECTURES: Architecture[] = ["x64", "x86", "arm64", "arm", "neutral"];
const TYPES: PackageType[] = ["msixbundle", "appxbundle", "msix", "appx", "eappx", "emsix"];

const TYPE_LABELS: Record<PackageType, string> = {
  msixbundle: "MSIX Bundle",
  appxbundle: "AppX Bundle",
  msix: "MSIX",
  appx: "AppX",
  eappx: "Encrypted AppX",
  emsix: "Encrypted MSIX",
  unknown: "Unknown",
};

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export default function FilterSidebar({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: FilterSidebarProps) {
  const toggleArch = (arch: Architecture) => {
    const next = filters.architectures.includes(arch)
      ? filters.architectures.filter((a) => a !== arch)
      : [...filters.architectures, arch];
    onChange({ ...filters, architectures: next });
  };

  const toggleType = (type: PackageType) => {
    const next = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types: next });
  };

  const toggleLatestOnly = () => {
    onChange({ ...filters, latestOnly: !filters.latestOnly });
  };

  const resetAll = () => {
    onChange({ architectures: [], types: [], latestOnly: false });
  };

  const hasActiveFilters =
    filters.architectures.length > 0 ||
    filters.types.length > 0 ||
    filters.latestOnly;

  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 sticky top-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              Reset all
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Showing{" "}
          <span className="text-slate-300 font-medium">{filteredCount}</span> of{" "}
          <span className="text-slate-300 font-medium">{totalCount}</span> packages
        </p>

        <div className="mb-5">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <button
              type="button"
              onClick={toggleLatestOnly}
              className={`w-8 h-[18px] rounded-full border transition-colors relative ${
                filters.latestOnly
                  ? "bg-brand-600 border-brand-500"
                  : "bg-surface-hover border-surface-border"
              }`}
              role="switch"
              aria-checked={filters.latestOnly}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                  filters.latestOnly ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors select-none">
              Latest only
            </span>
          </label>
        </div>

        <div className="border-t border-surface-border" />

        <div className="py-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Architecture
          </p>
          <div className="space-y-2">
            {ARCHITECTURES.map((arch) => (
              <CheckboxItem
                key={arch}
                label={arch}
                checked={filters.architectures.includes(arch)}
                onChange={() => toggleArch(arch)}
                mono
              />
            ))}
          </div>
        </div>

        <div className="border-t border-surface-border" />

        <div className="py-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Package Type
          </p>
          <div className="space-y-2">
            {TYPES.map((type) => (
              <CheckboxItem
                key={type}
                label={TYPE_LABELS[type]}
                checked={filters.types.includes(type)}
                onChange={() => toggleType(type)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function CheckboxItem({
  label,
  checked,
  onChange,
  mono = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  mono?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <button
        type="button"
        onClick={onChange}
        role="checkbox"
        aria-checked={checked}
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
          checked
            ? "bg-brand-600 border-brand-500"
            : "bg-surface-hover border-surface-border group-hover:border-slate-500"
        }`}
      >
        {checked && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
            <path
              d="M1.5 4.5L3.5 6.5L7.5 2.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <span
        className={`text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none ${
          mono ? "font-mono" : ""
        }`}
      >
        {label}
      </span>
    </label>
  );
}
