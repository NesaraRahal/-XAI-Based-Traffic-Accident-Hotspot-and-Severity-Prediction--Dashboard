import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { hotspotColor, severityColor, severityTextColor } from "../../utils/color";
import { pct } from "../../utils/format";
import { Skeleton } from "../common/Loading";

const PAGE = 50;

export default function HotspotRanking({ cells, loading, selectedCell, onSelect }) {
  const [query, setQuery] = useState("");
  const [onlyHotspots, setOnlyHotspots] = useState(true);
  const [limit, setLimit] = useState(PAGE);

  const hotspotTotal = useMemo(() => cells.filter((c) => c.hotspot_predicted).length, [cells]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cells
      .filter((c) => (onlyHotspots ? c.hotspot_predicted : true))
      .filter((c) =>
        !q ||
        (c.police_division || "").toLowerCase().includes(q) ||
        c.h3_cell.toLowerCase().includes(q)
      )
      .sort((a, b) => b.hotspot_probability - a.hotspot_probability);
  }, [cells, query, onlyHotspots]);

  const shown = rows.slice(0, limit);

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="p-3 space-y-2 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
            placeholder="Search division or H3 id…"
            className="w-full h-9 rounded-lg border border-slate-300 pl-8 pr-8 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
            aria-label="Search cells"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => { setOnlyHotspots(true); setLimit(PAGE); }}
              className={`px-2.5 py-1 rounded-md ${onlyHotspots ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              Hotspots ({hotspotTotal})
            </button>
            <button
              type="button"
              onClick={() => { setOnlyHotspots(false); setLimit(PAGE); }}
              className={`px-2.5 py-1 rounded-md ${!onlyHotspots ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              All cells ({cells.length})
            </button>
          </div>
          <span className="text-[11px] text-slate-400">by probability</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        {loading && cells.length === 0 ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            {query ? "No cells match your search." : onlyHotspots ? "No predicted hotspots for these filters." : "No cells for these filters."}
          </div>
        ) : (
          <ol className="divide-y divide-slate-100">
            {shown.map((c, i) => {
              const selected = c.h3_cell === selectedCell;
              return (
                <li key={c.h3_cell}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.h3_cell)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors focus:outline-none focus-visible:bg-sky-50 ${
                      selected ? "bg-sky-50" : "hover:bg-slate-50"
                    }`}
                    aria-current={selected ? "true" : undefined}
                  >
                    <span className="w-6 text-right text-xs font-medium text-slate-400 tabular-nums">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-800">
                          {c.police_division || "Unknown division"}
                        </span>
                        {c.hotspot_predicted && (
                          <span
                            className="flex-shrink-0 rounded px-1.5 py-px text-[10px] font-semibold"
                            style={{
                              backgroundColor: severityColor(c.severity_predicted_class),
                              color: severityTextColor(c.severity_predicted_class),
                            }}
                            title="Predicted severity"
                          >
                            {c.severity_predicted_class}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(2, c.hotspot_probability * 100)}%`,
                              backgroundColor: hotspotColor(c.hotspot_probability, c.hotspot_predicted),
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 tabular-nums whitespace-nowrap">
                          {c.observed_accident_count} obs.
                        </span>
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm font-semibold tabular-nums text-slate-800">
                      {pct(c.hotspot_probability, 0)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
        {rows.length > shown.length && (
          <div className="p-3">
            <button
              type="button"
              onClick={() => setLimit((l) => l + PAGE)}
              className="w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Show more ({rows.length - shown.length} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
