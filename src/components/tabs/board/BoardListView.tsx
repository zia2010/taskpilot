import { memo } from 'react';
import { CheckCircle2, Circle, Archive } from 'lucide-react';
import type { Task, TaskStatus } from '../../../types';
import { BOARD_STATUSES } from '../../../constants';
import { TaskService } from '../../../services/taskService';
import { DueBadge } from '../../common/DueBadge';
import { CadenceBadge } from '../../common/CadenceBadge';
import { QuadrantBadge } from '../../common/QuadrantBadge';

interface BoardListViewProps {
  tasks: Task[];
  nowMs: number;
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
}

export const BoardListView = memo(function BoardListView({
  tasks,
  nowMs,
  onSelectTask,
  onStatusChange,
}: BoardListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-[#222222] bg-[#141414] py-12 text-center text-sm text-[#A0A0A0]">
        No board tickets match your current filters.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#222222] bg-[#141414] divide-y divide-[#222222]">
      {tasks.map((task) => {
        const isDone = task.status === 'DONE';
        const isFinished = isDone || task.status === 'CANCELLED';
        return (
          <div
            key={task.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 hover:bg-[#1A1A1A]/70"
          >
            <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={() =>
                  onStatusChange(task.id, isDone ? 'TODO' : 'DONE')
                }
                aria-label={isDone ? 'Reopen task' : 'Complete task'}
                className="mt-0.5 md:mt-0 text-[#A0A0A0] hover:text-[#FF4D12] cursor-pointer shrink-0"
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#FF4D12]" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTask(task)}
                className="min-w-0 flex-1 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono-tech text-xs font-semibold text-[#FF4D12]">
                    {TaskService.formatTskKey(task.tskNumber)}
                  </span>
                  <span
                    className={`text-sm font-medium truncate ${
                      isFinished
                        ? 'line-through text-[#A0A0A0]/65'
                        : 'text-white hover:text-[#FFA489]'
                    }`}
                  >
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

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <DueBadge dueAt={task.dueAt} status={task.status} nowMs={nowMs} />
              <CadenceBadge cadence={task.cadence} />
              <QuadrantBadge quadrant={task.quadrant} compact />

              <select
                aria-label="Ticket status"
                value={task.status}
                onChange={(e) =>
                  onStatusChange(task.id, e.target.value as TaskStatus)
                }
                className="rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1 text-xs font-mono-tech text-white focus:border-[#FF4D12] focus:outline-none"
              >
                {BOARD_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onStatusChange(task.id, 'BACKLOG')}
                className="inline-flex items-center gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1 text-xs font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
              >
                <Archive className="w-3 h-3" />
                Backlog
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
});

