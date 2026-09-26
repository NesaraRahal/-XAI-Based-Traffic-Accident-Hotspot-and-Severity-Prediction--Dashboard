import {
  Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useCellHistory } from "../../hooks/useCellHistory";
import { formatMonth, formatMonthShort, pct } from "../../utils/format";
import { Skeleton } from "../common/Loading";

export default function CellTrend({ h3Cell, months, currentMonth, threshold, onPickMonth }) {
  const { history, loading, error } = useCellHistory(h3Cell, months);

  if (!months || months.length < 2) return null;
  if (loading && !history) return <Skeleton className="h-40" />;
  if (error || !history) return <div className="text-xs text-slate-500">Trend unavailable.</div>;

  const data = history.map((h) => ({
    ...h,
    probPct: h.probability != null ? +(h.probability * 100).toFixed(1) : null,
    label: formatMonthShort(h.month),
  }));
  const current = data.find((d) => d.month === currentMonth);

  return (
    <div>
      <div className="h-44 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
            onClick={(e) => {
              const m = e?.activePayload?.[0]?.payload?.month ?? data[e?.activeTooltipIndex]?.month;
              if (m && onPickMonth) onPickMonth(m);
            }}
          >
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} interval={0} />
            <YAxis yAxisId="p" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} width={34} tickFormatter={(v) => `${v}%`} />
            <YAxis yAxisId="a" orientation="right" allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={24} />
            <Tooltip content={<TrendTooltip />} cursor={{ fill: "#f1f5f9" }} />
            {threshold != null && (
              <ReferenceLine yAxisId="p" y={threshold * 100} stroke="#0f172a" strokeDasharray="4 3" strokeWidth={1} />
            )}
            {current && (
              <ReferenceLine yAxisId="p" x={current.label} stroke="#0ea5e9" strokeWidth={2} strokeOpacity={0.35} />
            )}
            <Bar yAxisId="a" dataKey="accidents" fill="#cbd5e1" radius={[3, 3, 0, 0]} maxBarSize={14} />
            <Line
              yAxisId="p"
              type="monotone"
              dataKey="probPct"
              stroke="#dc2626"
              strokeWidth={2}
              connectNulls
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                if (cx == null || cy == null) return <g key={index} />;
                const isCur = payload.month === currentMonth;
                return (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={isCur ? 5 : 3}
                    fill={payload.predicted ? "#dc2626" : "#fff"}
                    stroke="#dc2626"
                    strokeWidth={isCur ? 2.5 : 1.5}
                  />
                );
              }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-red-600" /> Probability</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> Observed accidents</span>
        <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-slate-900" /> Threshold</span>
        <span className="text-slate-400">Click a month to jump to it</span>
      </div>
    </div>
  );
}

function TrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-white border border-slate-200 shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold text-slate-900">{formatMonth(d.month)}</div>
      <div className="mt-1 text-slate-600">Probability: <b className="tabular-nums">{pct(d.probability)}</b>{d.predicted ? " · hotspot" : ""}</div>
      <div className="text-slate-600">Observed accidents: <b className="tabular-nums">{d.accidents ?? "—"}</b></div>
    </div>
  );
}
