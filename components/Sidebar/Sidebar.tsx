"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getFavorites, removeFavorite } from "@/lib/favorites";
import { getSearchHistory, removeSearchHistory, clearSearchHistory } from "@/lib/history";
import type { Favorite, SearchHistoryEntry } from "@/lib/types";

export default function Sidebar() {
  const pathname = usePathname();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavorites(getFavorites());
    setHistory(getSearchHistory());
  }, []);

  // Listen for storage changes (e.g. from other tabs or favorite toggles)
  useEffect(() => {
    const handleFavStorage = () => {
      setFavorites(getFavorites());
    };
    const handleHistoryStorage = () => {
      setHistory(getSearchHistory());
    };

    window.addEventListener("storage", handleFavStorage);
    window.addEventListener("favorites-updated", handleFavStorage);
    window.addEventListener("storage", handleHistoryStorage);
    window.addEventListener("history-updated", handleHistoryStorage);
    return () => {
      window.removeEventListener("storage", handleFavStorage);
      window.removeEventListener("favorites-updated", handleFavStorage);
      window.removeEventListener("storage", handleHistoryStorage);
      window.removeEventListener("history-updated", handleHistoryStorage);
    };
  }, []);

  // Refresh favorites & history when pathname changes
  useEffect(() => {
    setFavorites(getFavorites());
    setHistory(getSearchHistory());
  }, [pathname]);

  const handleRemoveFavorite = (domain: string) => {
    removeFavorite(domain);
    setFavorites(getFavorites());
    window.dispatchEvent(new Event("favorites-updated"));
  };

  const handleRemoveHistory = (id: string) => {
    removeSearchHistory(id);
    setHistory(getSearchHistory());
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Az önce";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}sa önce`;
    const days = Math.floor(hours / 24);
    return `${days}g önce`;
  }

  const navItems = [
    {
      href: "/",
      label: "Domain Bul",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      href: "/lookup",
      label: "Domain Sorgula",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {collapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full z-40 bg-white border-r border-slate-200 shadow-lg
          transition-transform duration-300 ease-in-out
          w-72 flex flex-col
          ${collapsed ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:shadow-none
        `}
      >
        {/* Logo / Brand */}
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
            AI Domain Finder
          </h2>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setCollapsed(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  pathname === item.href
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Favorites */}
        <div className="overflow-hidden flex flex-col mt-2">
          <div className="px-5 py-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Favoriler
            </h3>
            {favorites.length > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {favorites.length}
              </span>
            )}
          </div>

          <div className="overflow-y-auto px-3 pb-2" style={{ maxHeight: "200px" }}>
            {favorites.length === 0 ? (
              <div className="px-2 py-4 text-center">
                <svg className="w-6 h-6 mx-auto text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <p className="text-xs text-slate-400">Henüz favori eklenmedi</p>
              </div>
            ) : (
              <div className="space-y-1">
                {favorites.map((fav) => (
                  <div
                    key={fav.domain}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Link
                      href={`/lookup?domain=${encodeURIComponent(fav.domain)}`}
                      onClick={() => setCollapsed(false)}
                      className="flex-1 min-w-0"
                    >
                      <span className="text-sm font-mono text-slate-600 truncate block">
                        {fav.domain}
                      </span>
                    </Link>
                    <button
                      onClick={() => handleRemoveFavorite(fav.domain)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-500 transition-all"
                      title="Favorilerden kaldır"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search History */}
        <div className="flex-1 overflow-hidden flex flex-col border-t border-slate-100">
          <div className="px-5 py-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Geçmiş
            </h3>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    {history.length}
                  </span>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    title="Geçmişi temizle"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {history.length === 0 ? (
              <div className="px-2 py-4 text-center">
                <svg className="w-6 h-6 mx-auto text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-slate-400">Henüz arama yapılmadı</p>
              </div>
            ) : (
              <div className="space-y-1">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="group flex items-start justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Link
                      href={`/history/${entry.id}`}
                      onClick={() => setCollapsed(false)}
                      className="flex-1 min-w-0"
                    >
                      <span className="text-sm text-slate-700 line-clamp-2 leading-snug block">
                        {entry.prompt}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-emerald-500 font-medium">
                          {entry.results.filter((r) => r.available).length} müsait
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">
                          {formatTimeAgo(entry.createdAt)}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemoveHistory(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-500 transition-all mt-0.5 shrink-0"
                      title="Geçmişten sil"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
