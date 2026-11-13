import { memo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { AppSettings, CardDensity } from '../../../types';

interface InterfacePreferencesProps {
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
}

export const InterfacePreferences = memo(function InterfacePreferences({
  settings,
  onUpdateSettings,
}: InterfacePreferencesProps) {
  const densityModes: Array<{ id: CardDensity; label: string }> = [
    { id: 'comfortable', label: 'Comfortable' },
    { id: 'compact', label: 'Compact' },
  ];

  return (
    <section className="rounded-xl border border-[#222222] bg-[#141414] p-4 sm:p-5 space-y-4 min-w-0 w-full">
      <div className="flex items-center gap-2 pb-2 border-b border-[#222222]/80">
        <SlidersHorizontal className="w-4 h-4 text-[#FF4D12] shrink-0" />
        <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
          Interface & Board Preferences
        </h2>
      </div>

      <div className="space-y-4 divide-y divide-[#222222]/60">
        {/* Row 1: Board Card Density */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white">Board Card Density</div>
            <p className="text-xs text-[#A0A0A0] mt-0.5 leading-relaxed">
              Comfortable displays full descriptions; compact mode minimizes card height for faster triage.
            </p>
          </div>

          <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex rounded-lg border border-[#222222] bg-[#1A1A1A] p-1 shrink-0 self-start sm:self-auto">
            {densityModes.map((mode) => {
              const active = settings.density === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, density: mode.id })}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-mono-tech text-center cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#FF4D12] text-white font-semibold shadow-sm'
                      : 'text-[#A0A0A0] hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Auto-Sort Done & Cancelled to Bottom */}
        <div className="flex flex-row items-center justify-between gap-3 pt-4">
          <div
            className="min-w-0 flex-1 pr-2 cursor-pointer select-none"
            onClick={() =>
              onUpdateSettings({ ...settings, autoSortDone: !settings.autoSortDone })
            }
          >
            <div className="text-sm font-medium text-white">
              Auto-Sort Done & Cancelled to Bottom
            </div>
            <p className="text-xs text-[#A0A0A0] mt-0.5 leading-relaxed">
              Automatically pushes completed and cancelled tasks below active items on the board.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.autoSortDone}
            aria-label="Toggle auto-sort done and cancelled tasks to bottom"
            onClick={() =>
              onUpdateSettings({ ...settings, autoSortDone: !settings.autoSortDone })
            }
            className={`inline-flex items-center w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
              settings.autoSortDone ? 'bg-[#FF4D12]' : 'bg-[#2A2A2A]'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                settings.autoSortDone ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
});
