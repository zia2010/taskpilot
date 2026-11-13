import { memo } from 'react';
import { Compass, Plus } from 'lucide-react';
import type { NavTab, NavItemConfig, DashboardTelemetry } from '../../types';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  navItems: NavItemConfig[];
  telemetry: DashboardTelemetry;
  syncStatus?: 'syncing' | 'live' | 'error';
  onOpenCreate: (defaultStatus?: 'TODO' | 'BACKLOG') => void;
}

export const Sidebar = memo(function Sidebar({
  activeTab,
  onTabChange,
  navItems,
  telemetry,
  syncStatus = 'live',
  onOpenCreate,
}: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-[#222222] bg-[#141414] p-4 justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-lg bg-[#FF4D12] flex items-center justify-center shadow-lg shadow-[#FF4D12]/20">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display text-base font-bold tracking-tight text-white">
              TaskPilot
            </div>
            <div className="text-[10px] font-mono-tech uppercase tracking-widest text-[#A0A0A0]">
              MATRIX // WORKSPACE
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onOpenCreate(activeTab === 'backlogs' ? 'BACKLOG' : 'TODO')
          }
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF4D12] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#e4420d] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'backlogs' ? 'New Backlog Item' : 'New Task'}
        </button>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium cursor-pointer ${
                  active
                    ? 'bg-[#1A1A1A] text-white border border-[#2A2A2A]'
                    : 'text-[#A0A0A0] hover:bg-[#1A1A1A]/50 hover:text-white border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${active ? 'text-[#FF4D12]' : 'text-[#A0A0A0]'}`}
                  />
                  {item.label}
                </span>
                {item.badge !== null && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono-tech font-semibold ${
                      item.badgeTone === 'danger'
                        ? 'bg-[#FF4D12]/20 text-[#FF4D12]'
                        : 'bg-[#222222] text-[#A0A0A0]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="rounded-lg border border-[#222222] bg-[#1A1A1A] px-3 py-2.5 flex items-center justify-between text-[11px] font-mono-tech">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'syncing'
                ? 'bg-[#FFA489] animate-pulse'
                : syncStatus === 'error'
                ? 'bg-[#EF4444]'
                : 'bg-[#10B981]'
            }`}
          />
          <span
            className={
              syncStatus === 'syncing'
                ? 'text-[#FFA489]'
                : syncStatus === 'error'
                ? 'text-[#EF4444]'
                : 'text-[#A0A0A0]'
            }
          >
            {syncStatus === 'syncing'
              ? 'SUPABASE // SYNCING'
              : syncStatus === 'error'
              ? 'SUPABASE // ERROR'
              : 'SUPABASE // LIVE'}
          </span>
        </span>
        <span className="text-white">
          {telemetry.doneCount}/{telemetry.total} DONE
        </span>
      </div>
    </aside>
  );
});
