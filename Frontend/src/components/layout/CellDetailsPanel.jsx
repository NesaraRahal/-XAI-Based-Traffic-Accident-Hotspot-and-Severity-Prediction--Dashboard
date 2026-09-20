import { useCellDetails } from "../../hooks/useCellDetails";
import Loading from "../common/Loading";
import HotspotCard from "../hotspot/HotspotCard";
import SeverityCard from "../severity/SeverityCard";
import ExplanationCard from "../xai/ExplanationCard";

export default function CellDetailsPanel({ h3Cell, yearMonth }) {
  const { details, loading, error } = useCellDetails(h3Cell, yearMonth);

  if (!h3Cell) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="text-xs uppercase text-slate-500 mb-2">Selected cell</div>
        <div className="text-sm text-slate-500">
          Click a hex on the map to see prediction details.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <Loading label="Loading cell details..." />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
        Failed to load cell details.
      </div>
    );
  }

  const showSeverity = details.hotspot.predicted;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          Selected cell
        </div>
        <div className="text-lg font-semibold text-slate-800">
          {details.location.police_division || "Unknown division"}
        </div>
        <div className="text-xs font-mono text-slate-500 mt-1 break-all">
          {details.h3_cell}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {details.year_month} · {details.location.cell_lat.toFixed(4)}, {details.location.cell_lng.toFixed(4)}
        </div>
      </div>

      <HotspotCard hotspot={details.hotspot} observed={details.observed} />

      <ExplanationCard
        title="Why this hotspot prediction?"
        subtitle="Top drivers of the hotspot probability"
        features={details.hotspot.top_shap_features}
      />

      {showSeverity && (
        <>
          <SeverityCard
            severity={details.severity}
            historicalMix={details.historical_context.severity_mix_180d}
          />
          <ExplanationCard
            title={`Why "${details.severity.predicted_class}" severity?`}
            subtitle="Top drivers of the predicted severity class"
            features={details.severity.top_shap_features}
          />
        </>
      )}

      {!showSeverity && (
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-500">
          Severity forecast is only shown for cells predicted as hotspots.
        </div>
      )}
    </div>
  );
}