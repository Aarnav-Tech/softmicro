export function FileCardSkeleton() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="skeleton w-8 h-8 rounded-lg" />
        <div className="skeleton h-3.5 rounded flex-1 max-w-xs" />
      </div>
      <div className="flex gap-2 mb-4 ml-10">
        <div className="skeleton h-5 w-14 rounded" />
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton h-5 w-12 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4 ml-10">
        <div>
          <div className="skeleton h-2.5 w-12 rounded mb-1.5" />
          <div className="skeleton h-3.5 w-20 rounded" />
        </div>
        <div>
          <div className="skeleton h-2.5 w-8 rounded mb-1.5" />
          <div className="skeleton h-3.5 w-16 rounded" />
        </div>
      </div>
      <div className="flex gap-2 ml-10">
        <div className="skeleton h-9 flex-1 rounded-lg" />
        <div className="skeleton h-9 w-9 rounded-lg" />
        <div className="skeleton h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

export function ResultsPageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-60 shrink-0">
        <div className="bg-surface-card border border-surface-border rounded-xl p-4">
          <div className="skeleton h-4 w-16 rounded mb-4" />
          <div className="skeleton h-3 w-32 rounded mb-5" />
          <div className="space-y-3 mb-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-4 w-full rounded" />
            ))}
          </div>
          <div className="border-t border-surface-border pt-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-4 w-3/4 rounded" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <FileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
