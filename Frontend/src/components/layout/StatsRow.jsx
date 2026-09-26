import { Car, Crosshair, Flame, Hexagon, Target } from "lucide-react";
import StatCard from "../common/StatCard";
import { num, pct } from "../../utils/format";

function computeStats(cells) {
  const total = cells.length;
  let predicted = 0, observed = 0, hits = 0, accidents = 0, probSum = 0;
  for (const c of cells) {
    if (c.hotspot_predicted) predicted++;
    if (c.observed_is_hotspot) observed++;
    if (c.hotspot_predicted && c.observed_is_hotspot) hits++;
    accidents += c.observed_accident_count || 0;
    probSum += c.hotspot_probability || 0;
  }
  return {
    total, predicted, observed, hits, accidents,
    avgProb: total ? probSum / total : null,
    precision: predicted ? hits / predicted : null,
    recall: observed ? hits / observed : null,
  };
}

export default function StatsRow({ cells, loading }) {
  const s = computeStats(cells);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      <StatCard
        icon={Flame}
        accent="#dc2626"
        label="Predicted hotspots"
        value={num(s.predicted)}
        sublabel={`of ${num(s.total)} cells · avg p ${pct(s.avgProb)}`}
        loading={loading}
      />
      <StatCard
        icon={Car}
        accent="#0f766e"
        label="Observed accidents"
        value={num(s.accidents)}
        sublabel={`${num(s.observed)} observed hotspot cells`}
        loading={loading}
      />
      <StatCard
        icon={Target}
        accent="#2563eb"
        label="Precision"
        value={pct(s.precision, 0)}
        sublabel={`${s.hits} of ${s.predicted} predicted correct`}
        hint="Share of predicted hotspots that were observed hotspots this month"
        loading={loading}
      />
      <StatCard
        icon={Crosshair}
        accent="#7c3aed"
        label="Recall"
        value={pct(s.recall, 0)}
        sublabel={`${s.hits} of ${s.observed} observed caught`}
        hint="Share of observed hotspots that the model flagged this month"
        loading={loading}
      />
      <StatCard
        icon={Hexagon}
        accent="#64748b"
        label="Cells in view"
        className="col-span-2 sm:col-span-1"
        value={num(s.total)}
        sublabel="H3 cells for current filters"
        loading={loading}
      />
    </div>
  );
}
