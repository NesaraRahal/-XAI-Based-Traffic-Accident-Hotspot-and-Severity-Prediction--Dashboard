// Single source of truth for every colour used on the map, legend and panels.

export const HOTSPOT_SCALE = [
  { color: "#dc2626", label: "Predicted hotspot" },
  { color: "#f97316", label: "High probability", range: "≥ 50%" },
  { color: "#facc15", label: "Medium", range: "25–50%" },
  { color: "#a3e635", label: "Low", range: "10–25%" },
  { color: "#22c55e", label: "Very low", range: "< 10%" },
];

export function hotspotColor(probability, predicted) {
  if (predicted) return HOTSPOT_SCALE[0].color;
  if (probability >= 0.5) return HOTSPOT_SCALE[1].color;
  if (probability >= 0.25) return HOTSPOT_SCALE[2].color;
  if (probability >= 0.1) return HOTSPOT_SCALE[3].color;
  return HOTSPOT_SCALE[4].color;
}

export const SEVERITY_ORDER = ["Fatal", "Serious", "Damage-only", "Minor"];

// Severity scale for predicted hotspots: darkest = worst.
export const SEVERITY_COLORS = {
  Fatal: "#7f1d1d",
  Serious: "#ef4444",
  "Damage-only": "#f97316",
  Minor: "#facc15",
};

// Cells that are not predicted hotspots.
export const NOT_HOTSPOT_COLOR = "#22c55e";

// Readable text colour on top of a severity colour (dark text on yellow).
export function severityTextColor(cls) {
  return cls === "Minor" ? "#422006" : "#ffffff";
}

export const NEUTRAL_CELL = "#cbd5e1";

export function severityColor(cls) {
  return SEVERITY_COLORS[cls] || NEUTRAL_CELL;
}

// Prediction vs. what actually happened that month.
export const OUTCOMES = {
  hit: { color: "#dc2626", label: "Hit", description: "Predicted and observed hotspot" },
  missed: { color: "#7c3aed", label: "Missed", description: "Observed hotspot, not predicted" },
  falseAlarm: { color: "#f59e0b", label: "False alarm", description: "Predicted, not observed" },
  correctNegative: { color: NEUTRAL_CELL, label: "Correct negative", description: "Neither predicted nor observed" },
};

export function outcomeKey(predicted, observed) {
  if (predicted && observed) return "hit";
  if (!predicted && observed) return "missed";
  if (predicted && !observed) return "falseAlarm";
  return "correctNegative";
}

export const SHAP_UP = "#dc2626";
export const SHAP_DOWN = "#0d9488";
