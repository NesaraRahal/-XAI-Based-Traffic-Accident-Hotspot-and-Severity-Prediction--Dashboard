import { pct } from "../../utils/format";
import { hotspotColor } from "../../utils/color";

export default function HotspotProbability({ probability, predicted }) {
  const color = hotspotColor(probability, predicted);
  const width = Math.min(100, Math.max(0, probability * 100));

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-semibold text-slate-800">
          {pct(probability)}
        </span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            predicted
              ? "bg-red-100 text-red-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {predicted ? "PREDICTED HOTSPOT" : "Not a hotspot"}
        </span>
      </div>
      <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}