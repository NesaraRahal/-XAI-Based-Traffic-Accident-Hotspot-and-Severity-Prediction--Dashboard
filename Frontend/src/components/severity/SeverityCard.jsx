import SeverityProbabilities from "./SeverityProbabilities";
import { SEVERITY_COLORS } from "../../utils/color";
import { pct } from "../../utils/format";

export default function SeverityCard({ severity, historicalMix }) {
  const cls = severity.predicted_class;
  const p = severity.class_probabilities?.[cls];
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-1.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[cls] || "#94a3b8" }} />
        <div>
          <div className="text-xl font-bold text-slate-900 leading-tight">{cls}</div>
          <div className="text-xs text-slate-500">most likely outcome if an accident occurs · {pct(p)}</div>
        </div>
      </div>
      <SeverityProbabilities
        probabilities={severity.class_probabilities}
        predictedClass={cls}
        historicalMix={historicalMix}
      />
      {historicalMix && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="h-3 w-0.5 bg-slate-700 rounded" /> marker = share of each class in this cell over the last 180 days
        </div>
      )}
    </div>
  );
}
