"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pageCount, onPage }) {
  if (pageCount <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-xl border border-border-default bg-bg-surface text-text-muted hover:text-text-primary hover:border-primary-500/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {start > 1 && <span className="text-sm text-text-muted px-1">...</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`min-w-9 h-9 px-2 rounded-xl text-sm font-medium transition-colors ${
            p === page
              ? "bg-primary-500 text-white"
              : "border border-border-default bg-bg-surface text-text-secondary hover:text-text-primary hover:border-primary-500/50"
          }`}
        >
          {p}
        </button>
      ))}
      {end < pageCount && <span className="text-sm text-text-muted px-1">...</span>}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pageCount}
        className="p-2 rounded-xl border border-border-default bg-bg-surface text-text-muted hover:text-text-primary hover:border-primary-500/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}