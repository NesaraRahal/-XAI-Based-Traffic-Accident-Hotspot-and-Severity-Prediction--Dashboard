import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet";
import { cellToBoundary } from "h3-js";
import { useMemo } from "react";
import { hotspotColor } from "../../utils/color";
import MapLegend from "./MapLegend";

const COLOMBO_CENTER = [6.9271, 79.8612];
const DEFAULT_ZOOM = 12;

export default function AccidentMap({ cells, selectedCell, onSelectCell }) {
  const polygons = useMemo(
    () =>
      cells.map((c) => {
        // h3-js returns [lat, lng] pairs by default, which is what react-leaflet wants.
        const boundary = cellToBoundary(c.h3_cell);
        return { ...c, boundary };
      }),
    [cells]
  );

  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer center={COLOMBO_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polygons.map((cell) => {
          const isSelected = selectedCell === cell.h3_cell;
          const color = hotspotColor(cell.hotspot_probability, cell.hotspot_predicted);
          return (
            <Polygon
              key={cell.h3_cell}
              positions={cell.boundary}
              pathOptions={{
                color: isSelected ? "#0f172a" : color,
                weight: isSelected ? 3 : 1,
                fillColor: color,
                fillOpacity: 0.55,
              }}
              eventHandlers={{ click: () => onSelectCell(cell.h3_cell) }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                <div className="text-xs">
                  <div className="font-semibold">{cell.police_division || "Unknown division"}</div>
                  <div>Hotspot: {cell.hotspot_predicted ? "YES" : "no"}</div>
                  <div>Probability: {(cell.hotspot_probability * 100).toFixed(1)}%</div>
                  <div>Predicted severity: {cell.severity_predicted_class}</div>
                </div>
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>
      <MapLegend />
    </div>
  );
}