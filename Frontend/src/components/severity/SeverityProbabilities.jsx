import { pct } from "../../utils/format";

const CLASS_ORDER = ["Fatal", "Serious", "Minor", "Damage-only"];
const CLASS_COLORS = {
  Fatal: "#dc2626",
  Serious: "#f59e0b",
  Minor: "#3b82f6",
  "Damage-only": "#94a3b8",
};

export default function SeverityProbabilities({ probabilities, predictedClass }) {
  const entries = CLASS_ORDER.map((cls) => ({
    cls,
    value: probabilities[cls] ?? 0,
  }));

  return (
    <div className="space-y-2">
      {entries.map(({ cls, value }) => {
        const isPredicted = cls === predictedClass;
        return (
          <div key={cls}>
            <div className="flex justify-between text-xs mb-1">
              <span className={isPredicted ? "font-semibold text-slate-800" : "text-slate-600"}>
                {cls} {isPredicted && <span className="text-slate-400 font-normal">(predicted)</span>}
              </span>
              <span className={isPredicted ? "font-semibold text-slate-800" : "text-slate-500"}>
                {pct(value)}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${value * 100}%`,
                  backgroundColor: CLASS_COLORS[cls],
                  opacity: isPredicted ? 1 : 0.55,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}