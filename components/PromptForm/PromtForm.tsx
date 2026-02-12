"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function PromptForm({ value, onChange, onSubmit, loading }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-2">
        İşinizi veya projenizi tanımlayın
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Örn: Bir çiçekçiyim, modern ve akılda kalıcı bir domain istiyorum"
        rows={4}
        className="w-full p-4 text-base border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all"
      />

      <button
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className="mt-4 w-full py-3.5 px-6 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all cursor-pointer shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Kontrol ediliyor...
          </span>
        ) : (
          "Domain Bul"
        )}
      </button>
    </div>
  );
}
