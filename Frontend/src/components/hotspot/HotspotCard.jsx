import { CircleCheck, CircleX } from "lucide-react";
import HotspotProbability from "./HotspotProbability";
import { OUTCOMES, outcomeKey } from "../../utils/color";

export default function HotspotCard({ hotspot, observed, historical }) {
  const key = outcomeKey(hotspot.predicted, observed.is_hotspot);
  const outcome = OUTCOMES[key];
  const correct = key === "hit" || key === "correctNegative";

  return (
    <div className="card p-4">
      <HotspotProbability probability={hotspot.probability} predicted={hotspot.predicted} threshold={hotspot.threshold} />

      <div
        className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
          correct ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
        }`}
      >
        {correct ? <CircleCheck className="h-4 w-4 flex-shrink-0 mt-px" /> : <CircleX className="h-4 w-4 flex-shrink-0 mt-px" />}
        <div>
          <span className="font-semibold">{outcome.label}</span> — {outcome.description.toLowerCase()}.
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="Observed accidents" value={observed.accident_count} />
        <Metric label="Observed hotspot" value={observed.is_hotspot ? "Yes" : "No"} />
        <Metric label="Last 180 days" value={historical?.accidents_180d ?? "—"} />
      </dl>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <dd className="text-base font-semibold text-slate-900 tabular-nums">{value}</dd>
      <dt className="text-[10px] leading-tight text-slate-500">{label}</dt>
    </div>
  );
}
