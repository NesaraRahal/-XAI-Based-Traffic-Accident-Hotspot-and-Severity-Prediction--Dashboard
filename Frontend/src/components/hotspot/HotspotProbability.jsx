import { pct } from "../../utils/format";
import { hotspotColor } from "../../utils/color";

export default function HotspotProbability({ probability, predicted, threshold }) {
  const color = hotspotColor(probability, predicted);
  const width = Math.min(100, Math.max(0, probability * 100));
  const thr = threshold != null ? Math.min(100, Math.max(0, threshold * 100)) : null;

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-4xl font-bold tracking-tight tabular-nums" style={{ color: predicted ? color : "#0f172a" }}>
            {pct(probability)}
          </div>
          <div className="text-xs text-slate-500">hotspot probability</div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            predicted ? "bg-red-100 text-red-700 ring-1 ring-red-200" : "bg-slate-100 text-slate-600"
          }`}
        >
          {predicted ? "Predicted hotspot" : "Not a hotspot"}
        </span>
      </div>
      <div className="relative mt-4 mb-5">
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${width}%`, backgroundColor: color }} />
        </div>
        {thr != null && (
          <div className="absolute -top-1 bottom-[-4px]" style={{ left: `${thr}%` }}>
            <div className="h-[18px] w-0.5 bg-slate-800 -translate-x-1/2" />
            <div className="absolute top-5 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-500">
              threshold {pct(threshold, 0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
