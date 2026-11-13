import { memo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { AppSettings, Task, BoardStatus } from '../../../types';
import { InterfacePreferences } from './InterfacePreferences';
import { DataManagement } from './DataManagement';
import { PrismaSchemaBlueprint } from './PrismaSchemaBlueprint';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
  allTasks: Task[];
  onArchiveStatusToHistory: (statuses: BoardStatus | BoardStatus[]) => void;
  onResetDemoData: () => void;
  syncStatus?: 'syncing' | 'live' | 'error';
}

export const SettingsTab = memo(function SettingsTab({
  settings,
  onUpdateSettings,
  allTasks,
  onArchiveStatusToHistory,
  onResetDemoData,
  syncStatus,
}: SettingsTabProps) {
  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="border-b border-[#222222] pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-[#FF4D12] mb-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Workspace & Schema Configuration
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
      </div>

      <InterfacePreferences
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />

      <DataManagement
        allTasks={allTasks}
        onArchiveStatusToHistory={onArchiveStatusToHistory}
        onResetDemoData={onResetDemoData}
        syncStatus={syncStatus}
      />

      <PrismaSchemaBlueprint />
    </div>
  );
});
