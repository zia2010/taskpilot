import type { LucideIcon } from 'lucide-react';

export type PriorityQuadrant =
  | 'URGENT_IMPORTANT'
  | 'NOT_URGENT_IMPORTANT'
  | 'URGENT_NOT_IMPORTANT'
  | 'NOT_URGENT_NOT_IMPORTANT';

export type DueCadence = 'HOURLY' | 'DAILY' | 'WEEKLY';

export type BoardStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export type TaskStatus = 'BACKLOG' | BoardStatus | 'HISTORY';

export type NavTab = 'dashboard' | 'board' | 'backlogs' | 'history' | 'settings';

export type BoardViewMode = 'kanban' | 'list';

export type BacklogViewMode = 'tile' | 'list';

export type CardDensity = 'comfortable' | 'compact';

export interface Task {
  id: string;
  tskNumber: string;
  title: string;
  description: string;
  quadrant: PriorityQuadrant;
  status: TaskStatus;
  cadence: DueCadence;
  dueAt: string;
  completedAt: string | null;
  archivedFrom: 'DONE' | 'CANCELLED' | null;
  archivedAt: string | null;
  createdAt: string;
}

export interface AppSettings {
  density: CardDensity;
  autoSortDone: boolean;
  pageSize: number;
}

export interface QuadrantMeta {
  id: PriorityQuadrant;
  shortLabel: string;
  label: string;
  sublabel: string;
  description: string;
  weight: number;
  urgent: boolean;
  important: boolean;
  icon: LucideIcon;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
}

export interface CadenceMeta {
  id: DueCadence;
  label: string;
  short: string;
  accent: string;
  bg: string;
  border: string;
}

export interface DueBadgeInfo {
  text: string;
  isOverdue: boolean;
  tone: 'danger' | 'warning' | 'normal' | 'muted';
}

export interface WeeklyDayPoint {
  label: string;
  dateNum: number;
  completedCount: number;
  plannedCount: number;
  isToday: boolean;
}

export interface CadenceBreakdownItem extends CadenceMeta {
  total: number;
  done: number;
  pct: number;
}

export interface DashboardTelemetry {
  total: number;
  backlogCount: number;
  historyCount: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  cancelledCount: number;
  overdueTasks: Task[];
  byQuadrant: Record<PriorityQuadrant, Task[]>;
  q1Active: Task[];
  weeklyDays: WeeklyDayPoint[];
  weeklyCompletedTotal: number;
  weeklyPlannedTotal: number;
  weeklyCompletionPct: number;
  onTimeRatePct: number;
  bestDay: WeeklyDayPoint;
  avgDailyCompleted: string;
  cadenceBreakdown: CadenceBreakdownItem[];
}

export interface ModalState {
  mode: 'create' | 'edit' | 'duplicate';
  task: Partial<Task> & {
    tskNumber: string;
    status: TaskStatus;
    cadence: DueCadence;
    quadrant: PriorityQuadrant;
  };
}

export interface ChartPoint extends WeeklyDayPoint {
  idx: number;
  x: number;
  yDone: number;
  yPlan: number;
}

export interface NavItemConfig {
  id: NavTab;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  badge: number | null;
  badgeTone?: 'danger' | 'neutral';
}

