import { useState, memo } from 'react';
import {
  Kanban,
  CheckCircle2,
  Ban,
  Columns3,
  ListTodo,
} from 'lucide-react';
import type {
  Task,
  BoardStatus,
  TaskStatus,
  BoardViewMode,
  PriorityQuadrant,
  DueCadence,
  AppSettings,
} from '../../../types';
import { BOARD_STATUSES } from '../../../constants';
import { TaskFilterToolbar } from '../../common/TaskFilterToolbar';
import { PaginationFooter } from '../../common/PaginationFooter';
import { KanbanColumn } from './KanbanColumn';
import { BoardListView } from './BoardListView';

interface JiraBoardTabProps {
  tasks: Task[];
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  boardView: BoardViewMode;
  onBoardViewChange: (view: BoardViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterQuadrant: 'ALL' | PriorityQuadrant;
  onQuadrantChange: (q: 'ALL' | PriorityQuadrant) => void;
  filterCadence: 'ALL' | DueCadence;
  onCadenceChange: (c: 'ALL' | DueCadence) => void;
  settings: AppSettings;
  nowMs: number;
  doneCount: number;
  cancelledCount: number;
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
  onOpenCreate: (defaultStatus?: 'TODO' | 'BACKLOG') => void;
  onArchiveStatusToHistory: (statuses: BoardStatus | BoardStatus[]) => void;
}

export const JiraBoardTab = memo(function JiraBoardTab({
  tasks,
  totalCount,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  boardView,
  onBoardViewChange,
  searchQuery,
  onSearchChange,
  filterQuadrant,
  onQuadrantChange,
  filterCadence,
  onCadenceChange,
  settings,
  nowMs,
  doneCount,
  cancelledCount,
  onSelectTask,
  onStatusChange,
  onOpenCreate,
  onArchiveStatusToHistory,
}: JiraBoardTabProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<BoardStatus | null>(null);

  const isCompact = settings.density === 'compact';

  const handleDropOnColumn = (targetStatus: BoardStatus) => {
    if (!draggedTaskId) return;
    const draggedTask = tasks.find((t) => t.id === draggedTaskId);
    if (draggedTask && draggedTask.status !== targetStatus) {
      onStatusChange(draggedTaskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-[#FF4D12] mb-1">
            <Kanban className="w-3.5 h-3.5" />
            Active Sprint Execution
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Jira-Style Board</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={doneCount === 0}
            onClick={() => onArchiveStatusToHistory('DONE')}
            title="Move all Done tickets to History tab"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#222222] bg-[#141414] px-3 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:border-[#FF4D12]/50 hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4D12]" />
            Clear Done ({doneCount})
          </button>

          <button
            type="button"
            disabled={cancelledCount === 0}
            onClick={() => onArchiveStatusToHistory('CANCELLED')}
            title="Move all Cancelled tickets to History tab"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#222222] bg-[#141414] px-3 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:border-[#FFA489]/50 hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <Ban className="w-3.5 h-3.5 text-[#FFA489]" />
            Clear Cancelled ({cancelledCount})
          </button>

          <div className="inline-flex rounded-lg border border-[#222222] bg-[#141414] p-1">
            <button
              type="button"
              onClick={() => onBoardViewChange('kanban')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono-tech cursor-pointer ${
                boardView === 'kanban'
                  ? 'bg-[#FF4D12] text-white font-semibold'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => onBoardViewChange('list')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono-tech cursor-pointer ${
                boardView === 'list'
                  ? 'bg-[#FF4D12] text-white font-semibold'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              List View
            </button>
          </div>
        </div>
      </div>

      <TaskFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        filterCadence={filterCadence}
        onCadenceChange={onCadenceChange}
        filterQuadrant={filterQuadrant}
        onQuadrantChange={onQuadrantChange}
        totalCount={totalCount}
        searchPlaceholder="Search TSK-0000, title, or description..."
      />

      {boardView === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {BOARD_STATUSES.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            const isDropTarget = dragOverStatus === col.id;
            return (
              <KanbanColumn
                key={col.id}
                statusId={col.id}
                label={col.label}
                dot={col.dot}
                tasks={colTasks}
                isDropTarget={isDropTarget}
                isCompact={isCompact}
                nowMs={nowMs}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStatus(col.id);
                }}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={() => handleDropOnColumn(col.id)}
                onSelectTask={onSelectTask}
                onStatusChange={onStatusChange}
                onDragStart={setDraggedTaskId}
                onDragEnd={() => {
                  setDraggedTaskId(null);
                  setDragOverStatus(null);
                }}
                onOpenCreate={col.id === 'TODO' ? onOpenCreate : undefined}
              />
            );
          })}
        </div>
      ) : (
        <BoardListView
          tasks={tasks}
          nowMs={nowMs}
          onSelectTask={onSelectTask}
          onStatusChange={onStatusChange}
        />
      )}

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
});

