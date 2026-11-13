import { memo } from 'react';
import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import type { DueCadence, PriorityQuadrant } from '../../types';
import { CADENCES, QUADRANTS } from '../../constants';

interface TaskFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterCadence: 'ALL' | DueCadence;
  onCadenceChange: (val: 'ALL' | DueCadence) => void;
  filterQuadrant: 'ALL' | PriorityQuadrant;
  onQuadrantChange: (val: 'ALL' | PriorityQuadrant) => void;
  totalCount: number;
  searchPlaceholder: string;
  extraControls?: ReactNode;
}

export const TaskFilterToolbar = memo(function TaskFilterToolbar({
  searchQuery,
  onSearchChange,
  filterCadence,
  onCadenceChange,
  filterQuadrant,
  onQuadrantChange,
  totalCount,
  searchPlaceholder,
  extraControls = null,
}: TaskFilterToolbarProps) {
  const cadenceOptions: Array<'ALL' | DueCadence> = ['ALL', 'HOURLY', 'DAILY', 'WEEKLY'];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#222222] bg-[#141414] p-3 w-full min-w-0">
      {/* Top Row: Search Input + Any Extra Outcome Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-2.5 w-full min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-[#222222] bg-[#1A1A1A] pl-9 pr-8 py-2 text-xs text-white placeholder-[#666666] focus:border-[#FF4D12] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {extraControls && (
          <div className="shrink-0 min-w-0">
            {extraControls}
          </div>
        )}
      </div>

      {/* Filter Options: Cadences + Quadrants with flex-wrap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-[#222222]/60 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono-tech uppercase text-[#666666] mr-1 hidden sm:inline">
            Cadence:
          </span>
          {cadenceOptions.map((cad) => (
            <button
              key={cad}
              type="button"
              onClick={() =>
                onCadenceChange(filterCadence === cad && cad !== 'ALL' ? 'ALL' : cad)
              }
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-mono-tech border cursor-pointer whitespace-nowrap transition-colors ${
                filterCadence === cad
                  ? 'bg-[#FF4D12]/15 text-[#FF4D12] border-[#FF4D12]/45 font-semibold'
                  : 'bg-[#1A1A1A] text-[#A0A0A0] border-[#222222] hover:text-white'
              }`}
            >
              {cad === 'ALL' ? 'All Cadences' : CADENCES[cad].label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono-tech uppercase text-[#666666] mr-1 hidden sm:inline">
            Priority:
          </span>
          <button
            type="button"
            onClick={() => onQuadrantChange('ALL')}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-mono-tech border cursor-pointer whitespace-nowrap transition-colors ${
              filterQuadrant === 'ALL'
                ? 'bg-white text-[#1A1A1A] border-white font-semibold'
                : 'bg-[#1A1A1A] text-[#A0A0A0] border-[#222222] hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          {Object.values(QUADRANTS).map((q) => {
            const active = filterQuadrant === q.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onQuadrantChange(active ? 'ALL' : q.id)}
                style={
                  active
                    ? {
                        backgroundColor: q.badgeBg,
                        borderColor: q.badgeBorder,
                        color: q.badgeText,
                      }
                    : undefined
                }
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-mono-tech border cursor-pointer whitespace-nowrap transition-colors ${
                  active
                    ? 'font-semibold'
                    : 'bg-[#1A1A1A] text-[#A0A0A0] border-[#222222] hover:text-white'
                }`}
              >
                {q.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
