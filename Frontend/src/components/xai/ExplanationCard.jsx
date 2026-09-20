import ShapFeatureList from "./ShapFeatureList";

export default function ExplanationCard({ title, subtitle, features }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-slate-400 mb-3">{subtitle}</div>
      )}
      <ShapFeatureList features={features} />
    </div>
  );
}