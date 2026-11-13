import { useState, memo } from 'react';
import { History, Trash2 } from 'lucide-react';
import type {
  Task,
  PriorityQuadrant,
  DueCadence,
} from '../../../types';
import { TaskFilterToolbar } from '../../common/TaskFilterToolbar';
import { PaginationFooter } from '../../common/PaginationFooter';
import { HistoryStatsStrip } from './HistoryStatsStrip';
import { HistoryRow } from './HistoryRow';

interface HistoryTabProps {
  tasks: Task[];
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterOutcome: 'ALL' | 'DONE' | 'CANCELLED';
  onOutcomeChange: (o: 'ALL' | 'DONE' | 'CANCELLED') => void;
  filterQuadrant: 'ALL' | PriorityQuadrant;
  onQuadrantChange: (q: 'ALL' | PriorityQuadrant) => void;
  filterCadence: 'ALL' | DueCadence;
  onCadenceChange: (c: 'ALL' | DueCadence) => void;
  archivedDoneCount: number;
  archivedCancelledCount: number;
  onSelectTask: (task: Task) => void;
  onRestoreTask: (task: Task, targetStatus: 'TODO' | 'BACKLOG') => void;
  onDeletePermanent: (id: string) => void;
  onPurgeHistory: () => void;
}

export const HistoryTab = memo(function HistoryTab({
  tasks,
  totalCount,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchQuery,
  onSearchChange,
  filterOutcome,
  onOutcomeChange,
  filterQuadrant,
  onQuadrantChange,
  filterCadence,
  onCadenceChange,
  archivedDoneCount,
  archivedCancelledCount,
  onSelectTask,
  onRestoreTask,
  onDeletePermanent,
  onPurgeHistory,
}: HistoryTabProps) {
  const [confirmPurge, setConfirmPurge] = useState(false);

  const totalArchived = archivedDoneCount + archivedCancelledCount;

  const outcomeOptions: Array<{ id: 'ALL' | 'DONE' | 'CANCELLED'; label: string }> = [
    { id: 'ALL', label: `All (${totalArchived})` },
    { id: 'DONE', label: `Cleared Done (${archivedDoneCount})` },
    { id: 'CANCELLED', label: `Cleared Cancelled (${archivedCancelledCount})` },
  ];

  const outcomeFilterControls = (
    <div className="flex flex-wrap items-center gap-1.5">
      {outcomeOptions.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() =>
            onOutcomeChange(filterOutcome === opt.id && opt.id !== 'ALL' ? 'ALL' : opt.id)
          }
          className={`rounded-lg px-2.5 py-1.5 text-[11px] font-mono-tech border cursor-pointer whitespace-nowrap transition-colors ${
            filterOutcome === opt.id
              ? 'bg-[#FF4D12]/15 text-[#FF4D12] border-[#FF4D12]/45 font-semibold'
              : 'bg-[#1A1A1A] text-[#A0A0A0] border-[#222222] hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5 min-w-0 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-[#FF4D12] mb-1">
            <History className="w-3.5 h-3.5" />
            Cleared Done & Cancelled Ledger
          </div>
          <h1 className="font-display text-2xl font-bold text-white">History</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!confirmPurge ? (
            <button
              type="button"
              disabled={totalArchived === 0}
              onClick={() => setConfirmPurge(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#222222] bg-[#141414] px-3 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:border-[#FF4D12]/50 hover:text-[#FF4D12] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge History ({totalArchived})</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onPurgeHistory();
                  setConfirmPurge(false);
                }}
                className="rounded-lg bg-[#FF4D12] px-3 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-[#e4420d] whitespace-nowrap transition-colors"
              >
                Confirm Permanent Purge
              </button>
              <button
                type="button"
                onClick={() => setConfirmPurge(false)}
                className="rounded-lg border border-[#222222] bg-[#141414] px-3 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer whitespace-nowrap transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <HistoryStatsStrip
        archivedDoneCount={archivedDoneCount}
        archivedCancelledCount={archivedCancelledCount}
      />

      <TaskFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        filterCadence={filterCadence}
        onCadenceChange={onCadenceChange}
        filterQuadrant={filterQuadrant}
        onQuadrantChange={onQuadrantChange}
        totalCount={totalCount}
        searchPlaceholder="Search history TSK-0000, title, or notes..."
        extraControls={outcomeFilterControls}
      />

      <div className="rounded-xl border border-[#222222] bg-[#141414] divide-y divide-[#222222] overflow-hidden min-w-0">
        {tasks.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <History className="w-8 h-8 text-[#A0A0A0] mx-auto mb-2.5" />
            <p className="text-sm font-medium text-white">No Archived History Yet</p>
            <p className="text-xs text-[#A0A0A0] mt-1">
              Use &ldquo;Clear Done&rdquo; or &ldquo;Clear Cancelled&rdquo; on the Jira Board to move finished tickets here.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <HistoryRow
              key={task.id}
              task={task}
              onSelectTask={onSelectTask}
              onRestoreTask={onRestoreTask}
              onDeletePermanent={onDeletePermanent}
            />
          ))
        )}
      </div>

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
});
