import { memo } from 'react';
import { Clock, ClockAlert } from 'lucide-react';
import type { TaskStatus, DueBadgeInfo } from '../../types';
import { DateService } from '../../services/dateService';

interface DueBadgeProps {
  dueAt: string;
  status: TaskStatus;
  nowMs: number;
}

export const DueBadge = memo(function DueBadge({
  dueAt,
  status,
  nowMs,
}: DueBadgeProps) {
  const badge = DateService.formatDueBadge(dueAt, status, nowMs);
  if (!badge) return null;

  const toneStyles: Record<DueBadgeInfo['tone'], string> = {
    danger: 'bg-[#FF4D12]/15 text-[#FF4D12] border-[#FF4D12]/40',
    warning: 'bg-[#FFA489]/12 text-[#FFA489] border-[#FFA489]/35',
    normal: 'bg-[#1F1F1F] text-[#A0A0A0] border-[#2A2A2A]',
    muted: 'bg-[#171717] text-[#6E6E6E] border-[#222222]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono-tech whitespace-nowrap ${
        toneStyles[badge.tone]
      }`}
    >
      {badge.isOverdue ? (
        <ClockAlert className="w-2.5 h-2.5 shrink-0" />
      ) : (
        <Clock className="w-2.5 h-2.5 shrink-0" />
      )}
      <span>{badge.text}</span>
    </span>
  );
});

