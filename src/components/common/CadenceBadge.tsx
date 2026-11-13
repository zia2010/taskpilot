import { memo } from 'react';
import { Timer } from 'lucide-react';
import type { DueCadence } from '../../types';
import { CADENCES } from '../../constants';

interface CadenceBadgeProps {
  cadence: DueCadence;
}

export const CadenceBadge = memo(function CadenceBadge({ cadence }: CadenceBadgeProps) {
  const c = CADENCES[cadence] || CADENCES.DAILY;
  return (
    <span
      style={{
        backgroundColor: c.bg,
        borderColor: c.border,
        color: c.accent,
      }}
      className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono-tech font-medium uppercase tracking-wider whitespace-nowrap"
    >
      <Timer className="w-2.5 h-2.5 shrink-0" />
      <span>{c.short}</span>
    </span>
  );
});

