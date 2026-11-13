import { useMemo } from 'react';
import type {
  Task,
  DashboardTelemetry,
  PriorityQuadrant,
  WeeklyDayPoint,
  CadenceBreakdownItem,
} from '../types';
import { CADENCE_KEYS, CADENCES } from '../constants';
import { TaskService } from '../services/taskService';
import { DateService } from '../services/dateService';

export function useDashboardTelemetry(tasks: Task[], nowMs: number): DashboardTelemetry {
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

    const byQuadrant: Record<PriorityQuadrant, Task[]> = {
      URGENT_IMPORTANT: boardTasks.filter(
        (t) =>
          t.quadrant === 'URGENT_IMPORTANT' &&
          (t.status === 'TODO' || t.status === 'IN_PROGRESS')
      ),
      NOT_URGENT_IMPORTANT: boardTasks.filter(
        (t) =>
          t.quadrant === 'NOT_URGENT_IMPORTANT' &&
          (t.status === 'TODO' || t.status === 'IN_PROGRESS')
      ),
      URGENT_NOT_IMPORTANT: boardTasks.filter(
        (t) =>
          t.quadrant === 'URGENT_NOT_IMPORTANT' &&
          (t.status === 'TODO' || t.status === 'IN_PROGRESS')
      ),
      NOT_URGENT_NOT_IMPORTANT: boardTasks.filter(
        (t) =>
          t.quadrant === 'NOT_URGENT_NOT_IMPORTANT' &&
          (t.status === 'TODO' || t.status === 'IN_PROGRESS')
      ),
    };

    const weeklyDays: WeeklyDayPoint[] = Array.from({ length: 7 }, (_, i) => {
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
      (t) =>
        t.completedAt !== null &&
        new Date(t.completedAt).getTime() <= new Date(t.dueAt).getTime()
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

    const cadenceBreakdown: CadenceBreakdownItem[] = CADENCE_KEYS.map((cadKey) => {
      const subset = boardTasks.filter(
        (t) => t.cadence === cadKey && t.status !== 'CANCELLED'
      );
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
      q1Active: byQuadrant.URGENT_IMPORTANT,
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

