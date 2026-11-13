import { memo } from 'react';
import { ArrowUpRight, MoreVertical, Copy } from 'lucide-react';
import type { Task } from '../../../types';
import { TaskService } from '../../../services/taskService';
import { CadenceBadge } from '../../common/CadenceBadge';
import { QuadrantBadge } from '../../common/QuadrantBadge';

interface BacklogRowProps {
  task: Task;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onSelectTask: (task: Task) => void;
  onPullToBoard: (task: Task) => void;
  onDuplicate: (task: Task) => void;
}

export const BacklogRow = memo(function BacklogRow({
  task,
  isMenuOpen,
  onToggleMenu,
  onSelectTask,
  onPullToBoard,
  onDuplicate,
}: BacklogRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 hover:bg-[#1A1A1A]/70">
      <button
        type="button"
        onClick={() => onSelectTask(task)}
        className="min-w-0 flex-1 text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono-tech text-xs font-semibold text-[#FF4D12]">
            {TaskService.formatTskKey(task.tskNumber)}
          </span>
          <span className="text-sm font-medium text-white truncate">
            {task.title}
          </span>
        </div>
        {task.description && (
          <p className="text-xs text-[#A0A0A0] truncate mt-0.5">
            {task.description}
          </p>
        )}
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <CadenceBadge cadence={task.cadence} />
        <QuadrantBadge quadrant={task.quadrant} compact />

        <button
          type="button"
          onClick={() => onPullToBoard(task)}
          className="inline-flex items-center gap-1 rounded-lg bg-[#FF4D12]/15 border border-[#FF4D12]/40 px-2.5 py-1.5 text-xs font-mono-tech font-semibold text-[#FF4D12] hover:bg-[#FF4D12] hover:text-white cursor-pointer"
        >
          Pull to Board
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label="More backlog actions"
            className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-1.5 text-[#A0A0A0] hover:text-white cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-9 z-20 w-36 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-1 shadow-xl">
              <button
                type="button"
                onClick={() => onDuplicate(task)}
                className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-mono-tech text-white hover:bg-[#FF4D12]/15 hover:text-[#FF4D12] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

