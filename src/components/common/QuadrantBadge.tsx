import { memo } from 'react';
import type { PriorityQuadrant } from '../../types';
import { QUADRANTS } from '../../constants';

interface QuadrantBadgeProps {
  quadrant: PriorityQuadrant;
  compact?: boolean;
}

export const QuadrantBadge = memo(function QuadrantBadge({
  quadrant,
  compact = false,
}: QuadrantBadgeProps) {
  const q = QUADRANTS[quadrant] || QUADRANTS.NOT_URGENT_IMPORTANT;
  const Icon = q.icon;
  return (
    <span
      style={{
        backgroundColor: q.badgeBg,
        borderColor: q.badgeBorder,
        color: q.badgeText,
      }}
      className="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium font-mono-tech tracking-tight whitespace-nowrap"
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{compact ? q.label : q.shortLabel}</span>
    </span>
  );
});

