import { ChevronDown, Layers } from "lucide-react";
import { useState } from "react";
import { HOTSPOT_SCALE, SEVERITY_ORDER, SEVERITY_COLORS, NOT_HOTSPOT_COLOR, OUTCOMES } from "../../utils/color";

function itemsFor(mode) {
  if (mode === "severity") {
    return {
      title: "Hotspot severity",
      items: [
        ...SEVERITY_ORDER.map((c) => ({ color: SEVERITY_COLORS[c], label: `${c}` })),
        { color: NOT_HOTSPOT_COLOR, label: "Not a hotspot" },
      ],
    };
  }
  if (mode === "outcome") {
    return {
      title: "Prediction vs observed",
      items: Object.values(OUTCOMES).map((o) => ({ color: o.color, label: o.label, range: o.description })),
    };
  }
  return { title: "Hotspot probability", items: HOTSPOT_SCALE };
}

export default function MapLegend({ mode }) {
  const [open, setOpen] = useState(() => window.matchMedia("(min-width: 640px)").matches);
  const { title, items } = itemsFor(mode);

  return (
    <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/95 backdrop-blur shadow-md border border-slate-200 text-xs max-w-[230px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 font-semibold text-slate-700"
        aria-expanded={open}
      >
        <Layers className="h-3.5 w-3.5 text-slate-400" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "" : "rotate-180"}`} />
      </button>
      {open && (
        <div className="px-3 pb-2.5 space-y-1.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <span className="mt-0.5 inline-block w-3 h-3 rounded-sm border border-black/10 flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-700 leading-tight">
                {item.label}
                {item.range && <span className="block text-[10px] text-slate-400">{item.range}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
