import { memo } from 'react';
import { CheckCircle2, Ban, RotateCcw, Archive, Trash2 } from 'lucide-react';
import type { Task } from '../../../types';
import { TaskService } from '../../../services/taskService';
import { DateService } from '../../../services/dateService';
import { CadenceBadge } from '../../common/CadenceBadge';
import { QuadrantBadge } from '../../common/QuadrantBadge';

interface HistoryRowProps {
  task: Task;
  onSelectTask: (task: Task) => void;
  onRestoreTask: (task: Task, targetStatus: 'TODO' | 'BACKLOG') => void;
  onDeletePermanent: (id: string) => void;
}

export const HistoryRow = memo(function HistoryRow({
  task,
  onSelectTask,
  onRestoreTask,
  onDeletePermanent,
}: HistoryRowProps) {
  const wasDone = task.archivedFrom === 'DONE';

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3.5 hover:bg-[#1A1A1A]/70 transition-colors">
      {/* Left: Status tag + Ticket details */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <span
          className={`mt-0.5 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono-tech font-semibold uppercase shrink-0 ${
            wasDone
              ? 'bg-[#FF4D12]/15 text-[#FF4D12] border-[#FF4D12]/40'
              : 'bg-[#FFA489]/12 text-[#FFA489] border-[#FFA489]/35'
          }`}
        >
          {wasDone ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <Ban className="w-3 h-3" />
          )}
          <span>{wasDone ? 'Done' : 'Cancelled'}</span>
        </span>

        <button
          type="button"
          onClick={() => onSelectTask(task)}
          className="min-w-0 flex-1 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono-tech text-xs font-semibold text-[#FF4D12] shrink-0">
              {TaskService.formatTskKey(task.tskNumber)}
            </span>
            <span className="text-sm font-medium text-white truncate group-hover:text-[#FFA489]">
              {task.title}
            </span>
          </div>
          {task.description && (
            <p className="text-xs text-[#A0A0A0] truncate mt-0.5">
              {task.description}
            </p>
          )}
        </button>
      </div>

      {/* Right: Metadata badges + Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-2.5 pt-2 sm:pt-0 border-t border-[#222222]/60 sm:border-t-0 shrink-0 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono-tech text-[#A0A0A0] whitespace-nowrap">
            Cleared {DateService.formatShortDateTime(task.archivedAt)}
          </span>
          <CadenceBadge cadence={task.cadence} />
          <QuadrantBadge quadrant={task.quadrant} compact />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onRestoreTask(task, 'TODO')}
            title="Restore back to Board (To Do)"
            className="inline-flex items-center gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono-tech text-white hover:border-[#FF4D12] hover:text-[#FF4D12] cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3 shrink-0" />
            <span>Restore to Board</span>
          </button>

          <button
            type="button"
            onClick={() => onRestoreTask(task, 'BACKLOG')}
            title="Restore to Backlog"
            className="inline-flex items-center gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer whitespace-nowrap"
          >
            <Archive className="w-3 h-3 shrink-0" />
            <span>Backlog</span>
          </button>

          <button
            type="button"
            onClick={() => onDeletePermanent(task.id)}
            title="Delete permanently"
            aria-label="Delete permanently"
            className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-1.5 text-[#A0A0A0] hover:border-[#FF4D12] hover:text-[#FF4D12] cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});
