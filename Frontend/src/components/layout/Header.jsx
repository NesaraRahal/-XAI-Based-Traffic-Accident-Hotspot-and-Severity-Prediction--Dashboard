import { formatMonth } from "../../utils/format";

export default function Header({
  months, selectedMonth, onMonthChange,
  divisions, selectedDivision, onDivisionChange,
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">
          Colombo Accident Hotspot Prediction Dashboard
        </h1>
        <p className="text-xs text-slate-500">
          Explainable spatiotemporal predictions | 2023 test window
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Month</label>
          <select
            value={selectedMonth || ""}
            onChange={(e) => onMonthChange(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            {months.map((m) => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Division</label>
          <select
            value={selectedDivision || ""}
            onChange={(e) => onDivisionChange(e.target.value || null)}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white"
          >
            <option value="">All divisions</option>
            {divisions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}