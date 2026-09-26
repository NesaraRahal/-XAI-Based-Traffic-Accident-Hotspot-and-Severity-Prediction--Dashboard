import { ChevronLeft, ChevronRight, Flame, RotateCcw } from "lucide-react";
import { formatMonth } from "../../utils/format";

export default function Header({
  months, selectedMonth, onMonthChange,
  divisions, selectedDivision, onDivisionChange,
  onReset, canReset,
}) {
  const idx = months.indexOf(selectedMonth);
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < months.length - 1;

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <Flame className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base lg:text-lg font-semibold text-slate-900 leading-tight truncate">
            Colombo Accident Hotspot Prediction
          </h1>
          <p className="text-xs text-slate-500 truncate">
            Explainable spatiotemporal predictions · CMC area · 2023 test window
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 sm:gap-3">
        <div className="w-full sm:w-auto">
          <label htmlFor="month-select" className="block text-[11px] font-medium text-slate-500 mb-1">
            Month
          </label>
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <button
              type="button"
              className="icon-btn"
              onClick={() => hasPrev && onMonthChange(months[idx - 1])}
              disabled={!hasPrev}
              aria-label="Previous month"
              title="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <select
              id="month-select"
              value={selectedMonth || ""}
              onChange={(e) => onMonthChange(e.target.value)}
              className="select flex-1 sm:flex-none sm:w-44"
              disabled={months.length === 0}
            >
              {months.map((m) => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
            <button
              type="button"
              className="icon-btn"
              onClick={() => hasNext && onMonthChange(months[idx + 1])}
              disabled={!hasNext}
              aria-label="Next month"
              title="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 sm:flex-none">
          <label htmlFor="division-select" className="block text-[11px] font-medium text-slate-500 mb-1">
            Police division
          </label>
          <select
            id="division-select"
            value={selectedDivision || ""}
            onChange={(e) => onDivisionChange(e.target.value || null)}
            className="select w-full sm:w-48"
          >
            <option value="">All divisions</option>
            {divisions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {canReset && (
          <button
            type="button"
            onClick={onReset}
            className="h-9 inline-flex items-center gap-1.5 rounded-lg px-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            title="Clear division filter and selection"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>
    </header>
  );
}
