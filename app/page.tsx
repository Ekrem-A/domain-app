"use client";

import { useState } from "react";
import { PromptForm } from "@/components";
import { DomainList } from "@/components";
import { generateDomains } from "@/lib/gpt";
import { checkDomains } from "@/lib/rdap";
import type { DomainResult, DomainSuggestion } from "@/lib/types";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setResults([]);
    setError("");

    try {
      setStatus("Domain isimleri üretiliyor...");
      const suggestions = await generateDomains(prompt);

      const domainNames = suggestions.map((s) => s.domain);
      setStatus(`${domainNames.length} domain kontrol ediliyor...`);
      const checked = await checkDomains(domainNames);

      // Merge reasons with check results (show all domains)
      const reasonMap = new Map(suggestions.map((s) => [s.domain, s.reason]));
      const allDomains = checked
        .map((r) => ({ ...r, reason: reasonMap.get(r.domain) || "" }));

      // Sort: available first, then unavailable
      allDomains.sort((a, b) => {
        if (a.available === b.available) return 0;
        return a.available ? -1 : 1;
      });

      setResults(allDomains);
      setStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
          AI Domain Finder
        </h1>
        <p className="text-slate-500 text-lg">
          İşinizi tanımlayın, size uygun domain isimlerini bulalım.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg shadow-indigo-500/5 border border-slate-200/60 p-6 mb-6 animate-slide-up">
        <PromptForm
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>

      {/* Status */}
      {status && (
        <div className="flex items-center gap-2 justify-center py-3 animate-fade-in">
          <svg className="w-4 h-4 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-slate-500">{status}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6 animate-fade-in">
          {error}
        </div>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="flex items-center gap-3 mb-4 animate-fade-in">
          <h2 className="text-xl font-semibold text-slate-800">Domain Sonuçları</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
            {results.filter((r) => r.available).length} kullanılabilir
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            {results.filter((r) => !r.available).length} kayıtlı
          </span>
        </div>
      )}

      {/* Domain List */}
      <DomainList results={results} />
    </main>
  );
}
