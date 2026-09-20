export function hotspotColor(probability, predicted) {
  if (predicted) return "#dc2626";
  if (probability >= 0.5) return "#f59e0b";
  if (probability >= 0.25) return "#facc15";
  if (probability >= 0.1) return "#a3e635";
  return "#22c55e";
}