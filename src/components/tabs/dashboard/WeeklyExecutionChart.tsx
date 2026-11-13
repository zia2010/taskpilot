import { useState, memo } from 'react';
import type { DashboardTelemetry, ChartPoint } from '../../../types';

interface WeeklyExecutionChartProps {
  telemetry: DashboardTelemetry;
}

export const WeeklyExecutionChart = memo(function WeeklyExecutionChart({
  telemetry,
}: WeeklyExecutionChartProps) {
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);

  const chartW = 560;
  const chartH = 150;
  const padX = 24;
  const padTop = 20;
  const padBottom = 24;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padTop - padBottom;

  const maxChartVal = Math.max(
    4,
    ...telemetry.weeklyDays.map((d) => Math.max(d.completedCount, d.plannedCount))
  );

  const chartPoints: ChartPoint[] = telemetry.weeklyDays.map((d, idx) => {
    const x = padX + (idx / 6) * plotW;
    const yDone = padTop + plotH - (d.completedCount / maxChartVal) * plotH;
    const yPlan = padTop + plotH - (d.plannedCount / maxChartVal) * plotH;
    return { ...d, idx, x, yDone, yPlan };
  });

  const buildSmoothPath = (pts: ChartPoint[], key: 'yDone' | 'yPlan'): string => {
    if (!pts.length) return '';
    return pts.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt[key]}`;
      const prev = arr[idx - 1];
      const cpX = (prev.x + pt.x) / 2;
      return `${acc} C ${cpX} ${prev[key]}, ${cpX} ${pt[key]}, ${pt.x} ${pt[key]}`;
    }, '');
  };

  const doneLinePath = buildSmoothPath(chartPoints, 'yDone');
  const plannedLinePath = buildSmoothPath(chartPoints, 'yPlan');
  const doneAreaPath = chartPoints.length
    ? `${doneLinePath} L ${chartPoints[chartPoints.length - 1].x} ${
        padTop + plotH
      } L ${chartPoints[0].x} ${padTop + plotH} Z`
    : '';

  const focusedDay =
    hoveredDayIdx !== null ? chartPoints[hoveredDayIdx] : chartPoints[chartPoints.length - 1];

  return (
    <section className="lg:col-span-7 rounded-xl border border-[#222222] bg-[#141414] p-5 flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#222222]">
          <div>
            <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
              Weekly Execution & Momentum
            </h2>
            <p className="text-xs text-[#A0A0A0] mt-0.5">
              {focusedDay
                ? `${focusedDay.isToday ? 'Today' : focusedDay.label} (${
                    focusedDay.dateNum
                  }): ${focusedDay.completedCount} done / ${focusedDay.plannedCount} planned`
                : '7-day completion trend'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono-tech">
            <span className="inline-flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-0.5 bg-[#FF4D12]" />
              Completed
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#A0A0A0]">
              <span className="w-2.5 h-0.5 border-t border-dashed border-[#FFA489]" />
              Planned
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-3">
            <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0]">
              Completion Rate
            </div>
            <div className="font-display text-xl font-bold text-white mt-0.5">
              {telemetry.weeklyCompletionPct}%
            </div>
            <div className="text-[11px] font-mono-tech text-[#FF4D12]">
              {telemetry.weeklyCompletedTotal} done
            </div>
          </div>

          <div className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-3">
            <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0]">
              On-Time SLA
            </div>
            <div className="font-display text-xl font-bold text-white mt-0.5">
              {telemetry.onTimeRatePct}%
            </div>
            <div className="text-[11px] font-mono-tech text-[#FFA489]">before due</div>
          </div>

          <div className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-3">
            <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0]">
              Daily Pace
            </div>
            <div className="font-display text-xl font-bold text-white mt-0.5">
              {telemetry.avgDailyCompleted}/d
            </div>
            <div className="text-[11px] font-mono-tech text-[#A0A0A0]">
              Peak: {telemetry.bestDay?.label} ({telemetry.bestDay?.completedCount})
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[#222222] bg-[#1A1A1A] p-3">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full h-36 overflow-visible"
            role="img"
            aria-label="7-day completion trend chart"
          >
            <defs>
              <linearGradient id="tpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4D12" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#FF4D12" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {[0, 0.5, 1].map((ratio, i) => {
              const y = padTop + plotH * ratio;
              return (
                <line
                  key={i}
                  x1={padX}
                  x2={chartW - padX}
                  y1={y}
                  y2={y}
                  stroke="#262626"
                  strokeDasharray="3 3"
                />
              );
            })}

            {doneAreaPath && <path d={doneAreaPath} fill="url(#tpAreaGrad)" />}
            {plannedLinePath && (
              <path
                d={plannedLinePath}
                fill="none"
                stroke="#FFA489"
                strokeOpacity="0.55"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
            )}
            {doneLinePath && (
              <path
                d={doneLinePath}
                fill="none"
                stroke="#FF4D12"
                strokeWidth="2.75"
                strokeLinecap="round"
              />
            )}

            {chartPoints.map((pt) => {
              const isFocused = focusedDay?.idx === pt.idx;
              return (
                <g
                  key={pt.idx}
                  onMouseEnter={() => setHoveredDayIdx(pt.idx)}
                  onMouseLeave={() => setHoveredDayIdx(null)}
                  onClick={() => setHoveredDayIdx(pt.idx)}
                  className="cursor-pointer"
                >
                  {isFocused && (
                    <line
                      x1={pt.x}
                      x2={pt.x}
                      y1={padTop}
                      y2={padTop + plotH}
                      stroke="#FF4D12"
                      strokeOpacity="0.35"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.yPlan}
                    r={isFocused ? 4 : 2.5}
                    fill="#1A1A1A"
                    stroke="#FFA489"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.yDone}
                    r={isFocused ? 5.5 : 3.5}
                    fill="#FF4D12"
                    stroke="#FFFFFF"
                    strokeWidth={isFocused ? '1.5' : '0'}
                  />
                  <text
                    x={pt.x}
                    y={chartH - 5}
                    textAnchor="middle"
                    fill={pt.isToday || isFocused ? '#FFFFFF' : '#A0A0A0'}
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {pt.label}
                  </text>
                  <rect
                    x={pt.x - 24}
                    y={0}
                    width={48}
                    height={chartH}
                    fill="transparent"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#222222]">
        {telemetry.cadenceBreakdown.map((cad) => (
          <div key={cad.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono-tech">
              <span className="text-[#A0A0A0]">{cad.label}</span>
              <span className="text-white">
                {cad.done}/{cad.total}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#222222] overflow-hidden">
              <div
                style={{ width: `${cad.pct}%`, backgroundColor: cad.accent }}
                className="h-full rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

