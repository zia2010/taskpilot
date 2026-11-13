import { memo } from 'react';
import { GripVertical, Archive, Ban } from 'lucide-react';
import type { Task, TaskStatus } from '../../../types';
import { TaskService } from '../../../services/taskService';
import { CadenceBadge } from '../../common/CadenceBadge';
import { QuadrantBadge } from '../../common/QuadrantBadge';
import { DueBadge } from '../../common/DueBadge';

interface KanbanCardProps {
  task: Task;
  isCompact: boolean;
  nowMs: number;
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

export const KanbanCard = memo(function KanbanCard({
  task,
  isCompact,
  nowMs,
  onSelectTask,
  onStatusChange,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  const isFinished = task.status === 'DONE' || task.status === 'CANCELLED';

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      className={`group rounded-lg border border-[#222222] bg-[#1A1A1A] ${
        isCompact ? 'p-2.5' : 'p-3.5'
      } hover:border-[#FF4D12]/45 cursor-grab active:cursor-grabbing`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-[#555555]" />
          <span className="font-mono-tech text-[11px] font-semibold text-[#FF4D12]">
            {TaskService.formatTskKey(task.tskNumber)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <CadenceBadge cadence={task.cadence} />
          <QuadrantBadge quadrant={task.quadrant} compact />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelectTask(task)}
        className="w-full text-left mt-2 cursor-pointer"
      >
        <h3
          className={`text-sm font-medium leading-snug ${
            isFinished
              ? 'line-through text-[#A0A0A0]/65'
              : 'text-white group-hover:text-[#FFA489]'
          }`}
        >
          {task.title}
        </h3>
        {!isCompact && task.description && (
          <p className="text-xs text-[#A0A0A0] line-clamp-2 mt-1">
            {task.description}
          </p>
        )}
      </button>

      <div className="mt-2.5">
        <DueBadge
          dueAt={task.dueAt}
          status={task.status}
          nowMs={nowMs}
        />
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#222222] flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => onStatusChange(task.id, 'BACKLOG')}
          title="Send back to Backlog"
          className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-mono-tech text-[#A0A0A0] hover:bg-[#222222] hover:text-white cursor-pointer"
        >
          <Archive className="w-3 h-3" />
          Backlog
        </button>

        <div className="flex items-center gap-1">
          {task.status !== 'TODO' && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, 'TODO')}
              aria-label="Move to To Do"
              className="rounded border border-[#262626] bg-[#141414] px-1.5 py-0.5 text-[10px] font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
            >
              ←
            </button>
          )}
          {task.status !== 'IN_PROGRESS' && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
              className="rounded border border-[#262626] bg-[#141414] px-1.5 py-0.5 text-[10px] font-mono-tech text-[#FFA489] hover:border-[#FFA489]/50 cursor-pointer"
            >
              WIP
            </button>
          )}
          {task.status !== 'DONE' && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, 'DONE')}
              className="rounded border border-[#262626] bg-[#141414] px-1.5 py-0.5 text-[10px] font-mono-tech text-[#FF4D12] hover:border-[#FF4D12]/50 cursor-pointer"
            >
              Done
            </button>
          )}
          {task.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, 'CANCELLED')}
              title="Cancel task"
              aria-label="Cancel task"
              className="rounded border border-[#262626] bg-[#141414] p-1 text-[#A0A0A0] hover:text-white cursor-pointer"
            >
              <Ban className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

