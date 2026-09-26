export default function StatCard({ label, value, sublabel, icon: Icon, accent = "#64748b", loading, hint, className = "" }) {
  return (
    <div className={`card px-3 sm:px-4 py-3 flex items-center gap-3 min-w-0 ${className}`} title={hint}>
      {Icon && (
        <div
          className="hidden sm:flex h-9 w-9 rounded-lg items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500 truncate">{label}</div>
        <div className={`text-xl font-semibold text-slate-900 tabular-nums leading-tight ${loading ? "opacity-40" : ""}`}>
          {value}
        </div>
        {sublabel && <div className="text-xs text-slate-500 leading-snug line-clamp-2 xl:truncate">{sublabel}</div>}
      </div>
    </div>
  );
}
