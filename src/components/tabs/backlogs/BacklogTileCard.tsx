import { memo } from 'react';
import { ArrowUpRight, MoreVertical, Copy } from 'lucide-react';
import type { Task } from '../../../types';
import { TaskService } from '../../../services/taskService';
import { CadenceBadge } from '../../common/CadenceBadge';
import { QuadrantBadge } from '../../common/QuadrantBadge';

interface BacklogTileCardProps {
  task: Task;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onSelectTask: (task: Task) => void;
  onPullToBoard: (task: Task) => void;
  onDuplicate: (task: Task) => void;
}

export const BacklogTileCard = memo(function BacklogTileCard({
  task,
  isMenuOpen,
  onToggleMenu,
  onSelectTask,
  onPullToBoard,
  onDuplicate,
}: BacklogTileCardProps) {
  return (
    <div className="relative rounded-xl border border-[#222222] bg-[#141414] p-4 flex flex-col justify-between hover:border-[#FF4D12]/45">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono-tech text-xs font-semibold text-[#FF4D12]">
            {TaskService.formatTskKey(task.tskNumber)}
          </span>
          <div className="flex items-center gap-1.5">
            <CadenceBadge cadence={task.cadence} />
            <QuadrantBadge quadrant={task.quadrant} compact />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectTask(task)}
          className="w-full text-left mt-3 cursor-pointer"
        >
          <h3 className="text-sm font-semibold text-white hover:text-[#FFA489]">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-[#A0A0A0] line-clamp-2 mt-1.5">
              {task.description}
            </p>
          )}
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-[#222222] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelectTask(task)}
          className="text-xs font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
        >
          Edit details
        </button>

        <div className="flex items-center gap-1.5">
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
              <div className="absolute right-0 bottom-9 z-20 w-36 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-1 shadow-xl">
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
    </div>
  );
});

