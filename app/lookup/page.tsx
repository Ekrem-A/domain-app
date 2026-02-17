"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type LookupResult = {
  domain: string;
  available: boolean;
  registered: boolean;
  name?: string;
  status?: string[];
  events?: { action: string; date: string }[];
  nameservers?: string[];
  registrar?: { name: string; url?: string } | null;
  port43?: string | null;
  error?: string;
};

function LookupContent() {
  const searchParams = useSearchParams();
  const prefillDomain = searchParams.get("domain") || "";

  const [domain, setDomain] = useState(prefillDomain);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");

  // Auto-search if domain is provided via URL
  useEffect(() => {
    if (prefillDomain) {
      setDomain(prefillDomain);
      handleLookup(prefillDomain);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillDomain]);

  async function handleLookup(searchDomain?: string) {
    const target = (searchDomain || domain).trim().toLowerCase();
    if (!target) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(`/api/lookup?domain=${encodeURIComponent(target)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sorgu başarısız oldu.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  function getEventLabel(action: string) {
    const labels: Record<string, string> = {
      registration: "Kayıt Tarihi",
      expiration: "Bitiş Tarihi",
      "last changed": "Son Değişiklik",
      "last update of RDAP database": "RDAP Güncelleme",
    };
    return labels[action] || action;
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, { label: string; color: string }> = {
      active: { label: "Aktif", color: "bg-emerald-100 text-emerald-700" },
      "client transfer prohibited": { label: "Transfer Yasak", color: "bg-amber-100 text-amber-700" },
      "client delete prohibited": { label: "Silme Yasak", color: "bg-amber-100 text-amber-700" },
      "client update prohibited": { label: "Güncelleme Yasak", color: "bg-amber-100 text-amber-700" },
      "server transfer prohibited": { label: "Sunucu Transfer Yasak", color: "bg-red-100 text-red-700" },
      "server delete prohibited": { label: "Sunucu Silme Yasak", color: "bg-red-100 text-red-700" },
      "server update prohibited": { label: "Sunucu Güncelleme Yasak", color: "bg-red-100 text-red-700" },
    };
    return labels[status] || { label: status, color: "bg-slate-100 text-slate-600" };
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
          Domain Sorgula
        </h1>
        <p className="text-slate-500 text-lg">
          Herhangi bir domain adının kayıt bilgilerini sorgulayın.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-lg shadow-indigo-500/5 border border-slate-200/60 p-6 mb-6 animate-slide-up">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Domain Adı
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="Örn: google.com"
            className="flex-1 px-4 py-3 text-base border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all"
          />
          <button
            onClick={() => handleLookup()}
            disabled={loading || !domain.trim()}
            className="px-6 py-3 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-indigo-500/25"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              "Sorgula"
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6 animate-fade-in">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-slide-up space-y-4">
          {/* Availability Banner */}
          <div
            className={`p-5 rounded-2xl border ${
              result.available
                ? "bg-emerald-50 border-emerald-200"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-lg font-semibold text-slate-800">
                {result.name || result.domain}
              </span>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                  result.available
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {result.available ? "Kullanılabilir" : "Kayıtlı"}
              </span>
            </div>

            {result.available && (
              <p className="text-sm text-emerald-600">
                Bu domain kayıt için müsaittir.
              </p>
            )}
          </div>

          {/* Registration Details - only shown for registered domains */}
          {result.registered && (
            <>
              {/* Status */}
              {result.status && result.status.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Durum
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.status.map((s) => {
                      const { label, color } = getStatusLabel(s);
                      return (
                        <span key={s} className={`text-xs font-medium px-2.5 py-1 rounded-lg ${color}`}>
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Events / Dates */}
              {result.events && result.events.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Tarihler
                  </h3>
                  <div className="space-y-2">
                    {result.events.map((event, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-sm text-slate-500">{getEventLabel(event.action)}</span>
                        <span className="text-sm font-medium text-slate-700">{formatDate(event.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registrar */}
              {result.registrar && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Kayıt Firması (Registrar)
                  </h3>
                  <p className="text-sm text-slate-700 font-medium">{result.registrar.name}</p>
                  {result.registrar.url && (
                    <a
                      href={result.registrar.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:text-indigo-600 mt-1 inline-block"
                    >
                      {result.registrar.url}
                    </a>
                  )}
                </div>
              )}

              {/* Nameservers */}
              {result.nameservers && result.nameservers.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                    </svg>
                    Nameserver&apos;lar
                  </h3>
                  <div className="space-y-1.5">
                    {result.nameservers.map((ns, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span className="text-sm font-mono text-slate-600">{ns}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WHOIS Server */}
              {result.port43 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    WHOIS Sunucusu
                  </h3>
                  <span className="text-sm font-mono text-slate-600">{result.port43}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto text-center py-20">
          <svg className="w-8 h-8 animate-spin text-indigo-500 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      }
    >
      <LookupContent />
    </Suspense>
  );
}
