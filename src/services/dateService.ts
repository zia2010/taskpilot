import type { DueCadence, TaskStatus, DueBadgeInfo } from '../types';

export const DateService = {
  getDefaultDueDate(cadence: DueCadence, baseDate: Date = new Date()): string {
    const d = new Date(baseDate);
    if (cadence === 'HOURLY') {
      d.setHours(d.getHours() + 1);
    } else if (cadence === 'DAILY') {
      d.setHours(23, 59, 0, 0);
    } else {
      d.setDate(d.getDate() + 7);
      d.setHours(23, 59, 0, 0);
    }
    return d.toISOString();
  },

  toDateTimeLocalValue(isoString: string | null | undefined): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number): string => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  },

  formatShortDateTime(isoString: string | null | undefined): string {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '—';
    const datePart = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${datePart} • ${timePart}`;
  },

  isSameLocalDay(isoA: string | null | undefined, isoB: string | null | undefined): boolean {
    if (!isoA || !isoB) return false;
    const a = new Date(isoA);
    const b = new Date(isoB);
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  },

  formatOverdueDuration(dueAtIso: string, nowMs: number): string {
    const diffMs = Math.max(0, nowMs - new Date(dueAtIso).getTime());
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h overdue`;
    if (hours > 0) return `${hours}h ${mins % 60}m overdue`;
    return `${Math.max(1, mins)}m overdue`;
  },

  formatDueBadge(dueAtIso: string, status: TaskStatus, nowMs: number): DueBadgeInfo | null {
    if (!dueAtIso) return null;
    const dueMs = new Date(dueAtIso).getTime();
    const diffMs = dueMs - nowMs;
    const isTerminal =
      status === 'DONE' || status === 'CANCELLED' || status === 'HISTORY';

    const dueDate = new Date(dueAtIso);
    const timeStr = dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = dueDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

    if (isTerminal) {
      return {
        text: `${dateStr} • ${timeStr}`,
        isOverdue: false,
        tone: 'muted',
      };
    }

    if (diffMs < 0) {
      return {
        text: DateService.formatOverdueDuration(dueAtIso, nowMs),
        isOverdue: true,
        tone: 'danger',
      };
    }

    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      return {
        text: `Due ${dateStr} (${days}d)`,
        isOverdue: false,
        tone: 'normal',
      };
    }
    if (hours >= 1) {
      return {
        text: `Due ${hours}h (${timeStr})`,
        isOverdue: false,
        tone: hours <= 2 ? 'warning' : 'normal',
      };
    }
    return {
      text: `Due in ${Math.max(1, mins)}m`,
      isOverdue: false,
      tone: 'warning',
    };
  },
};

