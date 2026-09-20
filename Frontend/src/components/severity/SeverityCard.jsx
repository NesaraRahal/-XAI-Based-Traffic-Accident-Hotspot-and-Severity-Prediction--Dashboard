import SeverityProbabilities from "./SeverityProbabilities";

export default function SeverityCard({ severity, historicalMix }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
        Predicted Severity
      </div>
      <div className="text-xs text-slate-400 mb-3">
        If an accident occurs in this cell
      </div>
      <SeverityProbabilities
        probabilities={severity.class_probabilities}
        predictedClass={severity.predicted_class}
      />
      {historicalMix && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 mb-2">
            Historical severity mix (last 180 days)
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {["Fatal", "Serious", "Minor", "Damage-only"].map((cls) => (
              <div key={cls}>
                <div className="text-xs text-slate-500">{cls}</div>
                <div className="text-sm font-medium text-slate-700">
                  {historicalMix[cls] !== undefined
                    ? `${(historicalMix[cls] * 100).toFixed(0)}%`
                    : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}