import { useState } from "react";
import {
  Check, Copy, Database, History, LocateFixed, MapPin, MousePointerClick, ShieldAlert, X,
} from "lucide-react";
import { useCellDetails } from "../../hooks/useCellDetails";
import { Skeleton } from "../common/Loading";
import ErrorState from "../common/ErrorState";
import Section from "../common/Section";
import HotspotCard from "../hotspot/HotspotCard";
import CellTrend from "../hotspot/CellTrend";
import SeverityCard from "../severity/SeverityCard";
import ExplanationCard from "../xai/ExplanationCard";
import { errorMessage, formatDateTime, formatMonth } from "../../utils/format";

export default function CellDetailsPanel({ h3Cell, yearMonth, months, onClose, onZoom, onPickMonth }) {
  const { details, loading, error, reload } = useCellDetails(h3Cell, yearMonth);

  if (!h3Cell) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
          <MousePointerClick className="h-6 w-6 text-slate-400" />
        </div>
        <div className="mt-3 text-sm font-semibold text-slate-800">No cell selected</div>
        <p className="mt-1 text-sm text-slate-500 max-w-[240px]">
          Click a hexagon on the map, or pick one from the Top hotspots list, to see its prediction and the reasons behind it.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <CellHeader
        h3Cell={h3Cell}
        yearMonth={yearMonth}
        details={details}
        onClose={onClose}
        onZoom={onZoom}
      />

      {loading && !details && (
        <div className="space-y-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      )}

      {error && (
        <ErrorState
          title={error.response?.status === 404 ? "No prediction for this cell in this month" : "Couldn't load cell details"}
          message={error.response?.status === 404 ? `Try another month.` : errorMessage(error)}
          onRetry={error.response?.status === 404 ? undefined : reload}
        />
      )}

      {details && <DetailsBody details={details} months={months} onPickMonth={onPickMonth} />}
    </div>
  );
}

function CellHeader({ h3Cell, yearMonth, details, onClose, onZoom }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(h3Cell);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-start gap-2">
        <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-slate-900 leading-tight truncate">
            {details ? details.location.police_division || "Unknown division" : <Skeleton className="h-5 w-40" />}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {formatMonth(yearMonth)}
            {details && (
              <> · {details.location.cell_lat.toFixed(4)}, {details.location.cell_lng.toFixed(4)}</>
            )}
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 -m-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100" aria-label="Close details" title="Close (Esc)">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="min-w-0 flex-1 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-600 hover:bg-slate-100"
          title="Copy H3 cell id"
        >
          <span className="truncate">{h3Cell}</span>
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" /> : <Copy className="h-3.5 w-3.5 flex-shrink-0" />}
        </button>
        <button
          type="button"
          onClick={onZoom}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
        >
          <LocateFixed className="h-3.5 w-3.5" /> Zoom to
        </button>
      </div>
    </div>
  );
}

function DetailsBody({ details, months, onPickMonth }) {
  const showSeverity = details.hotspot.predicted;
  const meta = details.model_metadata;

  return (
    <div className="space-y-3 animate-fade-in">
      <HotspotCard hotspot={details.hotspot} observed={details.observed} historical={details.historical_context} />

      <ExplanationCard
        title="Why this hotspot prediction?"
        subtitle="SHAP contribution of each feature to the probability"
        features={details.hotspot.top_shap_features}
        upLabel="raises risk"
        downLabel="lowers risk"
      />

      {months?.length > 1 && (
        <Section title="Trend across months" subtitle="Predicted probability vs. observed accidents" icon={History}>
          <CellTrend
            h3Cell={details.h3_cell}
            months={months}
            currentMonth={details.year_month}
            threshold={details.hotspot.threshold}
            onPickMonth={onPickMonth}
          />
        </Section>
      )}

      {showSeverity ? (
        <>
          <Section title="Predicted severity" subtitle="Class probabilities vs. recent history" icon={ShieldAlert}>
            <SeverityCard severity={details.severity} historicalMix={details.historical_context?.severity_mix_180d} />
          </Section>
          <ExplanationCard
            title={`Why “${details.severity.predicted_class}” severity?`}
            subtitle="SHAP contribution towards the predicted class"
            features={details.severity.top_shap_features}
            upLabel={`towards ${details.severity.predicted_class}`}
            downLabel="away from it"
          />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-3 text-xs text-slate-500">
          Severity is only forecast for cells predicted as hotspots.
        </div>
      )}

      {meta && (
        <Section title="Model information" icon={Database} defaultOpen={false}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
            <dt className="text-slate-500">Hotspot model</dt><dd className="text-slate-800 font-medium">{meta.hotspot_model}</dd>
            <dt className="text-slate-500">Severity model</dt><dd className="text-slate-800 font-medium">{meta.severity_model}</dd>
            <dt className="text-slate-500">Evaluation window</dt><dd className="text-slate-800">{meta.evaluation_window}</dd>
            <dt className="text-slate-500">Decision threshold</dt><dd className="text-slate-800 tabular-nums">{details.hotspot.threshold}</dd>
            <dt className="text-slate-500">Generated</dt><dd className="text-slate-800">{formatDateTime(details.generated_at)}</dd>
          </dl>
        </Section>
      )}
    </div>
  );
}
