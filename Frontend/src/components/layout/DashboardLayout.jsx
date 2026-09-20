import { useEffect, useState } from "react";
import Header from "./Header";
import StatsRow from "./StatsRow";
import CellDetailsPanel from "./CellDetailsPanel";
import AccidentMap from "../map/AccidentMap";
import Loading from "../common/Loading";
import { useMonths } from "../../hooks/useMonths";
import { useDivisions } from "../../hooks/useDivisions";
import { useCells } from "../../hooks/useCells";

export default function DashboardLayout() {
  const { months, loading: monthsLoading } = useMonths();
  const divisions = useDivisions();

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    if (!selectedMonth && months.length > 0) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  // Clear selection when filters change so we don't show details for a hidden cell.
  useEffect(() => {
    setSelectedCell(null);
  }, [selectedMonth, selectedDivision]);

  const { cells, loading: cellsLoading, error } = useCells(selectedMonth, selectedDivision);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        months={months}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        divisions={divisions}
        selectedDivision={selectedDivision}
        onDivisionChange={setSelectedDivision}
      />

      <main className="flex-1 p-6 space-y-6">
        {monthsLoading && <Loading label="Loading available months..." />}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
            Failed to load cells: {String(error.message || error)}
          </div>
        )}

        <StatsRow cells={cells} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {cellsLoading ? (
              <div className="h-[600px] flex items-center justify-center bg-white rounded-lg border border-slate-200">
                <Loading label="Loading map..." />
              </div>
            ) : (
              <AccidentMap
                cells={cells}
                selectedCell={selectedCell}
                onSelectCell={setSelectedCell}
              />
            )}
          </div>

          <div>
            <CellDetailsPanel h3Cell={selectedCell} yearMonth={selectedMonth} />
          </div>
        </div>
      </main>
    </div>
  );
}