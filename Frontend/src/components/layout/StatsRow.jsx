import StatCard from "../common/StatCard";
import { pct } from "../../utils/format";

export default function StatsRow({ cells }) {
  const total = cells.length;
  const hotspots = cells.filter((c) => c.hotspot_predicted).length;
  const avgProb =
    total > 0
      ? cells.reduce((sum, c) => sum + c.hotspot_probability, 0) / total
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Predicted Hotspots" value={hotspots} sublabel={`out of ${total} cells`} />
      <StatCard label="Total Cells" value={total} sublabel="in current view" />
      <StatCard label="Avg Hotspot Probability" value={pct(avgProb)} />
    </div>
  );
}