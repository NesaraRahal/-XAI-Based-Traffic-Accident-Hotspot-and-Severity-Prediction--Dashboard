import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { cellToBoundary } from "h3-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, Maximize2, SearchX } from "lucide-react";
import {
  hotspotColor, severityColor, NOT_HOTSPOT_COLOR, OUTCOMES, outcomeKey,
} from "../../utils/color";
import { pct } from "../../utils/format";
import { Spinner } from "../common/Loading";
import MapLegend from "./MapLegend";

const COLOMBO_CENTER = [6.9271, 79.8612];
const DEFAULT_ZOOM = 12;

const COLOR_MODES = [
  { id: "severity", label: "Severity", title: "Hotspots coloured by predicted severity; other cells green" },
  { id: "risk", label: "Risk", title: "Colour by hotspot probability" },
  { id: "outcome", label: "Accuracy", title: "Compare prediction with what was observed" },
];

function cellStyle(cell, mode) {
  if (mode === "severity") {
    return cell.hotspot_predicted
      ? { color: severityColor(cell.severity_predicted_class), fillOpacity: 0.7 }
      : { color: NOT_HOTSPOT_COLOR, fillOpacity: 0.35 };
  }
  if (mode === "outcome") {
    const key = outcomeKey(cell.hotspot_predicted, cell.observed_is_hotspot);
    return { color: OUTCOMES[key].color, fillOpacity: key === "correctNegative" ? 0.2 : 0.65 };
  }
  return {
    color: hotspotColor(cell.hotspot_probability, cell.hotspot_predicted),
    fillOpacity: cell.hotspot_predicted ? 0.65 : 0.5,
  };
}

export default function AccidentMap({
  cells, selectedCell, onSelectCell, focusRequest, fitKey, loading, empty,
}) {
  const [mode, setMode] = useState("severity");
  const [hotspotsOnly, setHotspotsOnly] = useState(false);
  const [resetTick, setResetTick] = useState(0);

  const polygons = useMemo(
    () => cells.map((c) => ({ ...c, boundary: cellToBoundary(c.h3_cell) })),
    [cells]
  );

  // Draw the selected cell last so its outline sits on top.
  const visible = useMemo(() => {
    const list = hotspotsOnly ? polygons.filter((p) => p.hotspot_predicted) : polygons;
    const sel = list.find((p) => p.h3_cell === selectedCell);
    return sel ? [...list.filter((p) => p !== sel), sel] : list;
  }, [polygons, hotspotsOnly, selectedCell]);

  const hotspotCount = useMemo(() => cells.filter((c) => c.hotspot_predicted).length, [cells]);

  return (
    <div className="relative h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-card bg-slate-200">
      <MapContainer
        center={COLOMBO_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        zoomControl
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapController
          polygons={polygons}
          fitKey={fitKey}
          focusRequest={focusRequest}
          resetTick={resetTick}
        />
        {visible.map((cell) => {
          const isSelected = selectedCell === cell.h3_cell;
          const { color, fillOpacity } = cellStyle(cell, mode);
          const base = {
            color: isSelected ? "#0f172a" : color,
            weight: isSelected ? 3 : 1,
            opacity: isSelected ? 1 : 0.9,
            fillColor: color,
            fillOpacity: isSelected ? Math.max(fillOpacity, 0.75) : fillOpacity,
          };
          return (
            <Polygon
              key={`${cell.h3_cell}-${mode}-${isSelected}`}
              positions={cell.boundary}
              pathOptions={base}
              eventHandlers={{
                click: () => onSelectCell(cell.h3_cell),
                mouseover: (e) => {
                  e.target.setStyle({ weight: isSelected ? 3 : 2.5, fillOpacity: Math.min(0.9, base.fillOpacity + 0.2), color: "#0f172a" });
                },
                mouseout: (e) => e.target.setStyle(base),
              }}
            >
              <Tooltip className="cell-tooltip" direction="top" offset={[0, -6]} opacity={1} sticky>
                <CellTooltip cell={cell} />
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>

      {/* Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2">
        <div className="flex rounded-lg bg-white/95 backdrop-blur border border-slate-200 shadow-md p-0.5" role="radiogroup" aria-label="Colour cells by">
          {COLOR_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              title={m.title}
              onClick={() => setMode(m.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === m.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHotspotsOnly((v) => !v)}
            aria-pressed={hotspotsOnly}
            className={`inline-flex items-center gap-1.5 rounded-lg border shadow-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              hotspotsOnly
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            title="Show only cells predicted as hotspots"
          >
            <Flame className="h-3.5 w-3.5" />
            Hotspots only
            <span className={`rounded px-1 tabular-nums ${hotspotsOnly ? "bg-white/20" : "bg-slate-100"}`}>{hotspotCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setResetTick((t) => t + 1)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white/95 shadow-md h-[30px] w-[30px] text-slate-600 hover:bg-slate-50"
            title="Zoom to all cells"
            aria-label="Zoom to all cells"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 rounded-full bg-white/95 border border-slate-200 shadow-md px-3 py-1.5 text-xs font-medium text-slate-700">
          <Spinner className="h-3.5 w-3.5" /> Updating map…
        </div>
      )}

      {empty && !loading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
          <div className="rounded-xl bg-white/95 border border-slate-200 shadow-md px-5 py-4 text-center">
            <SearchX className="h-6 w-6 mx-auto text-slate-400" />
            <div className="mt-1 text-sm font-medium text-slate-700">No cells for these filters</div>
            <div className="text-xs text-slate-500">Try another month or division.</div>
          </div>
        </div>
      )}

      {!selectedCell && !empty && !loading && cells.length > 0 && (
        <div className="hidden sm:block absolute bottom-3 right-3 z-[1000] rounded-lg bg-slate-900/85 text-white text-xs px-3 py-1.5 shadow-md pointer-events-none">
          Click a hexagon to see why it was predicted
        </div>
      )}

      <MapLegend mode={mode} />
    </div>
  );
}

function CellTooltip({ cell }) {
  const outcome = OUTCOMES[outcomeKey(cell.hotspot_predicted, cell.observed_is_hotspot)];
  return (
    <div className="px-3 py-2.5 min-w-[190px] text-slate-700">
      <div className="text-sm font-semibold text-slate-900">{cell.police_division || "Unknown division"}</div>
      <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        <span className="text-slate-500">Probability</span>
        <span className="font-semibold tabular-nums text-right">{pct(cell.hotspot_probability)}</span>
        <span className="text-slate-500">Prediction</span>
        <span className={`text-right font-medium ${cell.hotspot_predicted ? "text-red-600" : ""}`}>
          {cell.hotspot_predicted ? "Hotspot" : "Not hotspot"}
        </span>
        {cell.hotspot_predicted && (
          <>
            <span className="text-slate-500">Severity</span>
            <span className="text-right font-medium">{cell.severity_predicted_class}</span>
          </>
        )}
        <span className="text-slate-500">Observed</span>
        <span className="text-right tabular-nums">{cell.observed_accident_count} accidents</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: outcome.color }} />
        {outcome.label}
      </div>
    </div>
  );
}

function boundsOf(polygons) {
  const pts = [];
  for (const p of polygons) for (const pt of p.boundary) pts.push(pt);
  return pts.length ? L.latLngBounds(pts) : null;
}

function MapController({ polygons, fitKey, focusRequest, resetTick }) {
  const map = useMap();
  const lastFitKey = useRef(undefined);
  const lastFocus = useRef(null);
  const lastReset = useRef(resetTick);

  // Keep Leaflet in sync with layout changes (sidebar, window resize).
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);

  // Fit to data when the filter (not the month) changes, so month stepping keeps the view.
  useEffect(() => {
    if (!polygons.length || lastFitKey.current === fitKey) return;
    lastFitKey.current = fitKey;
    const b = boundsOf(polygons);
    if (b) map.fitBounds(b, { padding: [24, 24], maxZoom: 15 });
  }, [map, polygons, fitKey]);

  useEffect(() => {
    if (resetTick === lastReset.current) return;
    lastReset.current = resetTick;
    const b = boundsOf(polygons);
    if (b) map.flyToBounds(b, { padding: [24, 24], maxZoom: 15, duration: 0.6 });
  }, [map, polygons, resetTick]);

  // Fly to a cell when it's picked from the list (not when clicked on the map).
  useEffect(() => {
    if (!focusRequest || focusRequest === lastFocus.current) return;
    const p = polygons.find((c) => c.h3_cell === focusRequest.id);
    if (!p) return;
    lastFocus.current = focusRequest;
    map.flyTo([p.cell_lat, p.cell_lng], Math.max(map.getZoom(), 13.5), { duration: 0.6 });
  }, [map, polygons, focusRequest]);

  return null;
}
