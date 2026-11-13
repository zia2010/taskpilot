import { memo } from 'react';
import type { DashboardTelemetry, PriorityQuadrant } from '../../../types';
import { QUADRANTS } from '../../../constants';

interface EisenhowerRadarProps {
  telemetry: DashboardTelemetry;
  onJumpToBoard: (quadrant: PriorityQuadrant) => void;
}

export const EisenhowerRadar = memo(function EisenhowerRadar({
  telemetry,
  onJumpToBoard,
}: EisenhowerRadarProps) {
  return (
    <section className="lg:col-span-7 rounded-xl border border-[#222222] bg-[#141414] p-5">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#222222]">
        <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
          Eisenhower Matrix Radar
        </h2>
        <span className="text-[11px] font-mono-tech text-[#A0A0A0]">
          CLICK QUADRANT TO FILTER BOARD
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
        {Object.values(QUADRANTS).map((q) => {
          const Icon = q.icon;
          const activeCount = (telemetry.byQuadrant[q.id] || []).length;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onJumpToBoard(q.id)}
              className="group rounded-xl border border-[#222222] bg-[#1A1A1A] p-4 text-left hover:border-[#FF4D12]/50 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    backgroundColor: q.badgeBg,
                    borderColor: q.badgeBorder,
                    color: q.badgeText,
                  }}
                  className="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-mono-tech font-medium"
                >
                  <Icon className="w-3 h-3" />
                  {q.shortLabel}
                </span>
                <span className="font-display text-2xl font-bold text-white">
                  {activeCount}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-xs font-semibold text-white">{q.sublabel}</div>
                <p className="text-[11px] text-[#A0A0A0] mt-0.5 line-clamp-1">
                  {q.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
});

