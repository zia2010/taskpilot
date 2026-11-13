import type { PriorityQuadrant, Task, TaskStatus } from '../types';
import { QUADRANTS } from '../constants';

export const TaskService = {
  generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  normalizeTskNumber(raw: string | number | null | undefined): string | null {
    const digits = String(raw ?? '').replace(/\D/g, '');
    if (!digits) return null;
    const num = Number.parseInt(digits, 10);
    if (Number.isNaN(num) || num < 0 || num > 9999) return null;
    return String(num).padStart(4, '0');
  },

  formatTskKey(tskNumber: string | undefined): string {
    return `TSK-${String(tskNumber || '0000').padStart(4, '0')}`;
  },

  suggestNextTskNumber(usedNumbers: string[] = []): string {
    const used = new Set(usedNumbers.map((n) => String(n).padStart(4, '0')));
    for (let n = 1; n <= 9999; n += 1) {
      const candidate = String(n).padStart(4, '0');
      if (!used.has(candidate)) return candidate;
    }
    return '0000';
  },

  getQuadrantFromFlags(urgent: boolean, important: boolean): PriorityQuadrant {
    if (urgent && important) return 'URGENT_IMPORTANT';
    if (!urgent && important) return 'NOT_URGENT_IMPORTANT';
    if (urgent && !important) return 'URGENT_NOT_IMPORTANT';
    return 'NOT_URGENT_NOT_IMPORTANT';
  },

  isTaskOverdue(task: Task, nowMs: number): boolean {
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

  sortTasks(list: Task[], autoSortDone = true): Task[] {
    return [...list].sort((a, b) => {
      if (autoSortDone) {
        const rank = (s: TaskStatus): number =>
          s === 'CANCELLED' ? 2 : s === 'DONE' ? 1 : 0;
        if (rank(a.status) !== rank(b.status)) return rank(a.status) - rank(b.status);
      }
      const qA = QUADRANTS[a.quadrant]?.weight ?? 9;
      const qB = QUADRANTS[b.quadrant]?.weight ?? 9;
      if (qA !== qB) return qA - qB;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });
  },
};

