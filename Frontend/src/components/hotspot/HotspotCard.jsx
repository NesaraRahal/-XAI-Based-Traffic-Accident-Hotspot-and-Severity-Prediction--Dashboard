import HotspotProbability from "./HotspotProbability";

export default function HotspotCard({ hotspot, observed }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-3">
        Hotspot Prediction
      </div>
      <HotspotProbability
        probability={hotspot.probability}
        predicted={hotspot.predicted}
      />
      <div className="mt-3 flex justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
        <span>Decision threshold: {(hotspot.threshold * 100).toFixed(0)}%</span>
        <span>
          Observed: {observed.is_hotspot ? "hotspot" : "not"} · {observed.accident_count} accidents
        </span>
      </div>
    </div>
  );
}