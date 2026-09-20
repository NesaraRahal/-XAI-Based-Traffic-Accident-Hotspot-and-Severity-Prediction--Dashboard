export default function MapLegend() {
  const items = [
    { color: "#dc2626", label: "Predicted hotspot" },
    { color: "#f59e0b", label: "High probability (≥50%)" },
    { color: "#facc15", label: "Medium (25–50%)" },
    { color: "#a3e635", label: "Low (10–25%)" },
    { color: "#22c55e", label: "Very low (<10%)" },
  ];
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 rounded shadow-md border border-slate-200 p-3 text-xs">
      <div className="font-semibold text-slate-700 mb-2">Hotspot probability</div>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 mb-1 last:mb-0">
          <span className="inline-block w-3 h-3 rounded-sm border border-slate-400" style={{ backgroundColor: item.color }} />
          <span className="text-slate-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
}