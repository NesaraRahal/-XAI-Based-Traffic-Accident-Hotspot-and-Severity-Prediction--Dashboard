import { pct } from "../../utils/format";
import { SEVERITY_ORDER, SEVERITY_COLORS } from "../../utils/color";

/** Predicted class probabilities, with the 180-day historical mix as a faint comparison marker. */
export default function SeverityProbabilities({ probabilities, predictedClass, historicalMix }) {
  return (
    <div className="space-y-2.5">
      {SEVERITY_ORDER.map((cls) => {
        const value = probabilities?.[cls] ?? 0;
        const hist = historicalMix?.[cls];
        const isPredicted = cls === predictedClass;
        return (
          <div key={cls}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`flex items-center gap-1.5 ${isPredicted ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[cls] }} />
                {cls}
                {isPredicted && <span className="rounded bg-slate-900 text-white px-1 py-px text-[9px] font-semibold uppercase tracking-wide">predicted</span>}
              </span>
              <span className="tabular-nums">
                <span className={isPredicted ? "font-semibold text-slate-900" : "text-slate-600"}>{pct(value)}</span>
                {hist !== undefined && <span className="ml-2 text-slate-400">hist. {pct(hist, 0)}</span>}
              </span>
            </div>
            <div className="relative h-2 bg-slate-100 rounded-full">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${value * 100}%`,
                  backgroundColor: SEVERITY_COLORS[cls],
                  opacity: isPredicted ? 1 : 0.5,
                }}
              />
              {hist !== undefined && (
                <div
                  className="absolute -top-0.5 h-3 w-0.5 bg-slate-700 rounded"
                  style={{ left: `calc(${hist * 100}% - 1px)` }}
                  title={`Historical share: ${pct(hist, 0)}`}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
