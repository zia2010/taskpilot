import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import {
  LayoutDashboard,
  Kanban,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  CalendarClock,
  Forward,
  Trash2,
  X,
  GripVertical,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ListTodo,
  Columns3,
  ClockAlert,
  Ban,
  Timer,
  Archive,
  ArrowUpRight,
  LayoutGrid,
  List,
  MoreVertical,
  Compass,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react';

// ============================================================================
// 1. THEME & TYPOGRAPHY SYSTEM
// ============================================================================

const THEME_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

  :root {
    --background: #1A1A1A;
    --foreground: #FFFFFF;
    --primary: #FF4D12;
    --secondary: #FFA489;
    --muted: #A0A0A0;
    --border: #222222;
    --chart-revenue: #FF4D12;
    --chart-expenses: #FFA489;
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .font-display {
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: -0.025em;
  }

  .font-mono-tech {
    font-family: 'JetBrains Mono', monospace;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #141414;
  }
  ::-webkit-scrollbar-thumb {
    background: #2C2C2C;
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #FF4D12;
  }
`;

// ============================================================================
// 2. DOMAIN CONSTANTS & METADATA
// ============================================================================

const QUADRANTS = {
  URGENT_IMPORTANT: {
    id: 'URGENT_IMPORTANT',
    shortLabel: 'Q1 • Do First',
    label: 'Do First',
    sublabel: 'Urgent & Important',
    description: 'Immediate focus, critical deadlines & active fires',
    weight: 1,
    urgent: true,
    important: true,
    icon: Flame,
    badgeBg: 'rgba(255, 77, 18, 0.14)',
    badgeBorder: 'rgba(255, 77, 18, 0.42)',
    badgeText: '#FF4D12',
    dotColor: '#FF4D12',
  },
  NOT_URGENT_IMPORTANT: {
    id: 'NOT_URGENT_IMPORTANT',
    shortLabel: 'Q2 • Schedule',
    label: 'Schedule',
    sublabel: 'Not Urgent & Important',
    description: 'Deep work, architecture & strategic milestones',
    weight: 2,
    urgent: false,
    important: true,
    icon: CalendarClock,
    badgeBg: 'rgba(255, 164, 137, 0.12)',
    badgeBorder: 'rgba(255, 164, 137, 0.35)',
    badgeText: '#FFA489',
    dotColor: '#FFA489',
  },
  URGENT_NOT_IMPORTANT: {
    id: 'URGENT_NOT_IMPORTANT',
    shortLabel: 'Q3 • Delegate',
    label: 'Delegate',
    sublabel: 'Urgent & Not Important',
    description: 'Quick operational pings, reviews & routine admin',
    weight: 3,
    urgent: true,
    important: false,
    icon: Forward,
    badgeBg: 'rgba(255, 255, 255, 0.06)',
    badgeBorder: 'rgba(255, 255, 255, 0.18)',
    badgeText: '#E5E5E5',
    dotColor: '#FFFFFF',
  },
  NOT_URGENT_NOT_IMPORTANT: {
    id: 'NOT_URGENT_NOT_IMPORTANT',
    shortLabel: 'Q4 • Eliminate',
    label: 'Eliminate',
    sublabel: 'Not Urgent & Not Important',
    description: 'Low-leverage backlog ideas & optional polish',
    weight: 4,
    urgent: false,
    important: false,
    icon: Trash2,
    badgeBg: 'rgba(160, 160, 160, 0.08)',
    badgeBorder: 'rgba(160, 160, 160, 0.22)',
    badgeText: '#A0A0A0',
    dotColor: '#A0A0A0',
  },
};

const CADENCES = {
  HOURLY: {
    id: 'HOURLY',
    label: 'Hourly',
    short: '1H',
    accent: '#FF4D12',
    bg: 'rgba(255, 77, 18, 0.12)',
    border: 'rgba(255, 77, 18, 0.35)',
  },
  DAILY: {
    id: 'DAILY',
    label: 'Daily',
    short: '24H',
    accent: '#FFA489',
    bg: 'rgba(255, 164, 137, 0.10)',
    border: 'rgba(255, 164, 137, 0.30)',
  },
  WEEKLY: {
    id: 'WEEKLY',
    label: 'Weekly',
    short: '7D',
    accent: '#D4D4D4',
    bg: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.16)',
  },
};

const BOARD_STATUSES = [
  { id: 'TODO', label: 'To Do', dot: '#FFFFFF', accent: '#FFFFFF' },
  { id: 'IN_PROGRESS', label: 'In Progress', dot: '#FFA489', accent: '#FFA489' },
  { id: 'DONE', label: 'Done', dot: '#FF4D12', accent: '#FF4D12' },
  { id: 'CANCELLED', label: 'Cancelled', dot: '#A0A0A0', accent: '#A0A0A0' },
];

const ALL_STATUSES = [
  { id: 'BACKLOG', label: 'Backlog' },
  ...BOARD_STATUSES.map(({ id, label }) => ({ id, label })),
  { id: 'HISTORY', label: 'History' },
];

const CREATE_ALLOWED_STATUSES = [
  { id: 'TODO', label: 'To Do' },
  { id: 'BACKLOG', label: 'Backlog' },
];

const TASKS_STORAGE_KEY = 'taskpilot_tasks_mock_v1';
const SETTINGS_STORAGE_KEY = 'taskpilot_settings_v2';

const DEFAULT_SETTINGS = {
  density: 'comfortable',
  autoSortDone: true,
  pageSize: 12,
};

// ============================================================================
// 3. PURE DOMAIN SERVICES
// ============================================================================

const DateService = {
  getDefaultDueDate(cadence, baseDate = new Date()) {
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

  toDateTimeLocalValue(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  },

  formatShortDateTime(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '—';
    const datePart = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${datePart} • ${timePart}`;
  },

  isSameLocalDay(isoA, isoB) {
    if (!isoA || !isoB) return false;
    const a = new Date(isoA);
    const b = new Date(isoB);
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  },

  formatOverdueDuration(dueAtIso, nowMs) {
    const diffMs = Math.max(0, nowMs - new Date(dueAtIso).getTime());
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h overdue`;
    if (hours > 0) return `${hours}h ${mins % 60}m overdue`;
    return `${Math.max(1, mins)}m overdue`;
  },

  formatDueBadge(dueAtIso, status, nowMs) {
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

const TaskService = {
  generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  normalizeTskNumber(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '');
    if (!digits) return null;
    const num = Number.parseInt(digits, 10);
    if (Number.isNaN(num) || num < 0 || num > 9999) return null;
    return String(num).padStart(4, '0');
  },

  formatTskKey(tskNumber) {
    return `TSK-${String(tskNumber || '0000').padStart(4, '0')}`;
  },

  suggestNextTskNumber(usedNumbers = []) {
    const used = new Set(usedNumbers.map((n) => String(n).padStart(4, '0')));
    for (let n = 1; n <= 9999; n += 1) {
      const candidate = String(n).padStart(4, '0');
      if (!used.has(candidate)) return candidate;
    }
    return '0000';
  },

  getQuadrantFromFlags(urgent, important) {
    if (urgent && important) return 'URGENT_IMPORTANT';
    if (!urgent && important) return 'NOT_URGENT_IMPORTANT';
    if (urgent && !important) return 'URGENT_NOT_IMPORTANT';
    return 'NOT_URGENT_NOT_IMPORTANT';
  },

  isTaskOverdue(task, nowMs) {
    if (
      task.status === 'DONE' ||
      task.status === 'CANCELLED' ||
      task.status === 'BACKLOG' ||
      task.status === 'HISTORY'
    ) {
      return false;
    }
    return new Date(task.dueAt).getTime() < nowMs;
  },

  sortTasks(list, autoSortDone = true) {
    return [...list].sort((a, b) => {
      if (autoSortDone) {
        const rank = (s) => (s === 'CANCELLED' ? 2 : s === 'DONE' ? 1 : 0);
        if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
      }
      const qA = QUADRANTS[a.quadrant]?.weight ?? 9;
      const qB = QUADRANTS[b.quadrant]?.weight ?? 9;
      if (qA !== qB) return qA - qB;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });
  },
};

function createSeedTasks() {
  const now = new Date();
  const offsetHours = (h) => new Date(now.getTime() + h * 3600000).toISOString();
  const offsetDays = (d, hour = 18) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + d);
    dt.setHours(hour, 0, 0, 0);
    return dt.toISOString();
  };

  return [
    {
      id: '11111111-1111-4111-8111-111111111101',
      tskNumber: '0101',
      title: 'Fix production checkout webhook retry loop',
      description:
        'Stripe webhook endpoint returns 504 under burst traffic. Add idempotency keys and exponential backoff.',
      quadrant: 'URGENT_IMPORTANT',
      status: 'IN_PROGRESS',
      cadence: 'HOURLY',
      dueAt: offsetHours(-2),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetHours(-5),
    },
    {
      id: '11111111-1111-4111-8111-111111111102',
      tskNumber: '0102',
      title: 'Rotate Vercel production environment secrets',
      description: 'Update environment variables across preview and production branches.',
      quadrant: 'URGENT_IMPORTANT',
      status: 'TODO',
      cadence: 'DAILY',
      dueAt: offsetHours(-5),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetDays(-1, 10),
    },
    {
      id: '11111111-1111-4111-8111-111111111103',
      tskNumber: '0103',
      title: 'Verify hourly telemetry ingestion queue',
      description: 'Check Redis consumer lag on the metrics worker before peak window.',
      quadrant: 'URGENT_IMPORTANT',
      status: 'TODO',
      cadence: 'HOURLY',
      dueAt: offsetHours(1),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetHours(-1),
    },
    {
      id: '11111111-1111-4111-8111-111111111104',
      tskNumber: '0104',
      title: 'Architect multi-region read replica failover',
      description: 'Draft latency benchmarks and connection pooling plan for Q3 expansion.',
      quadrant: 'NOT_URGENT_IMPORTANT',
      status: 'TODO',
      cadence: 'WEEKLY',
      dueAt: offsetDays(4, 18),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetDays(-2, 11),
    },
    {
      id: '11111111-1111-4111-8111-111111111105',
      tskNumber: '0105',
      title: 'Design Eisenhower Matrix keyboard shortcuts',
      description: 'Allow pressing 1-4 while hovering a ticket card to reassign priority quadrant.',
      quadrant: 'NOT_URGENT_IMPORTANT',
      status: 'IN_PROGRESS',
      cadence: 'WEEKLY',
      dueAt: offsetDays(2, 17),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetDays(-3, 14),
    },
    {
      id: '11111111-1111-4111-8111-111111111106',
      tskNumber: '0106',
      title: 'Approve vendor SSL certificate renewal invoice',
      description: 'Forward signed PDF to finance portal before end of day.',
      quadrant: 'URGENT_NOT_IMPORTANT',
      status: 'TODO',
      cadence: 'DAILY',
      dueAt: offsetHours(-1),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetHours(-4),
    },
    {
      id: '11111111-1111-4111-8111-111111111107',
      tskNumber: '0107',
      title: 'Audit unused feature flags in staging',
      description: 'Remove legacy experiment toggles from the flag config.',
      quadrant: 'NOT_URGENT_NOT_IMPORTANT',
      status: 'TODO',
      cadence: 'WEEKLY',
      dueAt: offsetDays(6, 20),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetDays(-4, 9),
    },
    {
      id: '11111111-1111-4111-8111-111111111108',
      tskNumber: '0108',
      title: 'Configure Tailwind dark theme tokens',
      description: 'Set up obsidian background and electric orange palette.',
      quadrant: 'NOT_URGENT_IMPORTANT',
      status: 'DONE',
      cadence: 'DAILY',
      dueAt: offsetHours(3),
      completedAt: offsetHours(-1),
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetHours(-6),
    },
    {
      id: '11111111-1111-4111-8111-111111111109',
      tskNumber: '0109',
      title: 'Fix mobile drawer z-index overlap',
      description: 'Ensure sticky header stays above board columns on iOS Safari.',
      quadrant: 'URGENT_IMPORTANT',
      status: 'DONE',
      cadence: 'HOURLY',
      dueAt: offsetHours(-1),
      completedAt: offsetHours(-2),
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetHours(-4),
    },
    {
      id: '11111111-1111-4111-8111-111111111110',
      tskNumber: '0110',
      title: 'Deploy Postgres database schema',
      description: 'Push tasks table with indexes for production workspace.',
      quadrant: 'URGENT_IMPORTANT',
      status: 'DONE',
      cadence: 'DAILY',
      dueAt: offsetDays(-1, 20),
      completedAt: offsetDays(-1, 16),
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetDays(-2, 10),
    },
    {
      id: '11111111-1111-4111-8111-111111111111',
      tskNumber: '0111',
      title: 'Legacy XML export compatibility shim',
      description: 'Deprecate XML feed after client migrated to JSON webhook.',
      quadrant: 'NOT_URGENT_NOT_IMPORTANT',
      status: 'CANCELLED',
      cadence: 'WEEKLY',
      dueAt: offsetDays(-1, 18),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetDays(-5, 11),
    },
    {
      id: '11111111-1111-4111-8111-111111111112',
      tskNumber: '0201',
      title: 'Build AI natural-language task parser',
      description: 'Allow typing "Fix bug tomorrow 5pm !urgent" to auto-populate fields.',
      quadrant: 'NOT_URGENT_IMPORTANT',
      status: 'BACKLOG',
      cadence: 'WEEKLY',
      dueAt: offsetDays(7, 23),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetDays(-2, 13),
    },
    {
      id: '11111111-1111-4111-8111-111111111113',
      tskNumber: '0202',
      title: 'Implement recurring task templates',
      description: 'Auto-spawn daily standup and weekly review checklists.',
      quadrant: 'NOT_URGENT_IMPORTANT',
      status: 'BACKLOG',
      cadence: 'DAILY',
      dueAt: offsetDays(1, 23),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetDays(-1, 16),
    },
    {
      id: '11111111-1111-4111-8111-111111111114',
      tskNumber: '0203',
      title: 'Explore WebPush notifications for hourly tasks',
      description: 'Send desktop alert 10 minutes before an hourly deadline expires.',
      quadrant: 'URGENT_NOT_IMPORTANT',
      status: 'BACKLOG',
      cadence: 'HOURLY',
      dueAt: offsetHours(1),
      completedAt: null,
      archivedFrom: null,
      archivedAt: null,
      createdAt: offsetDays(-3, 10),
    },
    {
      id: '11111111-1111-4111-8111-111111111115',
      tskNumber: '0098',
      title: 'Initial TaskPilot wireframe & color tokens',
      description: 'Validated dark obsidian #1A1A1A and electric orange #FF4D12 contrast ratios.',
      quadrant: 'NOT_URGENT_IMPORTANT',
      status: 'HISTORY',
      cadence: 'DAILY',
      dueAt: offsetDays(-3, 19),
      completedAt: offsetDays(-3, 17),
      archivedFrom: 'DONE',
      archivedAt: offsetDays(-3, 18),
      createdAt: offsetDays(-4, 11),
    },
    {
      id: '11111111-1111-4111-8111-111111111116',
      tskNumber: '0099',
      title: 'Prototype multi-collection folder sidebar',
      description: 'Dropped in favor of streamlined flat board + Eisenhower Matrix filters.',
      quadrant: 'NOT_URGENT_NOT_IMPORTANT',
      status: 'HISTORY',
      cadence: 'WEEKLY',
      dueAt: offsetDays(-2, 18),
      completedAt: null,
      archivedFrom: 'CANCELLED',
      archivedAt: offsetDays(-2, 14),
      createdAt: offsetDays(-6, 10),
    },
  ];
}

// ============================================================================
// 4. CUSTOM HOOKS (Persistent Storage, Debounced Search & Telemetry)
// ============================================================================

function usePersistentStorage(key, initialFactory) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof initialFactory === 'function' && !Array.isArray(parsed)
          ? { ...initialFactory(), ...parsed }
          : parsed;
      }
    } catch {
      // Fallback to initialFactory
    }
    return typeof initialFactory === 'function' ? initialFactory() : initialFactory;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [key, state]);

  return [state, setState];
}

function useDebouncedValue(value, delayMs = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function useDashboardTelemetry(tasks, nowMs) {
  return useMemo(() => {
    const boardTasks = tasks.filter(
      (t) => t.status !== 'BACKLOG' && t.status !== 'HISTORY'
    );
    const backlogTasks = tasks.filter((t) => t.status === 'BACKLOG');
    const historyTasks = tasks.filter((t) => t.status === 'HISTORY');
    const total = boardTasks.length;

    const todo = boardTasks.filter((t) => t.status === 'TODO');
    const inProgress = boardTasks.filter((t) => t.status === 'IN_PROGRESS');
    const done = boardTasks.filter((t) => t.status === 'DONE');
    const cancelled = boardTasks.filter((t) => t.status === 'CANCELLED');

    const allCompletedTasks = tasks.filter(
      (t) =>
        t.status === 'DONE' || (t.status === 'HISTORY' && t.archivedFrom === 'DONE')
    );

    const overdueTasks = boardTasks
      .filter((t) => TaskService.isTaskOverdue(t, nowMs))
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

    const byQuadrant = Object.keys(QUADRANTS).reduce((acc, qKey) => {
      acc[qKey] = boardTasks.filter(
        (t) => t.quadrant === qKey && (t.status === 'TODO' || t.status === 'IN_PROGRESS')
      );
      return acc;
    }, {});

    const weeklyDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(nowMs);
      day.setDate(day.getDate() - (6 - i));
      const isoDay = day.toISOString();
      const label = day.toLocaleDateString([], { weekday: 'short' });
      const dateNum = day.getDate();

      const completedCount = allCompletedTasks.filter((t) =>
        DateService.isSameLocalDay(t.completedAt, isoDay)
      ).length;
      const plannedCount = [...boardTasks, ...historyTasks].filter((t) =>
        DateService.isSameLocalDay(t.dueAt, isoDay)
      ).length;

      return {
        label,
        dateNum,
        completedCount,
        plannedCount,
        isToday: i === 6,
      };
    });

    const weeklyCompletedTotal = weeklyDays.reduce((sum, d) => sum + d.completedCount, 0);
    const weeklyPlannedTotal = weeklyDays.reduce((sum, d) => sum + d.plannedCount, 0);
    const weeklyCompletionPct =
      weeklyPlannedTotal > 0
        ? Math.min(100, Math.round((weeklyCompletedTotal / weeklyPlannedTotal) * 100))
        : allCompletedTasks.length > 0
        ? 100
        : 0;

    const onTimeDone = allCompletedTasks.filter(
      (t) => t.completedAt && new Date(t.completedAt).getTime() <= new Date(t.dueAt).getTime()
    ).length;
    const onTimeRatePct =
      allCompletedTasks.length > 0
        ? Math.round((onTimeDone / allCompletedTasks.length) * 100)
        : 100;

    const bestDay = weeklyDays.reduce(
      (best, cur) => (cur.completedCount > best.completedCount ? cur : best),
      weeklyDays[0]
    );
    const avgDailyCompleted = (weeklyCompletedTotal / 7).toFixed(1);

    const cadenceBreakdown = ['HOURLY', 'DAILY', 'WEEKLY'].map((cadKey) => {
      const subset = boardTasks.filter((t) => t.cadence === cadKey && t.status !== 'CANCELLED');
      const doneCount = subset.filter((t) => t.status === 'DONE').length;
      const pct = subset.length > 0 ? Math.round((doneCount / subset.length) * 100) : 0;
      return {
        ...CADENCES[cadKey],
        total: subset.length,
        done: doneCount,
        pct,
      };
    });

    return {
      total,
      backlogCount: backlogTasks.length,
      historyCount: historyTasks.length,
      todoCount: todo.length,
      inProgressCount: inProgress.length,
      doneCount: done.length,
      cancelledCount: cancelled.length,
      overdueTasks,
      byQuadrant,
      q1Active: byQuadrant.URGENT_IMPORTANT || [],
      weeklyDays,
      weeklyCompletedTotal,
      weeklyPlannedTotal,
      weeklyCompletionPct,
      onTimeRatePct,
      bestDay,
      avgDailyCompleted,
      cadenceBreakdown,
    };
  }, [tasks, nowMs]);
}

// ============================================================================
// 5. ATOMIC UI COMPONENTS
// ============================================================================

const QuadrantBadge = memo(function QuadrantBadge({ quadrant, compact = false }) {
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

const CadenceBadge = memo(function CadenceBadge({ cadence }) {
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

const DueBadge = memo(function DueBadge({ dueAt, status, nowMs }) {
  const badge = DateService.formatDueBadge(dueAt, status, nowMs);
  if (!badge) return null;

  const toneStyles = {
    danger: 'bg-[#FF4D12]/15 text-[#FF4D12] border-[#FF4D12]/40',
    warning: 'bg-[#FFA489]/12 text-[#FFA489] border-[#FFA489]/35',
    normal: 'bg-[#1F1F1F] text-[#A0A0A0] border-[#2A2A2A]',
    muted: 'bg-[#171717] text-[#6E6E6E] border-[#222222]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-mono-tech whitespace-nowrap ${
        toneStyles[badge.tone]
      }`}
    >
      {badge.isOverdue ? (
        <ClockAlert className="w-2.5 h-2.5 shrink-0" />
      ) : (
        <Clock className="w-2.5 h-2.5 shrink-0" />
      )}
      <span>{badge.text}</span>
    </span>
  );
});

const PaginationFooter = memo(function PaginationFooter({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const fromItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toItem = Math.min(totalCount, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#222222] bg-[#141414] px-4 py-3">
      <div className="text-xs font-mono-tech text-[#A0A0A0]">
        SHOWING <strong className="text-white">{fromItem}</strong>–
        <strong className="text-white">{toItem}</strong> OF{' '}
        <strong className="text-white">{totalCount}</strong>
      </div>

      <div className="flex items-center gap-2">
        <select
          aria-label="Items per page"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono-tech text-[#A0A0A0] focus:border-[#FF4D12] focus:outline-none"
        >
          {[8, 12, 24, 50].map((sz) => (
            <option key={sz} value={sz}>
              {sz} / page
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono-tech text-white disabled:opacity-35 hover:border-[#333333] cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <span className="px-2.5 text-xs font-mono-tech text-[#A0A0A0]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono-tech text-white disabled:opacity-35 hover:border-[#333333] cursor-pointer disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

const TaskFilterToolbar = memo(function TaskFilterToolbar({
  searchQuery,
  onSearchChange,
  filterCadence,
  onCadenceChange,
  filterQuadrant,
  onQuadrantChange,
  totalCount,
  searchPlaceholder,
  extraControls = null,
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-3 rounded-xl border border-[#222222] bg-[#141414] p-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-[#222222] bg-[#1A1A1A] pl-9 pr-8 py-2 text-xs text-white placeholder-[#666666] focus:border-[#FF4D12] focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {extraControls}

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
        {['ALL', 'HOURLY', 'DAILY', 'WEEKLY'].map((cad) => (
          <button
            key={cad}
            type="button"
            onClick={() =>
              onCadenceChange(filterCadence === cad && cad !== 'ALL' ? 'ALL' : cad)
            }
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-mono-tech border cursor-pointer whitespace-nowrap ${
              filterCadence === cad
                ? 'bg-[#FF4D12]/15 text-[#FF4D12] border-[#FF4D12]/45'
                : 'bg-[#1A1A1A] text-[#A0A0A0] border-[#222222] hover:text-white'
            }`}
          >
            {cad === 'ALL' ? 'All Cadences' : CADENCES[cad].label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
        <button
          type="button"
          onClick={() => onQuadrantChange('ALL')}
          className={`rounded-lg px-2.5 py-1.5 text-[11px] font-mono-tech border cursor-pointer whitespace-nowrap ${
            filterQuadrant === 'ALL'
              ? 'bg-white text-[#1A1A1A] border-white font-semibold'
              : 'bg-[#1A1A1A] text-[#A0A0A0] border-[#222222] hover:text-white'
          }`}
        >
          All ({totalCount})
        </button>
        {Object.values(QUADRANTS).map((q) => {
          const active = filterQuadrant === q.id;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onQuadrantChange(active ? 'ALL' : q.id)}
              style={
                active
                  ? {
                      backgroundColor: q.badgeBg,
                      borderColor: q.badgeBorder,
                      color: q.badgeText,
                    }
                  : undefined
              }
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-mono-tech border cursor-pointer whitespace-nowrap ${
                active
                  ? 'font-semibold'
                  : 'bg-[#1A1A1A] text-[#A0A0A0] border-[#222222] hover:text-white'
              }`}
            >
              {q.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

// ============================================================================
// 6. SCREEN 1: WELCOME BACK ZIA (DASHBOARD)
// ============================================================================

function WelcomeDashboardTab({
  telemetry,
  nowMs,
  onSelectTask,
  onCompleteTask,
  onJumpToBoard,
}) {
  const [hoveredDayIdx, setHoveredDayIdx] = useState(null);

  const chartW = 560;
  const chartH = 150;
  const padX = 24;
  const padTop = 20;
  const padBottom = 24;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padTop - padBottom;

  const maxChartVal = Math.max(
    4,
    ...telemetry.weeklyDays.map((d) => Math.max(d.completedCount, d.plannedCount))
  );

  const chartPoints = telemetry.weeklyDays.map((d, idx) => {
    const x = padX + (idx / 6) * plotW;
    const yDone = padTop + plotH - (d.completedCount / maxChartVal) * plotH;
    const yPlan = padTop + plotH - (d.plannedCount / maxChartVal) * plotH;
    return { ...d, idx, x, yDone, yPlan };
  });

  const buildSmoothPath = (pts, key) => {
    if (!pts.length) return '';
    return pts.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt[key]}`;
      const prev = arr[idx - 1];
      const cpX = (prev.x + pt.x) / 2;
      return `${acc} C ${cpX} ${prev[key]}, ${cpX} ${pt[key]}, ${pt.x} ${pt[key]}`;
    }, '');
  };

  const doneLinePath = buildSmoothPath(chartPoints, 'yDone');
  const plannedLinePath = buildSmoothPath(chartPoints, 'yPlan');
  const doneAreaPath = chartPoints.length
    ? `${doneLinePath} L ${chartPoints[chartPoints.length - 1].x} ${
        padTop + plotH
      } L ${chartPoints[0].x} ${padTop + plotH} Z`
    : '';

  const focusedDay =
    hoveredDayIdx !== null ? chartPoints[hoveredDayIdx] : chartPoints[chartPoints.length - 1];

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
        <section className="lg:col-span-5 rounded-xl border border-[#222222] bg-[#141414] p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <ClockAlert className="w-4 h-4 text-[#FF4D12]" />
              <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
                All Overdue
              </h2>
            </div>
            <span className="rounded-md bg-[#FF4D12]/15 border border-[#FF4D12]/35 px-2 py-0.5 text-[11px] font-mono-tech font-semibold text-[#FF4D12]">
              {telemetry.overdueTasks.length} ITEMS
            </span>
          </div>

          {telemetry.overdueTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#FFA489] mb-2.5" />
              <p className="text-sm font-medium text-white">Zero Overdue Tasks</p>
              <p className="text-xs text-[#A0A0A0] mt-1">
                All active hourly, daily, and weekly tasks are on schedule.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {telemetry.overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-[#222222] bg-[#1A1A1A] px-3.5 py-2.5 hover:border-[#FF4D12]/45"
                >
                  <button
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className="min-w-0 flex-1 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-mono-tech">
                      <span className="text-[#FF4D12] font-semibold">
                        {TaskService.formatTskKey(task.tskNumber)}
                      </span>
                      <CadenceBadge cadence={task.cadence} />
                      <span className="text-[#FFA489] truncate">
                        • {DateService.formatOverdueDuration(task.dueAt, nowMs)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white truncate mt-1">
                      {task.title}
                    </p>
                    <p className="text-[11px] font-mono-tech text-[#A0A0A0] mt-0.5">
                      {QUADRANTS[task.quadrant]?.label}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onCompleteTask(task.id)}
                    title="Mark Done"
                    className="shrink-0 rounded-lg border border-[#222222] bg-[#141414] p-2 text-[#A0A0A0] hover:border-[#FF4D12] hover:text-[#FF4D12] cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-7 rounded-xl border border-[#222222] bg-[#141414] p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#222222]">
              <div>
                <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
                  Weekly Execution & Momentum
                </h2>
                <p className="text-xs text-[#A0A0A0] mt-0.5">
                  {focusedDay
                    ? `${focusedDay.isToday ? 'Today' : focusedDay.label} (${
                        focusedDay.dateNum
                      }): ${focusedDay.completedCount} done / ${focusedDay.plannedCount} planned`
                    : '7-day completion trend'}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono-tech">
                <span className="inline-flex items-center gap-1.5 text-white">
                  <span className="w-2.5 h-0.5 bg-[#FF4D12]" />
                  Completed
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#A0A0A0]">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-[#FFA489]" />
                  Planned
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-3">
                <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0]">
                  Completion Rate
                </div>
                <div className="font-display text-xl font-bold text-white mt-0.5">
                  {telemetry.weeklyCompletionPct}%
                </div>
                <div className="text-[11px] font-mono-tech text-[#FF4D12]">
                  {telemetry.weeklyCompletedTotal} done
                </div>
              </div>

              <div className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-3">
                <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0]">
                  On-Time SLA
                </div>
                <div className="font-display text-xl font-bold text-white mt-0.5">
                  {telemetry.onTimeRatePct}%
                </div>
                <div className="text-[11px] font-mono-tech text-[#FFA489]">before due</div>
              </div>

              <div className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-3">
                <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0]">
                  Daily Pace
                </div>
                <div className="font-display text-xl font-bold text-white mt-0.5">
                  {telemetry.avgDailyCompleted}/d
                </div>
                <div className="text-[11px] font-mono-tech text-[#A0A0A0]">
                  Peak: {telemetry.bestDay?.label} ({telemetry.bestDay?.completedCount})
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-[#222222] bg-[#1A1A1A] p-3">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-36 overflow-visible"
                role="img"
                aria-label="7-day completion trend chart"
              >
                <defs>
                  <linearGradient id="tpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4D12" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#FF4D12" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 0.5, 1].map((ratio, i) => {
                  const y = padTop + plotH * ratio;
                  return (
                    <line
                      key={i}
                      x1={padX}
                      x2={chartW - padX}
                      y1={y}
                      y2={y}
                      stroke="#262626"
                      strokeDasharray="3 3"
                    />
                  );
                })}

                {doneAreaPath && <path d={doneAreaPath} fill="url(#tpAreaGrad)" />}
                {plannedLinePath && (
                  <path
                    d={plannedLinePath}
                    fill="none"
                    stroke="#FFA489"
                    strokeOpacity="0.55"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                  />
                )}
                {doneLinePath && (
                  <path
                    d={doneLinePath}
                    fill="none"
                    stroke="#FF4D12"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                  />
                )}

                {chartPoints.map((pt) => {
                  const isFocused = focusedDay?.idx === pt.idx;
                  return (
                    <g
                      key={pt.idx}
                      onMouseEnter={() => setHoveredDayIdx(pt.idx)}
                      onMouseLeave={() => setHoveredDayIdx(null)}
                      onClick={() => setHoveredDayIdx(pt.idx)}
                      className="cursor-pointer"
                    >
                      {isFocused && (
                        <line
                          x1={pt.x}
                          x2={pt.x}
                          y1={padTop}
                          y2={padTop + plotH}
                          stroke="#FF4D12"
                          strokeOpacity="0.35"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.yPlan}
                        r={isFocused ? 4 : 2.5}
                        fill="#1A1A1A"
                        stroke="#FFA489"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.yDone}
                        r={isFocused ? 5.5 : 3.5}
                        fill="#FF4D12"
                        stroke="#FFFFFF"
                        strokeWidth={isFocused ? '1.5' : '0'}
                      />
                      <text
                        x={pt.x}
                        y={chartH - 5}
                        textAnchor="middle"
                        fill={pt.isToday || isFocused ? '#FFFFFF' : '#A0A0A0'}
                        fontSize="10"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {pt.label}
                      </text>
                      <rect
                        x={pt.x - 24}
                        y={0}
                        width={48}
                        height={chartH}
                        fill="transparent"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#222222]">
            {telemetry.cadenceBreakdown.map((cad) => (
              <div key={cad.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono-tech">
                  <span className="text-[#A0A0A0]">{cad.label}</span>
                  <span className="text-white">
                    {cad.done}/{cad.total}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#222222] overflow-hidden">
                  <div
                    style={{ width: `${cad.pct}%`, backgroundColor: cad.accent }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Secondary Row: Board Pipeline & Eisenhower Matrix Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
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

        <section className="lg:col-span-7 rounded-xl border border-[#222222] bg-[#141414] p-5">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#222222]">
            <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
              Eisenhower Matrix Radar
            </h2>
            <span className="text-[11px] font-mono-tech text-[#A0A0A0]">
              CLICK QUADRANT TO FILTER BOARD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
            {Object.values(QUADRANTS).map((q) => {
              const Icon = q.icon;
              const activeCount = (telemetry.byQuadrant[q.id] || []).length;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onJumpToBoard(q.id)}
                  className="group rounded-xl border border-[#222222] bg-[#1A1A1A] p-4 text-left hover:border-[#FF4D12]/50 cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        backgroundColor: q.badgeBg,
                        borderColor: q.badgeBorder,
                        color: q.badgeText,
                      }}
                      className="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-mono-tech font-medium"
                    >
                      <Icon className="w-3 h-3" />
                      {q.shortLabel}
                    </span>
                    <span className="font-display text-2xl font-bold text-white">
                      {activeCount}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs font-semibold text-white">{q.sublabel}</div>
                    <p className="text-[11px] text-[#A0A0A0] mt-0.5 line-clamp-1">
                      {q.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// 7. SCREEN 2: JIRA-STYLE BOARD (KANBAN & LIST WITH PAGINATION)
// ============================================================================

function JiraBoardTab({
  tasks,
  totalCount,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  boardView,
  onBoardViewChange,
  searchQuery,
  onSearchChange,
  filterQuadrant,
  onQuadrantChange,
  filterCadence,
  onCadenceChange,
  settings,
  nowMs,
  doneCount,
  cancelledCount,
  onSelectTask,
  onStatusChange,
  onOpenCreate,
  onArchiveStatusToHistory,
}) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const isCompact = settings.density === 'compact';

  const handleDropOnColumn = (targetStatus) => {
    if (!draggedTaskId) return;
    const draggedTask = tasks.find((t) => t.id === draggedTaskId);
    if (draggedTask && draggedTask.status !== targetStatus) {
      onStatusChange(draggedTaskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-[#FF4D12] mb-1">
            <Kanban className="w-3.5 h-3.5" />
            Active Sprint Execution
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Jira-Style Board</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={doneCount === 0}
            onClick={() => onArchiveStatusToHistory('DONE')}
            title="Move all Done tickets to History tab"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#222222] bg-[#141414] px-3 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:border-[#FF4D12]/50 hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4D12]" />
            Clear Done ({doneCount})
          </button>

          <button
            type="button"
            disabled={cancelledCount === 0}
            onClick={() => onArchiveStatusToHistory('CANCELLED')}
            title="Move all Cancelled tickets to History tab"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#222222] bg-[#141414] px-3 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:border-[#FFA489]/50 hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <Ban className="w-3.5 h-3.5 text-[#FFA489]" />
            Clear Cancelled ({cancelledCount})
          </button>

          <div className="inline-flex rounded-lg border border-[#222222] bg-[#141414] p-1">
            <button
              type="button"
              onClick={() => onBoardViewChange('kanban')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono-tech cursor-pointer ${
                boardView === 'kanban'
                  ? 'bg-[#FF4D12] text-white font-semibold'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => onBoardViewChange('list')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono-tech cursor-pointer ${
                boardView === 'list'
                  ? 'bg-[#FF4D12] text-white font-semibold'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
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
        searchPlaceholder="Search TSK-0000, title, or description..."
      />

      {boardView === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {BOARD_STATUSES.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            const isDropTarget = dragOverStatus === col.id;
            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStatus(col.id);
                }}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={() => handleDropOnColumn(col.id)}
                className={`rounded-xl border bg-[#141414] p-3 flex flex-col min-h-[460px] ${
                  isDropTarget ? 'border-[#FF4D12]' : 'border-[#222222]'
                }`}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222]">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: col.dot }}
                      className="w-2 h-2 rounded-full"
                    />
                    <span className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
                      {col.label}
                    </span>
                    <span className="rounded bg-[#1A1A1A] border border-[#222222] px-1.5 py-0.5 text-[11px] font-mono-tech text-[#A0A0A0]">
                      {colTasks.length}
                    </span>
                  </div>

                  {col.id === 'TODO' && (
                    <button
                      type="button"
                      onClick={() => onOpenCreate('TODO')}
                      title="Create ticket in To Do"
                      className="rounded-md border border-[#222222] bg-[#1A1A1A] p-1 text-[#A0A0A0] hover:border-[#FF4D12] hover:text-[#FF4D12] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="h-28 rounded-lg border border-dashed border-[#222222] flex items-center justify-center text-xs font-mono-tech text-[#666666]">
                      Drop ticket here
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const isFinished =
                        task.status === 'DONE' || task.status === 'CANCELLED';
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => setDraggedTaskId(task.id)}
                          onDragEnd={() => {
                            setDraggedTaskId(null);
                            setDragOverStatus(null);
                          }}
                          className={`group rounded-lg border border-[#222222] bg-[#1A1A1A] ${
                            isCompact ? 'p-2.5' : 'p-3.5'
                          } hover:border-[#FF4D12]/45 cursor-grab active:cursor-grabbing`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="w-3.5 h-3.5 text-[#555555]" />
                              <span className="font-mono-tech text-[11px] font-semibold text-[#FF4D12]">
                                {TaskService.formatTskKey(task.tskNumber)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CadenceBadge cadence={task.cadence} />
                              <QuadrantBadge quadrant={task.quadrant} compact />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSelectTask(task)}
                            className="w-full text-left mt-2 cursor-pointer"
                          >
                            <h3
                              className={`text-sm font-medium leading-snug ${
                                isFinished
                                  ? 'line-through text-[#A0A0A0]/65'
                                  : 'text-white group-hover:text-[#FFA489]'
                              }`}
                            >
                              {task.title}
                            </h3>
                            {!isCompact && task.description && (
                              <p className="text-xs text-[#A0A0A0] line-clamp-2 mt-1">
                                {task.description}
                              </p>
                            )}
                          </button>

                          <div className="mt-2.5">
                            <DueBadge
                              dueAt={task.dueAt}
                              status={task.status}
                              nowMs={nowMs}
                            />
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-[#222222] flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => onStatusChange(task.id, 'BACKLOG')}
                              title="Send back to Backlog"
                              className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-mono-tech text-[#A0A0A0] hover:bg-[#222222] hover:text-white cursor-pointer"
                            >
                              <Archive className="w-3 h-3" />
                              Backlog
                            </button>

                            <div className="flex items-center gap-1">
                              {task.status !== 'TODO' && (
                                <button
                                  type="button"
                                  onClick={() => onStatusChange(task.id, 'TODO')}
                                  className="rounded border border-[#262626] bg-[#141414] px-1.5 py-0.5 text-[10px] font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
                                >
                                  ←
                                </button>
                              )}
                              {task.status !== 'IN_PROGRESS' && (
                                <button
                                  type="button"
                                  onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                                  className="rounded border border-[#262626] bg-[#141414] px-1.5 py-0.5 text-[10px] font-mono-tech text-[#FFA489] hover:border-[#FFA489]/50 cursor-pointer"
                                >
                                  WIP
                                </button>
                              )}
                              {task.status !== 'DONE' && (
                                <button
                                  type="button"
                                  onClick={() => onStatusChange(task.id, 'DONE')}
                                  className="rounded border border-[#262626] bg-[#141414] px-1.5 py-0.5 text-[10px] font-mono-tech text-[#FF4D12] hover:border-[#FF4D12]/50 cursor-pointer"
                                >
                                  Done
                                </button>
                              )}
                              {task.status !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  onClick={() => onStatusChange(task.id, 'CANCELLED')}
                                  title="Cancel task"
                                  className="rounded border border-[#262626] bg-[#141414] p-1 text-[#A0A0A0] hover:text-white cursor-pointer"
                                >
                                  <Ban className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-[#222222] bg-[#141414] divide-y divide-[#222222]">
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#A0A0A0]">
              No board tickets match your current filters.
            </div>
          ) : (
            tasks.map((task) => {
              const isDone = task.status === 'DONE';
              const isFinished = isDone || task.status === 'CANCELLED';
              return (
                <div
                  key={task.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 hover:bg-[#1A1A1A]/70"
                >
                  <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() =>
                        onStatusChange(task.id, isDone ? 'TODO' : 'DONE')
                      }
                      aria-label={isDone ? 'Reopen task' : 'Complete task'}
                      className="mt-0.5 md:mt-0 text-[#A0A0A0] hover:text-[#FF4D12] cursor-pointer shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#FF4D12]" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className="min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tech text-xs font-semibold text-[#FF4D12]">
                          {TaskService.formatTskKey(task.tskNumber)}
                        </span>
                        <span
                          className={`text-sm font-medium truncate ${
                            isFinished
                              ? 'line-through text-[#A0A0A0]/65'
                              : 'text-white hover:text-[#FFA489]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-[#A0A0A0] truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <DueBadge dueAt={task.dueAt} status={task.status} nowMs={nowMs} />
                    <CadenceBadge cadence={task.cadence} />
                    <QuadrantBadge quadrant={task.quadrant} compact />

                    <select
                      aria-label="Ticket status"
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value)}
                      className="rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1 text-xs font-mono-tech text-white focus:border-[#FF4D12] focus:outline-none"
                    >
                      {BOARD_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onStatusChange(task.id, 'BACKLOG')}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1 text-xs font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
                    >
                      <Archive className="w-3 h-3" />
                      Backlog
                    </button>
                  </div>
                </div>
              );
            })
          )}
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
}

// ============================================================================
// 8. SCREEN 3: BACKLOGS (STAGING VAULT WITH DUPLICATE & PULL TO BOARD)
// ============================================================================

function BacklogsTab({
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
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

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
            <div
              key={task.id}
              className="relative rounded-xl border border-[#222222] bg-[#141414] p-4 flex flex-col justify-between hover:border-[#FF4D12]/45"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tech text-xs font-semibold text-[#FF4D12]">
                    {TaskService.formatTskKey(task.tskNumber)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <CadenceBadge cadence={task.cadence} />
                    <QuadrantBadge quadrant={task.quadrant} compact />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTask(task)}
                  className="w-full text-left mt-3 cursor-pointer"
                >
                  <h3 className="text-sm font-semibold text-white hover:text-[#FFA489]">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-[#A0A0A0] line-clamp-2 mt-1.5">
                      {task.description}
                    </p>
                  )}
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-[#222222] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTask(task)}
                  className="text-xs font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
                >
                  Edit details
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onPullToBoard(task)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#FF4D12]/15 border border-[#FF4D12]/40 px-2.5 py-1.5 text-xs font-mono-tech font-semibold text-[#FF4D12] hover:bg-[#FF4D12] hover:text-white cursor-pointer"
                  >
                    Pull to Board
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(openMenuId === task.id ? null : task.id)
                      }
                      aria-label="More backlog actions"
                      className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-1.5 text-[#A0A0A0] hover:text-white cursor-pointer"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {openMenuId === task.id && (
                      <div className="absolute right-0 bottom-9 z-20 w-36 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onOpenDuplicateModal(task);
                          }}
                          className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-mono-tech text-white hover:bg-[#FF4D12]/15 hover:text-[#FF4D12] cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Duplicate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#222222] bg-[#141414] divide-y divide-[#222222]">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 hover:bg-[#1A1A1A]/70"
            >
              <button
                type="button"
                onClick={() => onSelectTask(task)}
                className="min-w-0 flex-1 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono-tech text-xs font-semibold text-[#FF4D12]">
                    {TaskService.formatTskKey(task.tskNumber)}
                  </span>
                  <span className="text-sm font-medium text-white truncate">
                    {task.title}
                  </span>
                </div>
                {task.description && (
                  <p className="text-xs text-[#A0A0A0] truncate mt-0.5">
                    {task.description}
                  </p>
                )}
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <CadenceBadge cadence={task.cadence} />
                <QuadrantBadge quadrant={task.quadrant} compact />

                <button
                  type="button"
                  onClick={() => onPullToBoard(task)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#FF4D12]/15 border border-[#FF4D12]/40 px-2.5 py-1.5 text-xs font-mono-tech font-semibold text-[#FF4D12] hover:bg-[#FF4D12] hover:text-white cursor-pointer"
                >
                  Pull to Board
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(openMenuId === task.id ? null : task.id)
                    }
                    aria-label="More backlog actions"
                    className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-1.5 text-[#A0A0A0] hover:text-white cursor-pointer"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {openMenuId === task.id && (
                    <div className="absolute right-0 top-9 z-20 w-36 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-1 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onOpenDuplicateModal(task);
                        }}
                        className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-mono-tech text-white hover:bg-[#FF4D12]/15 hover:text-[#FF4D12] cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Duplicate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
}

// ============================================================================
// 9. SCREEN 4: HISTORY (CLEARED DONE & CANCELLED ARCHIVE)
// ============================================================================

function HistoryTab({
  tasks,
  totalCount,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchQuery,
  onSearchChange,
  filterOutcome,
  onOutcomeChange,
  filterQuadrant,
  onQuadrantChange,
  filterCadence,
  onCadenceChange,
  archivedDoneCount,
  archivedCancelledCount,
  onSelectTask,
  onRestoreTask,
  onDeletePermanent,
  onPurgeHistory,
}) {
  const [confirmPurge, setConfirmPurge] = useState(false);

  const outcomeFilterControls = (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
      {[
        { id: 'ALL', label: `All (${archivedDoneCount + archivedCancelledCount})` },
        { id: 'DONE', label: `Cleared Done (${archivedDoneCount})` },
        { id: 'CANCELLED', label: `Cleared Cancelled (${archivedCancelledCount})` },
      ].map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() =>
            onOutcomeChange(filterOutcome === opt.id && opt.id !== 'ALL' ? 'ALL' : opt.id)
          }
          className={`rounded-lg px-2.5 py-1.5 text-[11px] font-mono-tech border cursor-pointer whitespace-nowrap ${
            filterOutcome === opt.id
              ? 'bg-[#FF4D12]/15 text-[#FF4D12] border-[#FF4D12]/45 font-semibold'
              : 'bg-[#1A1A1A] text-[#A0A0A0] border-[#222222] hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-[#FF4D12] mb-1">
            <History className="w-3.5 h-3.5" />
            Cleared Done & Cancelled Ledger
          </div>
          <h1 className="font-display text-2xl font-bold text-white">History</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!confirmPurge ? (
            <button
              type="button"
              disabled={archivedDoneCount + archivedCancelledCount === 0}
              onClick={() => setConfirmPurge(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#222222] bg-[#141414] px-3 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:border-[#FF4D12]/50 hover:text-[#FF4D12] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge History ({archivedDoneCount + archivedCancelledCount})
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onPurgeHistory();
                  setConfirmPurge(false);
                }}
                className="rounded-lg bg-[#FF4D12] px-3 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Confirm Permanent Purge
              </button>
              <button
                type="button"
                onClick={() => setConfirmPurge(false)}
                className="rounded-lg border border-[#222222] bg-[#141414] px-3 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#222222] bg-[#141414] p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0]">
              Total Archived
            </div>
            <div className="font-display text-2xl font-bold text-white mt-0.5">
              {archivedDoneCount + archivedCancelledCount}
            </div>
          </div>
          <History className="w-5 h-5 text-[#A0A0A0]" />
        </div>

        <div className="rounded-xl border border-[#222222] bg-[#141414] p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0]">
              Cleared Done
            </div>
            <div className="font-display text-2xl font-bold text-[#FF4D12] mt-0.5">
              {archivedDoneCount}
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-[#FF4D12]" />
        </div>

        <div className="rounded-xl border border-[#222222] bg-[#141414] p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono-tech uppercase text-[#A0A0A0]">
              Cleared Cancelled
            </div>
            <div className="font-display text-2xl font-bold text-[#FFA489] mt-0.5">
              {archivedCancelledCount}
            </div>
          </div>
          <Ban className="w-5 h-5 text-[#FFA489]" />
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
        searchPlaceholder="Search history TSK-0000, title, or notes..."
        extraControls={outcomeFilterControls}
      />

      <div className="rounded-xl border border-[#222222] bg-[#141414] divide-y divide-[#222222]">
        {tasks.length === 0 ? (
          <div className="py-14 text-center">
            <History className="w-8 h-8 text-[#A0A0A0] mx-auto mb-2.5" />
            <p className="text-sm font-medium text-white">No Archived History Yet</p>
            <p className="text-xs text-[#A0A0A0] mt-1">
              Use "Clear Done" or "Clear Cancelled" on the Jira Board to move finished tickets here.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const wasDone = task.archivedFrom === 'DONE';
            return (
              <div
                key={task.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3.5 hover:bg-[#1A1A1A]/70"
              >
                <div className="flex items-start lg:items-center gap-3 min-w-0 flex-1">
                  <span
                    className={`mt-0.5 lg:mt-0 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono-tech font-semibold uppercase shrink-0 ${
                      wasDone
                        ? 'bg-[#FF4D12]/15 text-[#FF4D12] border-[#FF4D12]/40'
                        : 'bg-[#FFA489]/12 text-[#FFA489] border-[#FFA489]/35'
                    }`}
                  >
                    {wasDone ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Ban className="w-3 h-3" />
                    )}
                    {wasDone ? 'Done' : 'Cancelled'}
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className="min-w-0 flex-1 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tech text-xs font-semibold text-[#FF4D12]">
                        {TaskService.formatTskKey(task.tskNumber)}
                      </span>
                      <span className="text-sm font-medium text-white truncate hover:text-[#FFA489]">
                        {task.title}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-[#A0A0A0] truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono-tech text-[#A0A0A0]">
                    Cleared {DateService.formatShortDateTime(task.archivedAt)}
                  </span>
                  <CadenceBadge cadence={task.cadence} />
                  <QuadrantBadge quadrant={task.quadrant} compact />

                  <button
                    type="button"
                    onClick={() => onRestoreTask(task, 'TODO')}
                    title="Restore back to Board (To Do)"
                    className="inline-flex items-center gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono-tech text-white hover:border-[#FF4D12] hover:text-[#FF4D12] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore to Board
                  </button>

                  <button
                    type="button"
                    onClick={() => onRestoreTask(task, 'BACKLOG')}
                    title="Restore to Backlog"
                    className="inline-flex items-center gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
                  >
                    <Archive className="w-3 h-3" />
                    Backlog
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeletePermanent(task.id)}
                    title="Delete permanently"
                    className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-1.5 text-[#A0A0A0] hover:border-[#FF4D12] hover:text-[#FF4D12] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

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
}

// ============================================================================
// 10. SCREEN 5: SETTINGS & PRISMA SCHEMA BLUEPRINT
// ============================================================================

const PRISMA_SCHEMA_BLUEPRINT = `enum PriorityQuadrant {
  URGENT_IMPORTANT
  NOT_URGENT_IMPORTANT
  URGENT_NOT_IMPORTANT
  NOT_URGENT_NOT_IMPORTANT
}

enum TaskStatus {
  BACKLOG
  TODO
  IN_PROGRESS
  DONE
  CANCELLED
  HISTORY
}

enum DueCadence {
  HOURLY
  DAILY
  WEEKLY
}

model Task {
  id           String           @id @default(uuid())
  tskNumber    String           @unique @db.VarChar(4) // 0000 - 9999
  title        String
  description  String?
  quadrant     PriorityQuadrant @default(NOT_URGENT_IMPORTANT)
  status       TaskStatus       @default(TODO)
  cadence      DueCadence       @default(DAILY)
  dueAt        DateTime
  completedAt  DateTime?
  archivedFrom String?          // 'DONE' | 'CANCELLED'
  archivedAt   DateTime?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}`;

function SettingsTab({
  settings,
  onUpdateSettings,
  allTasks,
  onArchiveStatusToHistory,
  onResetDemoData,
}) {
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(PRISMA_SCHEMA_BLUEPRINT);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = PRISMA_SCHEMA_BLUEPRINT;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(allTasks, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskpilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[#222222] pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-[#FF4D12] mb-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Workspace & Schema Configuration
        </div>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
      </div>

      {/* Interface Preferences */}
      <section className="rounded-xl border border-[#222222] bg-[#141414] p-5 space-y-4">
        <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
          Interface & Board Preferences
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-[#222222]">
          <div>
            <div className="text-sm font-medium text-white">Board Card Density</div>
            <div className="text-xs text-[#A0A0A0]">
              Compact mode hides descriptions on Kanban cards for faster triage.
            </div>
          </div>
          <div className="inline-flex rounded-lg border border-[#222222] bg-[#1A1A1A] p-1 self-start">
            {['comfortable', 'compact'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onUpdateSettings({ ...settings, density: mode })}
                className={`rounded-md px-3 py-1 text-xs font-mono-tech capitalize cursor-pointer ${
                  settings.density === mode
                    ? 'bg-[#FF4D12] text-white font-semibold'
                    : 'text-[#A0A0A0] hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 py-2">
          <div>
            <div className="text-sm font-medium text-white">
              Auto-Sort Done & Cancelled to Bottom
            </div>
            <div className="text-xs text-[#A0A0A0]">
              Automatically pushes completed and cancelled tasks below active items.
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({ ...settings, autoSortDone: !settings.autoSortDone })
            }
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              settings.autoSortDone ? 'bg-[#FF4D12]' : 'bg-[#2A2A2A]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.autoSortDone ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Workspace Data Operations */}
      <section className="rounded-xl border border-[#222222] bg-[#141414] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
            Workspace Data Management
          </h2>
          <span className="text-xs font-mono-tech text-[#FFA489]">
            Local Storage Synced
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF4D12] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#e4420d] cursor-pointer"
          >
            Export JSON Backup ({allTasks.length})
          </button>

          <button
            type="button"
            onClick={() => onArchiveStatusToHistory(['DONE', 'CANCELLED'])}
            className="inline-flex items-center gap-2 rounded-lg border border-[#222222] bg-[#1A1A1A] px-3.5 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
          >
            Move Done & Cancelled to History
          </button>

          <button
            type="button"
            onClick={onResetDemoData}
            className="inline-flex items-center gap-2 rounded-lg border border-[#222222] bg-[#1A1A1A] px-3.5 py-2 text-xs font-mono-tech text-white hover:border-[#FF4D12]/50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF4D12]" />
            Reset Demo Data
          </button>
        </div>
      </section>

      {/* Prisma Schema Reference */}
      <section className="rounded-xl border border-[#222222] bg-[#141414] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-white">
            Prisma Schema (Vercel + Postgres Blueprint)
          </h2>
          <button
            type="button"
            onClick={handleCopySchema}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#222222] bg-[#1A1A1A] px-3 py-1.5 text-xs font-mono-tech text-white hover:border-[#FF4D12] cursor-pointer"
          >
            {copiedSchema ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#FF4D12]" />
                Copied Schema
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Prisma Schema
              </>
            )}
          </button>
        </div>

        <pre className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-4 text-xs font-mono-tech text-[#FFA489] overflow-x-auto leading-relaxed">
          {PRISMA_SCHEMA_BLUEPRINT}
        </pre>
      </section>
    </div>
  );
}

// ============================================================================
// 11. SHARED MODAL: CREATE, EDIT & DUPLICATE TICKET
// ============================================================================

function TaskModal({ mode, initialTask, usedTskNumbers, onClose, onSave, onDelete }) {
  const isNew = mode === 'create' || mode === 'duplicate';
  const initQuad = QUADRANTS[initialTask?.quadrant] || QUADRANTS.NOT_URGENT_IMPORTANT;

  const [tskInput, setTskInput] = useState(
    initialTask?.tskNumber || TaskService.suggestNextTskNumber(usedTskNumbers)
  );
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [cadence, setCadence] = useState(initialTask?.cadence || 'DAILY');
  const [dueAtInput, setDueAtInput] = useState(
    DateService.toDateTimeLocalValue(
      initialTask?.dueAt || DateService.getDefaultDueDate(initialTask?.cadence || 'DAILY')
    )
  );
  const [status, setStatus] = useState(
    isNew
      ? initialTask?.status === 'BACKLOG'
        ? 'BACKLOG'
        : 'TODO'
      : initialTask?.status || 'TODO'
  );
  const [urgent, setUrgent] = useState(initQuad.urgent);
  const [important, setImportant] = useState(initQuad.important);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const tskInputRef = useRef(null);

  useEffect(() => {
    if (mode === 'duplicate' && tskInputRef.current) {
      tskInputRef.current.focus();
      tskInputRef.current.select();
    }
  }, [mode]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const normalizedTsk = TaskService.normalizeTskNumber(tskInput);
  const isDuplicateTsk =
    normalizedTsk !== null &&
    usedTskNumbers.some(
      (num) =>
        String(num).padStart(4, '0') === normalizedTsk &&
        (isNew || String(initialTask?.tskNumber).padStart(4, '0') !== normalizedTsk)
    );

  const tskError =
    normalizedTsk === null
      ? 'Enter a valid 4-digit number from 0000 to 9999.'
      : isDuplicateTsk
      ? `TSK-${normalizedTsk} is already assigned to another task.`
      : null;

  const computedQuadrant = TaskService.getQuadrantFromFlags(urgent, important);

  const handleCadenceSelect = (nextCadence) => {
    setCadence(nextCadence);
    setDueAtInput(
      DateService.toDateTimeLocalValue(DateService.getDefaultDueDate(nextCadence))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || tskError) return;

    const finalStatus = isNew
      ? status === 'BACKLOG'
        ? 'BACKLOG'
        : 'TODO'
      : status;

    const dueIso = dueAtInput
      ? new Date(dueAtInput).toISOString()
      : DateService.getDefaultDueDate(cadence);

    const isHistory = finalStatus === 'HISTORY';

    onSave({
      id: isNew ? TaskService.generateUUID() : initialTask.id,
      tskNumber: normalizedTsk,
      title: title.trim(),
      description: description.trim(),
      quadrant: computedQuadrant,
      status: finalStatus,
      cadence,
      dueAt: dueIso,
      completedAt:
        finalStatus === 'DONE'
          ? initialTask?.completedAt || new Date().toISOString()
          : isHistory
          ? initialTask?.completedAt || null
          : null,
      archivedFrom: isHistory
        ? initialTask?.archivedFrom || 'DONE'
        : null,
      archivedAt: isHistory
        ? initialTask?.archivedAt || new Date().toISOString()
        : null,
      createdAt: isNew ? new Date().toISOString() : initialTask.createdAt,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-[#2A2A2A] bg-[#141414] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222]">
          <div>
            <span className="text-[11px] font-mono-tech uppercase tracking-wider text-[#FF4D12]">
              {mode === 'duplicate'
                ? 'Duplicate Backlog Item'
                : mode === 'create'
                ? 'New Task Ticket'
                : 'Edit Task Ticket'}
            </span>
            <h2 className="font-display text-lg font-bold text-white">
              {mode === 'duplicate'
                ? 'Assign Unique TSK Number & Confirm'
                : mode === 'create'
                ? 'Create Ticket'
                : TaskService.formatTskKey(initialTask.tskNumber)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#222222] bg-[#1A1A1A] p-1.5 text-[#A0A0A0] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono-tech uppercase text-[#A0A0A0] mb-1">
                TSK Number (0000–9999) *
              </label>
              <div className="flex items-center rounded-lg border border-[#222222] bg-[#1A1A1A] focus-within:border-[#FF4D12]">
                <span className="px-3 py-2 text-xs font-mono-tech font-semibold text-[#FF4D12] border-r border-[#222222]">
                  TSK-
                </span>
                <input
                  ref={tskInputRef}
                  type="text"
                  maxLength={4}
                  value={tskInput}
                  onChange={(e) => setTskInput(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => {
                    const norm = TaskService.normalizeTskNumber(tskInput);
                    if (norm) setTskInput(norm);
                  }}
                  placeholder="0001"
                  className="w-full bg-transparent px-3 py-2 text-xs font-mono-tech text-white focus:outline-none"
                />
              </div>
              {tskError && (
                <p className="text-[11px] font-mono-tech text-[#FF4D12] mt-1">{tskError}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono-tech uppercase text-[#A0A0A0] mb-1">
                Database Primary Key (UUID)
              </label>
              <input
                type="text"
                readOnly
                value={isNew ? 'Auto-generated UUID on save' : initialTask.id}
                className="w-full rounded-lg border border-[#222222] bg-[#1A1A1A]/60 px-3 py-2 text-[11px] font-mono-tech text-[#777777] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono-tech uppercase text-[#A0A0A0] mb-1">
              Summary / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be executed?"
              className="w-full rounded-lg border border-[#222222] bg-[#1A1A1A] px-3 py-2 text-sm text-white placeholder-[#666666] focus:border-[#FF4D12] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono-tech uppercase text-[#A0A0A0] mb-1">
                Due Cadence *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['HOURLY', 'DAILY', 'WEEKLY'].map((cad) => (
                  <button
                    key={cad}
                    type="button"
                    onClick={() => handleCadenceSelect(cad)}
                    className={`rounded-lg border py-2 text-xs font-mono-tech cursor-pointer ${
                      cadence === cad
                        ? 'bg-[#FF4D12]/15 border-[#FF4D12] text-[#FF4D12] font-semibold'
                        : 'bg-[#1A1A1A] border-[#222222] text-[#A0A0A0] hover:text-white'
                    }`}
                  >
                    {CADENCES[cad].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono-tech uppercase text-[#A0A0A0] mb-1">
                Deadline Timestamp *
              </label>
              <input
                type="datetime-local"
                required
                value={dueAtInput}
                onChange={(e) => setDueAtInput(e.target.value)}
                className="w-full rounded-lg border border-[#222222] bg-[#1A1A1A] px-3 py-1.5 text-xs font-mono-tech text-white focus:border-[#FF4D12] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono-tech uppercase text-[#A0A0A0] mb-1">
              Workflow Location
            </label>
            <div className="flex flex-wrap gap-2">
              {(isNew ? CREATE_ALLOWED_STATUSES : ALL_STATUSES).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-mono-tech cursor-pointer ${
                    status === st.id
                      ? 'bg-white text-[#1A1A1A] border-white font-semibold'
                      : 'bg-[#1A1A1A] text-[#A0A0A0] border-[#222222] hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#222222] bg-[#1A1A1A] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono-tech uppercase text-[#A0A0A0]">
                Eisenhower Matrix Classification
              </span>
              <QuadrantBadge quadrant={computedQuadrant} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUrgent(!urgent)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-mono-tech cursor-pointer ${
                  urgent
                    ? 'border-[#FF4D12] bg-[#FF4D12]/15 text-white'
                    : 'border-[#262626] bg-[#141414] text-[#A0A0A0]'
                }`}
              >
                <span>Urgent</span>
                <span className="font-semibold">{urgent ? 'YES' : 'NO'}</span>
              </button>

              <button
                type="button"
                onClick={() => setImportant(!important)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-mono-tech cursor-pointer ${
                  important
                    ? 'border-[#FFA489] bg-[#FFA489]/15 text-white'
                    : 'border-[#262626] bg-[#141414] text-[#A0A0A0]'
                }`}
              >
                <span>Important</span>
                <span className="font-semibold">{important ? 'YES' : 'NO'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono-tech uppercase text-[#A0A0A0] mb-1">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Acceptance criteria, links, or implementation notes..."
              className="w-full rounded-lg border border-[#222222] bg-[#1A1A1A] px-3 py-2 text-xs text-white placeholder-[#666666] focus:border-[#FF4D12] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#222222]">
            {!isNew ? (
              !confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#1A1A1A] px-3 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:border-[#FF4D12] hover:text-[#FF4D12] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Ticket
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDelete(initialTask.id)}
                    className="rounded-lg bg-[#FF4D12] px-3 py-2 text-xs font-semibold text-white cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border border-[#222222] px-2.5 py-2 text-xs text-[#A0A0A0] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#222222] bg-[#1A1A1A] px-4 py-2 text-xs font-mono-tech text-[#A0A0A0] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || Boolean(tskError)}
                className="rounded-lg bg-[#FF4D12] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e4420d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {mode === 'duplicate'
                  ? 'Confirm Duplicate'
                  : mode === 'create'
                  ? 'Create Ticket'
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 12. ROOT APPLICATION SHELL
// ============================================================================

export default function App() {
  const [tasks, setTasks] = usePersistentStorage(TASKS_STORAGE_KEY, createSeedTasks);
  const [settings, setSettings] = usePersistentStorage(
    SETTINGS_STORAGE_KEY,
    DEFAULT_SETTINGS
  );

  const [activeTab, setActiveTab] = useState('dashboard');
  const [boardView, setBoardView] = useState('kanban');
  const [backlogView, setBacklogView] = useState('tile');
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Board filter & pagination state
  const [boardPage, setBoardPage] = useState(1);
  const [boardSearch, setBoardSearch] = useState('');
  const [boardQuadrant, setBoardQuadrant] = useState('ALL');
  const [boardCadence, setBoardCadence] = useState('ALL');
  const debouncedBoardSearch = useDebouncedValue(boardSearch, 180);

  // Backlog filter & pagination state
  const [backlogPage, setBacklogPage] = useState(1);
  const [backlogSearch, setBacklogSearch] = useState('');
  const [backlogQuadrant, setBacklogQuadrant] = useState('ALL');
  const [backlogCadence, setBacklogCadence] = useState('ALL');
  const debouncedBacklogSearch = useDebouncedValue(backlogSearch, 180);

  // History filter & pagination state
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historyOutcome, setHistoryOutcome] = useState('ALL');
  const [historyQuadrant, setHistoryQuadrant] = useState('ALL');
  const [historyCadence, setHistoryCadence] = useState('ALL');
  const debouncedHistorySearch = useDebouncedValue(historySearch, 180);

  // Modal & Toast state
  const [modalState, setModalState] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setBoardPage(1);
  }, [debouncedBoardSearch, boardQuadrant, boardCadence, settings.pageSize]);

  useEffect(() => {
    setBacklogPage(1);
  }, [debouncedBacklogSearch, backlogQuadrant, backlogCadence, settings.pageSize]);

  useEffect(() => {
    setHistoryPage(1);
  }, [
    debouncedHistorySearch,
    historyOutcome,
    historyQuadrant,
    historyCadence,
    settings.pageSize,
  ]);

  const telemetry = useDashboardTelemetry(tasks, nowMs);
  const usedTskNumbers = useMemo(() => tasks.map((t) => t.tskNumber), [tasks]);

  // Filtered & paginated Board tasks
  const boardPagination = useMemo(() => {
    let items = tasks.filter(
      (t) => t.status !== 'BACKLOG' && t.status !== 'HISTORY'
    );
    if (boardQuadrant !== 'ALL') {
      items = items.filter((t) => t.quadrant === boardQuadrant);
    }
    if (boardCadence !== 'ALL') {
      items = items.filter((t) => t.cadence === boardCadence);
    }
    if (debouncedBoardSearch.trim()) {
      const q = debouncedBoardSearch.trim().toLowerCase();
      items = items.filter(
        (t) =>
          TaskService.formatTskKey(t.tskNumber).toLowerCase().includes(q) ||
          t.tskNumber.includes(q) ||
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }
    const sorted = TaskService.sortTasks(items, settings.autoSortDone);
    const totalCount = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / settings.pageSize));
    const safePage = Math.min(boardPage, totalPages);
    const start = (safePage - 1) * settings.pageSize;
    return {
      items: sorted.slice(start, start + settings.pageSize),
      totalCount,
      totalPages,
      page: safePage,
    };
  }, [
    tasks,
    boardQuadrant,
    boardCadence,
    debouncedBoardSearch,
    settings.autoSortDone,
    settings.pageSize,
    boardPage,
  ]);

  // Filtered & paginated Backlog tasks
  const backlogPagination = useMemo(() => {
    let items = tasks.filter((t) => t.status === 'BACKLOG');
    if (backlogQuadrant !== 'ALL') {
      items = items.filter((t) => t.quadrant === backlogQuadrant);
    }
    if (backlogCadence !== 'ALL') {
      items = items.filter((t) => t.cadence === backlogCadence);
    }
    if (debouncedBacklogSearch.trim()) {
      const q = debouncedBacklogSearch.trim().toLowerCase();
      items = items.filter(
        (t) =>
          TaskService.formatTskKey(t.tskNumber).toLowerCase().includes(q) ||
          t.tskNumber.includes(q) ||
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }
    const sorted = TaskService.sortTasks(items, false);
    const totalCount = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / settings.pageSize));
    const safePage = Math.min(backlogPage, totalPages);
    const start = (safePage - 1) * settings.pageSize;
    return {
      items: sorted.slice(start, start + settings.pageSize),
      totalCount,
      totalPages,
      page: safePage,
    };
  }, [
    tasks,
    backlogQuadrant,
    backlogCadence,
    debouncedBacklogSearch,
    settings.pageSize,
    backlogPage,
  ]);

  // Filtered & paginated History tasks
  const historyStats = useMemo(() => {
    const allHistory = tasks.filter((t) => t.status === 'HISTORY');
    const archivedDoneCount = allHistory.filter((t) => t.archivedFrom === 'DONE').length;
    const archivedCancelledCount = allHistory.filter(
      (t) => t.archivedFrom === 'CANCELLED'
    ).length;
    return { archivedDoneCount, archivedCancelledCount };
  }, [tasks]);

  const historyPagination = useMemo(() => {
    let items = tasks.filter((t) => t.status === 'HISTORY');
    if (historyOutcome !== 'ALL') {
      items = items.filter((t) => t.archivedFrom === historyOutcome);
    }
    if (historyQuadrant !== 'ALL') {
      items = items.filter((t) => t.quadrant === historyQuadrant);
    }
    if (historyCadence !== 'ALL') {
      items = items.filter((t) => t.cadence === historyCadence);
    }
    if (debouncedHistorySearch.trim()) {
      const q = debouncedHistorySearch.trim().toLowerCase();
      items = items.filter(
        (t) =>
          TaskService.formatTskKey(t.tskNumber).toLowerCase().includes(q) ||
          t.tskNumber.includes(q) ||
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.archivedAt || b.createdAt).getTime() -
        new Date(a.archivedAt || a.createdAt).getTime()
    );
    const totalCount = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / settings.pageSize));
    const safePage = Math.min(historyPage, totalPages);
    const start = (safePage - 1) * settings.pageSize;
    return {
      items: sorted.slice(start, start + settings.pageSize),
      totalCount,
      totalPages,
      page: safePage,
    };
  }, [
    tasks,
    historyOutcome,
    historyQuadrant,
    historyCadence,
    debouncedHistorySearch,
    settings.pageSize,
    historyPage,
  ]);

  // Task mutation handlers
  const handleStatusChange = useCallback(
    (taskId, nextStatus) => {
      const completedAt = nextStatus === 'DONE' ? new Date().toISOString() : null;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: nextStatus,
                completedAt,
                archivedFrom: null,
                archivedAt: null,
              }
            : t
        )
      );
      if (nextStatus === 'BACKLOG') triggerToast('Moved back to Backlog');
      if (nextStatus === 'DONE') triggerToast('Task marked Done');
    },
    [setTasks, triggerToast]
  );

  const handlePullToBoard = useCallback(
    (task) => {
      const freshDue = DateService.getDefaultDueDate(task.cadence);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: 'TODO',
                dueAt: freshDue,
                completedAt: null,
                archivedFrom: null,
                archivedAt: null,
              }
            : t
        )
      );
      triggerToast(`Pulled ${TaskService.formatTskKey(task.tskNumber)} to Board`);
    },
    [setTasks, triggerToast]
  );

  // Moves all DONE or CANCELLED board tasks into the History archive tab
  const handleArchiveStatusToHistory = useCallback(
    (sourceStatuses) => {
      const statusesToArchive = Array.isArray(sourceStatuses)
        ? sourceStatuses
        : [sourceStatuses];
      const nowIso = new Date().toISOString();
      const matchingCount = tasks.filter((t) =>
        statusesToArchive.includes(t.status)
      ).length;

      if (matchingCount === 0) return;

      setTasks((prev) =>
        prev.map((t) =>
          statusesToArchive.includes(t.status)
            ? {
                ...t,
                status: 'HISTORY',
                archivedFrom: t.status,
                archivedAt: nowIso,
              }
            : t
        )
      );

      const label =
        statusesToArchive.length > 1
          ? 'Done & Cancelled'
          : statusesToArchive[0] === 'DONE'
          ? 'Done'
          : 'Cancelled';
      triggerToast(
        `Moved ${matchingCount} ${label} ticket${matchingCount === 1 ? '' : 's'} to History`
      );
    },
    [tasks, setTasks, triggerToast]
  );

  const handleRestoreFromHistory = useCallback(
    (task, targetStatus = 'TODO') => {
      const freshDue = DateService.getDefaultDueDate(task.cadence);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: targetStatus,
                dueAt: freshDue,
                completedAt: null,
                archivedFrom: null,
                archivedAt: null,
              }
            : t
        )
      );
      triggerToast(
        `Restored ${TaskService.formatTskKey(task.tskNumber)} to ${
          targetStatus === 'BACKLOG' ? 'Backlog' : 'Board'
        }`
      );
    },
    [setTasks, triggerToast]
  );

  const handlePurgeHistory = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.status !== 'HISTORY'));
    triggerToast('Permanently purged all History records');
  }, [setTasks, triggerToast]);

  const handleResetDemoData = useCallback(() => {
    setTasks(createSeedTasks());
    triggerToast('Reset workspace to demo dataset');
  }, [setTasks, triggerToast]);

  const handleOpenCreateModal = (defaultStatus = 'TODO') => {
    setModalState({
      mode: 'create',
      task: {
        tskNumber: TaskService.suggestNextTskNumber(usedTskNumbers),
        status: defaultStatus === 'BACKLOG' ? 'BACKLOG' : 'TODO',
        cadence: 'DAILY',
        quadrant: 'NOT_URGENT_IMPORTANT',
      },
    });
  };

  const handleOpenDuplicateModal = (task) => {
    setModalState({
      mode: 'duplicate',
      task: {
        ...task,
        tskNumber: TaskService.suggestNextTskNumber(usedTskNumbers),
        title: `${task.title} (I)`,
        status: 'BACKLOG',
      },
    });
  };

  const handleSaveModalTask = (savedTask) => {
    if (modalState?.mode === 'edit') {
      setTasks((prev) => prev.map((t) => (t.id === savedTask.id ? savedTask : t)));
      triggerToast(`Updated ${TaskService.formatTskKey(savedTask.tskNumber)}`);
    } else {
      setTasks((prev) => [savedTask, ...prev]);
      triggerToast(`Created ${TaskService.formatTskKey(savedTask.tskNumber)}`);
    }
    setModalState(null);
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setModalState(null);
    triggerToast('Ticket deleted');
  };

  const handleJumpToBoard = (quadrant = 'ALL') => {
    setBoardQuadrant(quadrant);
    setActiveTab('board');
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Welcome back Zia',
      shortLabel: 'Zia',
      icon: LayoutDashboard,
      badge: telemetry.overdueTasks.length > 0 ? telemetry.overdueTasks.length : null,
      badgeTone: 'danger',
    },
    {
      id: 'board',
      label: 'Jira-Style Board',
      shortLabel: 'Board',
      icon: Kanban,
      badge: telemetry.total,
      badgeTone: 'neutral',
    },
    {
      id: 'backlogs',
      label: 'Backlogs',
      shortLabel: 'Backlogs',
      icon: Archive,
      badge: telemetry.backlogCount,
      badgeTone: 'neutral',
    },
    {
      id: 'history',
      label: 'History',
      shortLabel: 'History',
      icon: History,
      badge: telemetry.historyCount,
      badgeTone: 'neutral',
    },
    {
      id: 'settings',
      label: 'Settings',
      shortLabel: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col lg:flex-row">
      <style>{THEME_STYLES}</style>

      {/* Desktop Sidebar */}
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
              handleOpenCreateModal(activeTab === 'backlogs' ? 'BACKLOG' : 'TODO')
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
                  onClick={() => setActiveTab(item.id)}
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
          <span className="inline-flex items-center gap-1.5 text-[#A0A0A0]">
            <span className="w-2 h-2 rounded-full bg-[#FF4D12]" />
            <span>SYNCED</span>
          </span>
          <span className="text-white">
            {telemetry.doneCount}/{telemetry.total} DONE
          </span>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-30 border-b border-[#222222] bg-[#141414] px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF4D12] flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-base font-bold text-white">TaskPilot</span>
          </div>

          <button
            type="button"
            onClick={() =>
              handleOpenCreateModal(activeTab === 'backlogs' ? 'BACKLOG' : 'TODO')
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF4D12] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {activeTab === 'backlogs' ? 'New Backlog' : 'New Task'}
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1 rounded-lg border border-[#222222] bg-[#1A1A1A] p-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`rounded-md py-1.5 text-[11px] font-mono-tech cursor-pointer ${
                activeTab === item.id
                  ? 'bg-[#FF4D12] text-white font-semibold'
                  : 'text-[#A0A0A0]'
              }`}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 lg:pl-64">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {activeTab === 'dashboard' && (
            <WelcomeDashboardTab
              telemetry={telemetry}
              nowMs={nowMs}
              onSelectTask={(task) => setModalState({ mode: 'edit', task })}
              onCompleteTask={(id) => handleStatusChange(id, 'DONE')}
              onJumpToBoard={handleJumpToBoard}
            />
          )}

          {activeTab === 'board' && (
            <JiraBoardTab
              tasks={boardPagination.items}
              totalCount={boardPagination.totalCount}
              page={boardPagination.page}
              totalPages={boardPagination.totalPages}
              pageSize={settings.pageSize}
              onPageChange={setBoardPage}
              onPageSizeChange={(sz) => setSettings({ ...settings, pageSize: sz })}
              boardView={boardView}
              onBoardViewChange={setBoardView}
              searchQuery={boardSearch}
              onSearchChange={setBoardSearch}
              filterQuadrant={boardQuadrant}
              onQuadrantChange={setBoardQuadrant}
              filterCadence={boardCadence}
              onCadenceChange={setBoardCadence}
              settings={settings}
              nowMs={nowMs}
              doneCount={telemetry.doneCount}
              cancelledCount={telemetry.cancelledCount}
              onSelectTask={(task) => setModalState({ mode: 'edit', task })}
              onStatusChange={handleStatusChange}
              onOpenCreate={handleOpenCreateModal}
              onArchiveStatusToHistory={handleArchiveStatusToHistory}
            />
          )}

          {activeTab === 'backlogs' && (
            <BacklogsTab
              tasks={backlogPagination.items}
              totalCount={backlogPagination.totalCount}
              page={backlogPagination.page}
              totalPages={backlogPagination.totalPages}
              pageSize={settings.pageSize}
              onPageChange={setBacklogPage}
              onPageSizeChange={(sz) => setSettings({ ...settings, pageSize: sz })}
              backlogView={backlogView}
              onBacklogViewChange={setBacklogView}
              searchQuery={backlogSearch}
              onSearchChange={setBacklogSearch}
              filterQuadrant={backlogQuadrant}
              onQuadrantChange={setBacklogQuadrant}
              filterCadence={backlogCadence}
              onCadenceChange={setBacklogCadence}
              onSelectTask={(task) => setModalState({ mode: 'edit', task })}
              onPullToBoard={handlePullToBoard}
              onOpenDuplicateModal={handleOpenDuplicateModal}
              onOpenCreateBacklog={() => handleOpenCreateModal('BACKLOG')}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              tasks={historyPagination.items}
              totalCount={historyPagination.totalCount}
              page={historyPagination.page}
              totalPages={historyPagination.totalPages}
              pageSize={settings.pageSize}
              onPageChange={setHistoryPage}
              onPageSizeChange={(sz) => setSettings({ ...settings, pageSize: sz })}
              searchQuery={historySearch}
              onSearchChange={setHistorySearch}
              filterOutcome={historyOutcome}
              onOutcomeChange={setHistoryOutcome}
              filterQuadrant={historyQuadrant}
              onQuadrantChange={setHistoryQuadrant}
              filterCadence={historyCadence}
              onCadenceChange={setHistoryCadence}
              archivedDoneCount={historyStats.archivedDoneCount}
              archivedCancelledCount={historyStats.archivedCancelledCount}
              onSelectTask={(task) => setModalState({ mode: 'edit', task })}
              onRestoreTask={handleRestoreFromHistory}
              onDeletePermanent={handleDeleteTask}
              onPurgeHistory={handlePurgeHistory}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={setSettings}
              allTasks={tasks}
              onArchiveStatusToHistory={handleArchiveStatusToHistory}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </div>
      </main>

      {/* Shared Create / Edit / Duplicate Modal */}
      {modalState && (
        <TaskModal
          mode={modalState.mode}
          initialTask={modalState.task}
          usedTskNumbers={usedTskNumbers}
          onClose={() => setModalState(null)}
          onSave={handleSaveModalTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-[#FF4D12]/45 bg-[#141414] px-4 py-2.5 text-xs font-mono-tech text-white shadow-2xl">
          <Sparkles className="w-3.5 h-3.5 text-[#FF4D12]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}