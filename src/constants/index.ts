import {
  Flame,
  CalendarClock,
  Forward,
  Trash2,
} from 'lucide-react';
import type {
  PriorityQuadrant,
  QuadrantMeta,
  DueCadence,
  CadenceMeta,
  BoardStatus,
  TaskStatus,
  AppSettings,
} from '../types';

export const QUADRANTS: Record<PriorityQuadrant, QuadrantMeta> = {
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

export const CADENCES: Record<DueCadence, CadenceMeta> = {
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

export const CADENCE_KEYS: DueCadence[] = ['HOURLY', 'DAILY', 'WEEKLY'];

export const BOARD_STATUSES: Array<{
  id: BoardStatus;
  label: string;
  dot: string;
  accent: string;
}> = [
  { id: 'TODO', label: 'To Do', dot: '#FFFFFF', accent: '#FFFFFF' },
  { id: 'IN_PROGRESS', label: 'In Progress', dot: '#FFA489', accent: '#FFA489' },
  { id: 'DONE', label: 'Done', dot: '#FF4D12', accent: '#FF4D12' },
  { id: 'CANCELLED', label: 'Cancelled', dot: '#A0A0A0', accent: '#A0A0A0' },
];

export const ALL_STATUSES: Array<{ id: TaskStatus; label: string }> = [
  { id: 'BACKLOG', label: 'Backlog' },
  ...BOARD_STATUSES.map(({ id, label }) => ({ id, label })),
  { id: 'HISTORY', label: 'History' },
];

export const CREATE_ALLOWED_STATUSES: Array<{ id: 'TODO' | 'BACKLOG'; label: string }> = [
  { id: 'TODO', label: 'To Do' },
  { id: 'BACKLOG', label: 'Backlog' },
];

export const TASKS_STORAGE_KEY = 'taskpilot_tasks_mock_v1';
export const SETTINGS_STORAGE_KEY = 'taskpilot_settings_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  density: 'comfortable',
  autoSortDone: true,
  pageSize: 12,
};

export const PRISMA_SCHEMA_BLUEPRINT = `enum PriorityQuadrant {
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

