import { memo } from 'react';
import type { DashboardTelemetry, Task, PriorityQuadrant } from '../../../types';
import { TaskService } from '../../../services/taskService';
import { CadenceBadge } from '../../common/CadenceBadge';

interface BoardPipelineStatusProps {
  telemetry: DashboardTelemetry;
  onSelectTask: (task: Task) => void;
  onJumpToBoard: (quadrant: 'ALL' | PriorityQuadrant) => void;
}

export const BoardPipelineStatus = memo(function BoardPipelineStatus({
  telemetry,
  onSelectTask,
  onJumpToBoard,
}: BoardPipelineStatusProps) {
  return (
    <section className="lg:col-span-5 rounded-xl border border-[#222222] bg-[#141414] p-5 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
            Board Pipeline Status
          </h2>
          <span className="text-xs font-mono-tech text-[#A0A0A0]">
            {telemetry.total} ACTIVE
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-[#1A1A1A] overflow-hidden flex mt-4 border border-[#222222]">
          {telemetry.total > 0 && (
            <>
              <div
                style={{ width: `${(telemetry.doneCount / telemetry.total) * 100}%` }}
                className="bg-[#FF4D12]"
                title="Done"
              />
              <div
                style={{
                  width: `${(telemetry.inProgressCount / telemetry.total) * 100}%`,
                }}
                className="bg-[#FFA489]"
                title="In Progress"
              />
              <div
                style={{ width: `${(telemetry.todoCount / telemetry.total) * 100}%` }}
                className="bg-[#4A4A4A]"
                title="To Do"
              />
              <div
                style={{
                  width: `${(telemetry.cancelledCount / telemetry.total) * 100}%`,
                }}
                className="bg-[#282828]"
                title="Cancelled"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {[
            { label: 'To Do', count: telemetry.todoCount, dot: '#FFFFFF' },
            { label: 'In Progress', count: telemetry.inProgressCount, dot: '#FFA489' },
            { label: 'Done', count: telemetry.doneCount, dot: '#FF4D12' },
            { label: 'Cancelled', count: telemetry.cancelledCount, dot: '#A0A0A0' },
          ].map((st) => (
            <div
              key={st.label}
              className="flex items-center justify-between rounded-lg border border-[#222222] bg-[#1A1A1A] px-3 py-2"
            >
              <span className="inline-flex items-center gap-2 text-xs text-[#A0A0A0]">
                <span
                  style={{ backgroundColor: st.dot }}
                  className="w-2 h-2 rounded-full"
                />
                {st.label}
              </span>
              <span className="font-mono-tech text-xs font-semibold text-white">
                {st.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#222222]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono-tech uppercase text-[#FF4D12]">
            Q1 Do First • Focus
          </span>
          <button
            type="button"
            onClick={() => onJumpToBoard('URGENT_IMPORTANT')}
            className="text-[11px] font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
          >
            Filter Q1 →
          </button>
        </div>
        {telemetry.q1Active.length === 0 ? (
          <p className="text-xs text-[#A0A0A0]">No active Q1 fires right now.</p>
        ) : (
          <div className="space-y-1.5">
            {telemetry.q1Active.slice(0, 2).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTask(t)}
                className="w-full flex items-center justify-between gap-2 rounded-lg border border-[#222222] bg-[#1A1A1A] px-3 py-2 text-left hover:border-[#FF4D12]/45 cursor-pointer"
              >
                <span className="text-xs text-white truncate">
                  <span className="font-mono-tech text-[#FF4D12] mr-2">
                    {TaskService.formatTskKey(t.tskNumber)}
                  </span>
                  {t.title}
                </span>
                <CadenceBadge cadence={t.cadence} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

