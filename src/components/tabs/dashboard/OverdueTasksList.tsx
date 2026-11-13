import { memo } from 'react';
import { ClockAlert, CheckCircle2, Check } from 'lucide-react';
import type { Task } from '../../../types';
import { QUADRANTS } from '../../../constants';
import { TaskService } from '../../../services/taskService';
import { DateService } from '../../../services/dateService';
import { CadenceBadge } from '../../common/CadenceBadge';

interface OverdueTasksListProps {
  overdueTasks: Task[];
  nowMs: number;
  onSelectTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
}

export const OverdueTasksList = memo(function OverdueTasksList({
  overdueTasks,
  nowMs,
  onSelectTask,
  onCompleteTask,
}: OverdueTasksListProps) {
  return (
    <section className="lg:col-span-5 rounded-xl border border-[#222222] bg-[#141414] p-5 flex flex-col">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <ClockAlert className="w-4 h-4 text-[#FF4D12]" />
          <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
            All Overdue
          </h2>
        </div>
        <span className="rounded-md bg-[#FF4D12]/15 border border-[#FF4D12]/35 px-2 py-0.5 text-[11px] font-mono-tech font-semibold text-[#FF4D12]">
          {overdueTasks.length} ITEMS
        </span>
      </div>

      {overdueTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <CheckCircle2 className="w-8 h-8 text-[#FFA489] mb-2.5" />
          <p className="text-sm font-medium text-white">Zero Overdue Tasks</p>
          <p className="text-xs text-[#A0A0A0] mt-1">
            All active hourly, daily, and weekly tasks are on schedule.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {overdueTasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-center justify-between gap-3 rounded-lg border border-[#222222] bg-[#1A1A1A] px-3.5 py-2.5 hover:border-[#FF4D12]/45"
            >
              <button
                type="button"
                onClick={() => onSelectTask(task)}
                className="min-w-0 flex-1 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[11px] font-mono-tech">
                  <span className="text-[#FF4D12] font-semibold">
                    {TaskService.formatTskKey(task.tskNumber)}
                  </span>
                  <CadenceBadge cadence={task.cadence} />
                  <span className="text-[#FFA489] truncate">
                    • {DateService.formatOverdueDuration(task.dueAt, nowMs)}
                  </span>
                </div>
                <p className="text-sm font-medium text-white truncate mt-1">
                  {task.title}
                </p>
                <p className="text-[11px] font-mono-tech text-[#A0A0A0] mt-0.5">
                  {QUADRANTS[task.quadrant]?.label}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onCompleteTask(task.id)}
                title="Mark Done"
                className="shrink-0 rounded-lg border border-[#222222] bg-[#141414] p-2 text-[#A0A0A0] hover:border-[#FF4D12] hover:text-[#FF4D12] cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
});

