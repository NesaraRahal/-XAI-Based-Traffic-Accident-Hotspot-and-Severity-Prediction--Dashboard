export default function ShapFeatureList({ features }) {
  if (!features || features.length === 0) {
    return <div className="text-sm text-slate-400 italic">No explanation available.</div>;
  }

  const maxAbs = Math.max(...features.map((f) => Math.abs(f.shap)));

  return (
    <div className="space-y-3">
      {features.map((f, idx) => {
        const positive = f.shap >= 0;
        const magnitude = maxAbs > 0 ? (Math.abs(f.shap) / maxAbs) * 100 : 0;
        return (
          <div key={`${f.feature}-${idx}`}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-start gap-2 min-w-0">
                <span
                  className={`text-lg leading-none flex-shrink-0 ${
                    positive ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {positive ? "↑" : "↓"}
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-slate-700 truncate">{f.label}</div>
                  <div className="text-xs text-slate-400">{f.direction}</div>
                </div>
              </div>
              <span
                className={`text-sm font-mono flex-shrink-0 ${
                  positive ? "text-red-600" : "text-green-600"
                }`}
              >
                {positive ? "+" : ""}
                {f.shap.toFixed(3)}
              </span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${positive ? "bg-red-400" : "bg-green-400"}`}
                style={{ width: `${magnitude}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}