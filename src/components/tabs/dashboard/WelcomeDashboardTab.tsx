import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import type { DashboardTelemetry, Task, PriorityQuadrant } from '../../../types';
import { OverdueTasksList } from './OverdueTasksList';
import { WeeklyExecutionChart } from './WeeklyExecutionChart';
import { BoardPipelineStatus } from './BoardPipelineStatus';
import { EisenhowerRadar } from './EisenhowerRadar';

interface WelcomeDashboardTabProps {
  telemetry: DashboardTelemetry;
  nowMs: number;
  onSelectTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onJumpToBoard: (quadrant: 'ALL' | PriorityQuadrant) => void;
}

export const WelcomeDashboardTab = memo(function WelcomeDashboardTab({
  telemetry,
  nowMs,
  onSelectTask,
  onCompleteTask,
  onJumpToBoard,
}: WelcomeDashboardTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-[#FF4D12] mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D12]" />
            TaskPilot // Command Telemetry
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Welcome back Zia
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-1">
            Eisenhower Matrix prioritization, overdue radar, and 7-day execution momentum.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onJumpToBoard('ALL')}
          className="inline-flex items-center gap-2 rounded-lg border border-[#222222] bg-[#141414] px-3.5 py-2 text-xs font-mono-tech text-white hover:border-[#FF4D12]/50 cursor-pointer self-start sm:self-auto"
        >
          <span>Open Jira Board</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF4D12]" />
        </button>
      </div>

      {/* Primary Row: All Overdue + Weekly Execution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <OverdueTasksList
          overdueTasks={telemetry.overdueTasks}
          nowMs={nowMs}
          onSelectTask={onSelectTask}
          onCompleteTask={onCompleteTask}
        />
        <WeeklyExecutionChart telemetry={telemetry} />
      </div>

      {/* Secondary Row: Board Pipeline & Eisenhower Matrix Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <BoardPipelineStatus
          telemetry={telemetry}
          onSelectTask={onSelectTask}
          onJumpToBoard={onJumpToBoard}
        />
        <EisenhowerRadar
          telemetry={telemetry}
          onJumpToBoard={onJumpToBoard}
        />
      </div>
    </div>
  );
});

