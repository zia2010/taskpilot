import { memo } from 'react';
import { Plus } from 'lucide-react';
import type { Task, BoardStatus, TaskStatus } from '../../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  statusId: BoardStatus;
  label: string;
  dot: string;
  tasks: Task[];
  isDropTarget: boolean;
  isCompact: boolean;
  nowMs: number;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onOpenCreate?: (status: 'TODO') => void;
}

export const KanbanColumn = memo(function KanbanColumn({
  statusId,
  label,
  dot,
  tasks,
  isDropTarget,
  isCompact,
  nowMs,
  onDragOver,
  onDragLeave,
  onDrop,
  onSelectTask,
  onStatusChange,
  onDragStart,
  onDragEnd,
  onOpenCreate,
}: KanbanColumnProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`rounded-xl border bg-[#141414] p-3 flex flex-col min-h-[460px] ${
        isDropTarget ? 'border-[#FF4D12]' : 'border-[#222222]'
      }`}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: dot }}
            className="w-2 h-2 rounded-full"
          />
          <span className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
            {label}
          </span>
          <span className="rounded bg-[#1A1A1A] border border-[#222222] px-1.5 py-0.5 text-[11px] font-mono-tech text-[#A0A0A0]">
            {tasks.length}
          </span>
        </div>

        {statusId === 'TODO' && onOpenCreate && (
          <button
            type="button"
            onClick={() => onOpenCreate('TODO')}
            title="Create ticket in To Do"
            aria-label="Create ticket in To Do"
            className="rounded-md border border-[#222222] bg-[#1A1A1A] p-1 text-[#A0A0A0] hover:border-[#FF4D12] hover:text-[#FF4D12] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2.5 flex-1">
        {tasks.length === 0 ? (
          <div className="h-28 rounded-lg border border-dashed border-[#222222] flex items-center justify-center text-xs font-mono-tech text-[#666666]">
            Drop ticket here
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              isCompact={isCompact}
              nowMs={nowMs}
              onSelectTask={onSelectTask}
              onStatusChange={onStatusChange}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
});

