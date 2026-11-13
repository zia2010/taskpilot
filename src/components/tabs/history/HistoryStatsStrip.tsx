import { memo } from 'react';
import { History, CheckCircle2, Ban } from 'lucide-react';

interface HistoryStatsStripProps {
  archivedDoneCount: number;
  archivedCancelledCount: number;
}

export const HistoryStatsStrip = memo(function HistoryStatsStrip({
  archivedDoneCount,
  archivedCancelledCount,
}: HistoryStatsStripProps) {
  const totalArchived = archivedDoneCount + archivedCancelledCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-xl border border-[#222222] bg-[#141414] p-3.5 sm:p-4 flex items-center justify-between min-w-0">
        <div className="min-w-0">
          <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0] truncate">
            Total Archived
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5">
            {totalArchived}
          </div>
        </div>
        <History className="w-5 h-5 text-[#A0A0A0] shrink-0 ml-2" />
      </div>

      <div className="rounded-xl border border-[#222222] bg-[#141414] p-3.5 sm:p-4 flex items-center justify-between min-w-0">
        <div className="min-w-0">
          <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0] truncate">
            Cleared Done
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-[#FF4D12] mt-0.5">
            {archivedDoneCount}
          </div>
        </div>
        <CheckCircle2 className="w-5 h-5 text-[#FF4D12] shrink-0 ml-2" />
      </div>

      <div className="rounded-xl border border-[#222222] bg-[#141414] p-3.5 sm:p-4 flex items-center justify-between min-w-0">
        <div className="min-w-0">
          <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0] truncate">
            Cleared Cancelled
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-[#FFA489] mt-0.5">
            {archivedCancelledCount}
          </div>
        </div>
        <Ban className="w-5 h-5 text-[#FFA489] shrink-0 ml-2" />
      </div>
    </div>
  );
});
