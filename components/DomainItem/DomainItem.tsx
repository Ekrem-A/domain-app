type Props = {
  domain: string;
  available: boolean;
  index: number;
};

export default function DomainItem({ domain, available, index }: Props) {
  return (
    <div
      className={`
        flex items-center justify-between p-4 rounded-xl bg-white border
        shadow-sm hover:shadow-md transition-all duration-200
        animate-slide-up hover:-translate-y-0.5
        ${available
          ? "border-emerald-200 hover:border-emerald-300"
          : "border-slate-200 hover:border-slate-300"
        }
      `}
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
    >
      <span className="font-mono text-sm sm:text-base text-slate-700 font-medium">
        {domain}
      </span>
      <span
        className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg ${
          available
            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
            : "bg-red-50 text-red-500 border border-red-200"
        }`}
      >
        {available ? "Kullanılabilir" : "Kayıtlı"}
      </span>
    </div>
  );
}
