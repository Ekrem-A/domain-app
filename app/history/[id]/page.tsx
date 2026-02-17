"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSearchHistoryById } from "@/lib/history";
import { DomainList } from "@/components";
import type { SearchHistoryEntry } from "@/lib/types";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [entry, setEntry] = useState<SearchHistoryEntry | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = getSearchHistoryById(id);
    if (found) {
      setEntry(found);
    } else {
      setNotFound(true);
    }
  }, [id]);

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
        <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Kayıt bulunamadı</h2>
        <p className="text-sm text-slate-500 mb-4">Bu geçmiş kaydı silinmiş veya mevcut değil.</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 text-sm font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <svg className="w-8 h-8 animate-spin text-indigo-500 mx-auto" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const availableCount = entry.results.filter((r) => r.available).length;
  const registeredCount = entry.results.filter((r) => !r.available).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors animate-fade-in"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Geri
      </button>

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(entry.createdAt)}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
          Geçmiş Arama
        </h1>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-600 leading-relaxed">{entry.prompt}</p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-3 mb-4 animate-fade-in">
        <h2 className="text-xl font-semibold text-slate-800">Domain Sonuçları</h2>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
          {availableCount} kullanılabilir
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">
          {registeredCount} kayıtlı
        </span>
      </div>

      {/* Domain List */}
      <DomainList results={entry.results} />
    </div>
  );
}
