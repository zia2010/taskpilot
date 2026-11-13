import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationFooterProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const PaginationFooter = memo(function PaginationFooter({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationFooterProps) {
  const fromItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toItem = Math.min(totalCount, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#222222] bg-[#141414] px-4 py-3">
      <div className="text-xs font-mono-tech text-[#A0A0A0]">
        SHOWING <strong className="text-white">{fromItem}</strong>–
        <strong className="text-white">{toItem}</strong> OF{' '}
        <strong className="text-white">{totalCount}</strong>
      </div>

      <div className="flex items-center gap-2">
        <select
          aria-label="Items per page"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono-tech text-[#A0A0A0] focus:border-[#FF4D12] focus:outline-none"
        >
          {[8, 12, 24, 50].map((sz) => (
            <option key={sz} value={sz}>
              {sz} / page
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono-tech text-white disabled:opacity-35 hover:border-[#333333] cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <span className="px-2.5 text-xs font-mono-tech text-[#A0A0A0]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono-tech text-white disabled:opacity-35 hover:border-[#333333] cursor-pointer disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

