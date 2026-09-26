export function formatMonth(ym) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString("en-GB", { month: "long", year: "numeric" });
}

export function formatMonthShort(ym) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString("en-GB", { month: "short" });
}

export function pct(x, digits = 1) {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(digits)}%`;
}

export function num(x) {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  return Number(x).toLocaleString("en-GB");
}

export function formatFeatureValue(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") {
    if (Number.isInteger(v)) return v.toLocaleString("en-GB");
    return Math.abs(v) < 1 ? v.toFixed(3) : v.toFixed(2);
  }
  return String(v);
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export function errorMessage(err) {
  if (!err) return "";
  if (err.response) {
    const detail = err.response.data?.detail;
    return `${err.response.status}${detail ? ` · ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : ""}`;
  }
  return err.message || String(err);
}
