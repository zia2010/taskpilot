import { memo, useMemo } from 'react';
import { Database, Download, Archive, RotateCcw } from 'lucide-react';
import type { Task, BoardStatus } from '../../../types';

interface DataManagementProps {
  allTasks: Task[];
  onArchiveStatusToHistory: (statuses: BoardStatus | BoardStatus[]) => void;
  onResetDemoData: () => void;
}

export const DataManagement = memo(function DataManagement({
  allTasks,
  onArchiveStatusToHistory,
  onResetDemoData,
}: DataManagementProps) {
  const doneAndCancelledCount = useMemo(
    () =>
      allTasks.filter((t) => t.status === 'DONE' || t.status === 'CANCELLED')
        .length,
    [allTasks]
  );

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(allTasks, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskpilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-xl border border-[#222222] bg-[#141414] p-4 sm:p-5 space-y-4 min-w-0 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#222222]/80">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#FF4D12] shrink-0" />
          <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
            Workspace Data Management
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-mono-tech text-[#FFA489] self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFA489]" />
          <span>Local Storage Synced</span>
        </span>
      </div>

      <div className="space-y-4 divide-y divide-[#222222]/60">
        {/* Item 1: Export JSON Backup */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-[#FF4D12] shrink-0" />
              <span>Export JSON Backup</span>
            </div>
            <p className="text-xs text-[#A0A0A0] mt-0.5 leading-relaxed">
              Download complete serialized snapshot of {allTasks.length} tasks and metadata.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportJson}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF4D12] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#e4420d] cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Backup ({allTasks.length})</span>
          </button>
        </div>

        {/* Item 2: Move Done & Cancelled to History */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-[#FFA489] shrink-0" />
              <span>Archive Finished Tickets</span>
            </div>
            <p className="text-xs text-[#A0A0A0] mt-0.5 leading-relaxed">
              Transfer {doneAndCancelledCount} completed and cancelled tickets from Board to History ledger.
            </p>
          </div>
          <button
            type="button"
            disabled={doneAndCancelledCount === 0}
            onClick={() => onArchiveStatusToHistory(['DONE', 'CANCELLED'])}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#222222] bg-[#1A1A1A] px-3.5 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
          >
            <Archive className="w-3.5 h-3.5 text-[#FFA489]" />
            <span>Archive to History ({doneAndCancelledCount})</span>
          </button>
        </div>

        {/* Item 3: Reset Demo Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#A0A0A0] shrink-0" />
              <span>Reset Demo Dataset</span>
            </div>
            <p className="text-xs text-[#A0A0A0] mt-0.5 leading-relaxed">
              Replaces local workspace state with initial sample tasks and velocity telemetry.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetDemoData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#222222] bg-[#1A1A1A] px-3.5 py-2 text-xs font-mono-tech text-white hover:border-[#FF4D12]/50 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF4D12]" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </section>
  );
});
