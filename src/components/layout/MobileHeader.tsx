import { memo } from 'react';
import { Plus } from 'lucide-react';
import type { NavTab, NavItemConfig } from '../../types';
import { TaskPilotLogo } from '../common/TaskPilotLogo';

interface MobileHeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  navItems: NavItemConfig[];
  onOpenCreate: (defaultStatus?: 'TODO' | 'BACKLOG') => void;
}

export const MobileHeader = memo(function MobileHeader({
  activeTab,
  onTabChange,
  navItems,
  onOpenCreate,
}: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 border-b border-[#222222] bg-[#141414] px-4 py-3 space-y-3 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <TaskPilotLogo size={32} className="shrink-0 shadow-md shadow-[#FF4D12]/20 rounded-lg" />
          <span className="font-display text-base font-bold text-white">TaskPilot</span>
        </div>

        <button
          type="button"
          onClick={() =>
            onOpenCreate(activeTab === 'backlogs' ? 'BACKLOG' : 'TODO')
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF4D12] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer hover:bg-[#e4420d] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{activeTab === 'backlogs' ? 'New Backlog' : 'New Task'}</span>
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] p-1 w-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`rounded-md py-1.5 px-0.5 text-[11px] font-mono-tech cursor-pointer truncate text-center transition-colors ${
              activeTab === item.id
                ? 'bg-[#FF4D12] text-white font-semibold'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            {item.shortLabel}
          </button>
        ))}
      </div>
    </header>
  );
});
