import { useState, memo } from 'react';
import { Archive, Plus, LayoutGrid, List } from 'lucide-react';
import type {
  Task,
  BacklogViewMode,
  PriorityQuadrant,
  DueCadence,
} from '../../../types';
import { TaskFilterToolbar } from '../../common/TaskFilterToolbar';
import { PaginationFooter } from '../../common/PaginationFooter';
import { BacklogTileCard } from './BacklogTileCard';
import { BacklogRow } from './BacklogRow';

interface BacklogsTabProps {
  tasks: Task[];
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  backlogView: BacklogViewMode;
  onBacklogViewChange: (view: BacklogViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterQuadrant: 'ALL' | PriorityQuadrant;
  onQuadrantChange: (q: 'ALL' | PriorityQuadrant) => void;
  filterCadence: 'ALL' | DueCadence;
  onCadenceChange: (c: 'ALL' | DueCadence) => void;
  onSelectTask: (task: Task) => void;
  onPullToBoard: (task: Task) => void;
  onOpenDuplicateModal: (task: Task) => void;
  onOpenCreateBacklog: () => void;
}

export const BacklogsTab = memo(function BacklogsTab({
  tasks,
  totalCount,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  backlogView,
  onBacklogViewChange,
  searchQuery,
  onSearchChange,
  filterQuadrant,
  onQuadrantChange,
  filterCadence,
  onCadenceChange,
  onSelectTask,
  onPullToBoard,
  onOpenDuplicateModal,
  onOpenCreateBacklog,
}: BacklogsTabProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleDuplicate = (task: Task) => {
    setOpenMenuId(null);
    onOpenDuplicateModal(task);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-[#FFA489] mb-1">
            <Archive className="w-3.5 h-3.5" />
            Staged Ideas & Upcoming Scope
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Backlogs</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenCreateBacklog}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF4D12] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#e4420d] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add to Backlog
          </button>

          <div className="inline-flex rounded-lg border border-[#222222] bg-[#141414] p-1">
            <button
              type="button"
              onClick={() => onBacklogViewChange('tile')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono-tech cursor-pointer ${
                backlogView === 'tile'
                  ? 'bg-[#FF4D12] text-white font-semibold'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Tile View
            </button>
            <button
              type="button"
              onClick={() => onBacklogViewChange('list')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono-tech cursor-pointer ${
                backlogView === 'list'
                  ? 'bg-[#FF4D12] text-white font-semibold'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
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
        searchPlaceholder="Search backlog TSK-0000, title, or notes..."
      />

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#222222] bg-[#141414] py-14 text-center">
          <Archive className="w-8 h-8 text-[#A0A0A0] mx-auto mb-2.5" />
          <p className="text-sm font-medium text-white">No Backlog Items Found</p>
          <p className="text-xs text-[#A0A0A0] mt-1">
            Stage upcoming tasks here and pull them to the Jira board when ready.
          </p>
        </div>
      ) : backlogView === 'tile' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <BacklogTileCard
              key={task.id}
              task={task}
              isMenuOpen={openMenuId === task.id}
              onToggleMenu={() =>
                setOpenMenuId(openMenuId === task.id ? null : task.id)
              }
              onSelectTask={onSelectTask}
              onPullToBoard={onPullToBoard}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#222222] bg-[#141414] divide-y divide-[#222222]">
          {tasks.map((task) => (
            <BacklogRow
              key={task.id}
              task={task}
              isMenuOpen={openMenuId === task.id}
              onToggleMenu={() =>
                setOpenMenuId(openMenuId === task.id ? null : task.id)
              }
              onSelectTask={onSelectTask}
              onPullToBoard={onPullToBoard}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
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

