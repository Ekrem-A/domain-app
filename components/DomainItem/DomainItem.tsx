"use client";

import { useState, useEffect } from "react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

type Props = {
  domain: string;
  available: boolean;
  reason?: string;
  index: number;
};

export default function DomainItem({ domain, available, reason, index }: Props) {
  const [isFav, setIsFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize on client side only
  useEffect(() => {
    setMounted(true);
    setIsFav(isFavorite(domain));
  }, [domain]);

  const handleToggleFavorite = () => {
    toggleFavorite(domain);
    setIsFav(!isFav);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`
        flex items-center justify-between p-4 rounded-xl bg-white border
        shadow-sm hover:shadow-md transition-all duration-200
        animate-slide-up hover:-translate-y-0.5
        border-emerald-200 hover:border-emerald-300
      `}
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
    >
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="font-mono text-sm sm:text-base text-slate-700 font-medium truncate">
          {domain}
        </span>
        {reason && (
          <span className="text-xs text-slate-400 leading-snug">
            {reason}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleFavorite}
          className={`p-2 rounded-lg transition-all ${
            isFav
              ? "text-amber-500 bg-amber-50"
              : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
          }`}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill={isFav ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </button>

        <span
          className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap bg-emerald-50 text-emerald-600 border border-emerald-200"
        >
          Kullanılabilir
        </span>
      </div>
    </div>
  );
}
