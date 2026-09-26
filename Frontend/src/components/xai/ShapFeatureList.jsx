import { useState } from "react";
import { SHAP_DOWN, SHAP_UP } from "../../utils/color";
import { formatFeatureValue } from "../../utils/format";

const DEFAULT_VISIBLE = 6;

/**
 * Diverging SHAP bar list: bars grow right (red) when a feature pushes the
 * prediction up, left (teal) when it pushes it down.
 */
export default function ShapFeatureList({ features, upLabel = "raises", downLabel = "lowers" }) {
  const [expanded, setExpanded] = useState(false);

  if (!features || features.length === 0) {
    return <div className="text-sm text-slate-400 italic">No explanation available.</div>;
  }

  const sorted = [...features].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));
  const maxAbs = Math.max(...sorted.map((f) => Math.abs(f.shap))) || 1;
  const list = expanded ? sorted : sorted.slice(0, DEFAULT_VISIBLE);

  return (
    <div>
      <div className="flex justify-between text-[10px] font-medium uppercase tracking-wide mb-2">
        <span style={{ color: SHAP_DOWN }}>← {downLabel}</span>
        <span style={{ color: SHAP_UP }}>{upLabel} →</span>
      </div>
      <ul className="space-y-2.5">
        {list.map((f, idx) => {
          const positive = f.shap >= 0;
          const half = (Math.abs(f.shap) / maxAbs) * 50;
          const value = formatFeatureValue(f.value);
          return (
            <li key={`${f.feature}-${idx}`} title={`${f.feature}${f.direction ? ` · ${f.direction}` : ""}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] text-slate-800 leading-snug min-w-0">
                  {f.label}
                  {value !== null && (
                    <span className="ml-1.5 rounded bg-slate-100 px-1 py-px font-mono text-[10px] text-slate-600 whitespace-nowrap">
                      = {value}
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs tabular-nums flex-shrink-0" style={{ color: positive ? SHAP_UP : SHAP_DOWN }}>
                  {positive ? "+" : "−"}{Math.abs(f.shap).toFixed(3)}
                </span>
              </div>
              <div className="relative mt-1 h-2 rounded-full bg-slate-100">
                <div className="absolute left-1/2 top-[-2px] bottom-[-2px] w-px bg-slate-300" />
                <div
                  className="absolute top-0 h-full rounded-full"
                  style={{
                    backgroundColor: positive ? SHAP_UP : SHAP_DOWN,
                    width: `${half}%`,
                    left: positive ? "50%" : `${50 - half}%`,
                    opacity: 0.85,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {sorted.length > DEFAULT_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 text-xs font-medium text-sky-700 hover:text-sky-900"
        >
          {expanded ? "Show fewer" : `Show all ${sorted.length} features`}
        </button>
      )}
    </div>
  );
}
