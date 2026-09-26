import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListOrdered, PanelRight } from "lucide-react";
import Header from "./Header";
import StatsRow from "./StatsRow";
import CellDetailsPanel from "./CellDetailsPanel";
import AccidentMap from "../map/AccidentMap";
import HotspotRanking from "../sidebar/HotspotRanking";
import Loading from "../common/Loading";
import ErrorState from "../common/ErrorState";
import { errorMessage } from "../../utils/format";
import { useMonths } from "../../hooks/useMonths";
import { useDivisions } from "../../hooks/useDivisions";
import { useCells } from "../../hooks/useCells";
import { useUrlState } from "../../hooks/useUrlState";
import { API_BASE_URL } from "../../api/client";

const URL_KEYS = ["month", "division", "cell"];

export default function DashboardLayout() {
  const { months, loading: monthsLoading, error: monthsError, reload: reloadMonths } = useMonths();
  const divisions = useDivisions();
  const [url, setUrl] = useUrlState(URL_KEYS);
  const [tab, setTab] = useState(url.cell ? "details" : "ranking");
  const [focusRequest, setFocusRequest] = useState(null);
  const sidebarRef = useRef(null);

  // Month: URL value if valid, otherwise the first available month.
  const selectedMonth = months.includes(url.month) ? url.month : months[0] || null;
  const selectedDivision = url.division || null;
  const selectedCell = url.cell || null;

  const { cells, loading: cellsLoading, error: cellsError, fresh, reload: reloadCells } =
    useCells(selectedMonth, selectedDivision);

  // Drop the selection only if the cell doesn't exist in the newly loaded data,
  // so you can step through months while keeping the same cell open.
  const selectionMissing = fresh && selectedCell && !cells.some((c) => c.h3_cell === selectedCell);
  const effectiveCell = selectionMissing ? null : selectedCell;
  useEffect(() => {
    if (selectionMissing) setUrl("cell", null);
  }, [selectionMissing, setUrl]);

  const selectCell = useCallback((id, { fly = false } = {}) => {
    setUrl("cell", id);
    setTab("details");
    if (fly) setFocusRequest({ id });
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => sidebarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [setUrl]);

  const clearCell = useCallback(() => {
    setUrl("cell", null);
    setTab("ranking");
  }, [setUrl]);

  // Esc closes the details panel.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) clearCell();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearCell]);

  const fitKey = useMemo(() => selectedDivision || "__all__", [selectedDivision]);

  // Full-page states
  if (monthsError) {
    return (
      <Shell>
        <div className="max-w-lg mx-auto mt-24 px-4">
          <ErrorState
            title="Can't reach the prediction API"
            message={`Tried ${API_BASE_URL} (${errorMessage(monthsError)}). Make sure the FastAPI backend is running.`}
            onRetry={reloadMonths}
          />
        </div>
      </Shell>
    );
  }
  if (monthsLoading) {
    return (
      <Shell>
        <div className="flex-1 flex items-center justify-center"><Loading label="Loading available months…" /></div>
      </Shell>
    );
  }
  if (months.length === 0) {
    return (
      <Shell>
        <div className="max-w-lg mx-auto mt-24 px-4 text-center text-sm text-slate-600">
          The database has no predictions yet. Run the research repo's export step, then refresh.
        </div>
      </Shell>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col">
      <Header
        months={months}
        selectedMonth={selectedMonth}
        onMonthChange={(m) => setUrl("month", m)}
        divisions={divisions}
        selectedDivision={selectedDivision}
        onDivisionChange={(d) => { setUrl("division", d); }}
        canReset={Boolean(selectedDivision || effectiveCell)}
        onReset={() => { setUrl("division", null); clearCell(); }}
      />

      <main className="flex-1 min-h-0 flex flex-col gap-3 p-3 lg:p-4">
        {cellsError && (
          <ErrorState
            title="Couldn't load cells"
            message={errorMessage(cellsError)}
            onRetry={reloadCells}
          />
        )}

        <StatsRow cells={cells} loading={cellsLoading} />

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px] gap-3">
          <div className="h-[60vh] lg:h-auto min-h-0">
            <AccidentMap
              cells={cells}
              selectedCell={effectiveCell}
              onSelectCell={(id) => selectCell(id)}
              focusRequest={focusRequest}
              fitKey={fitKey}
              loading={cellsLoading}
              empty={fresh && cells.length === 0}
            />
          </div>

          <aside ref={sidebarRef} className="card flex flex-col min-h-[480px] lg:min-h-0 overflow-hidden scroll-mt-3">
            <div className="flex border-b border-slate-200 px-2" role="tablist">
              <TabButton active={tab === "ranking"} onClick={() => setTab("ranking")} icon={ListOrdered}>
                Top hotspots
              </TabButton>
              <TabButton active={tab === "details"} onClick={() => setTab("details")} icon={PanelRight}>
                Cell details
                {effectiveCell && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-sky-500" />}
              </TabButton>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scroll-thin bg-slate-50/60">
              {tab === "ranking" ? (
                <HotspotRanking
                  cells={cells}
                  loading={cellsLoading}
                  selectedCell={effectiveCell}
                  onSelect={(id) => selectCell(id, { fly: true })}
                />
              ) : (
                <CellDetailsPanel
                  h3Cell={effectiveCell}
                  yearMonth={selectedMonth}
                  months={months}
                  onClose={clearCell}
                  onZoom={() => effectiveCell && setFocusRequest({ id: effectiveCell })}
                  onPickMonth={(m) => setUrl("month", m)}
                />
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header months={[]} divisions={[]} onMonthChange={() => {}} onDivisionChange={() => {}} />
      {children}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors ${
        active ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
      {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-slate-900" />}
    </button>
  );
}
