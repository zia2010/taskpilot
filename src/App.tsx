import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  LayoutDashboard,
  Kanban,
  Archive,
  History,
  Settings,
} from 'lucide-react';

import type {
  Task,
  AppSettings,
  NavTab,
  BoardViewMode,
  BacklogViewMode,
  PriorityQuadrant,
  DueCadence,
  ModalState,
  BoardStatus,
  TaskStatus,
  NavItemConfig,
} from './types';

import {
  SETTINGS_STORAGE_KEY,
  DEFAULT_SETTINGS,
} from './constants';
import { THEME_STYLES } from './styles/theme';
import { TaskService } from './services/taskService';
import { DateService } from './services/dateService';
import { createSeedTasks } from './services/seedData';
import {
  supabase,
  mapRowToTask,
  mapTaskToRow,
  type TaskRow,
} from './lib/supabase';

import { usePersistentStorage } from './hooks/usePersistentStorage';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useDashboardTelemetry } from './hooks/useDashboardTelemetry';

import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader } from './components/layout/MobileHeader';
import { Toast } from './components/common/Toast';
import { TaskPilotLogo } from './components/common/TaskPilotLogo';
import { TaskModal } from './components/modal/TaskModal';

import { WelcomeDashboardTab } from './components/tabs/dashboard/WelcomeDashboardTab';
import { JiraBoardTab } from './components/tabs/board/JiraBoardTab';
import { BacklogsTab } from './components/tabs/backlogs/BacklogsTab';
import { HistoryTab } from './components/tabs/history/HistoryTab';
import { SettingsTab } from './components/tabs/settings/SettingsTab';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const tasksRef = useRef<Task[]>(tasks);
  tasksRef.current = tasks;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'live' | 'error'>('syncing');

  const [settings, setSettings] = usePersistentStorage<AppSettings>(
    SETTINGS_STORAGE_KEY,
    () => DEFAULT_SETTINGS
  );

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [boardView, setBoardView] = useState<BoardViewMode>('kanban');
  const [backlogView, setBacklogView] = useState<BacklogViewMode>('tile');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Board filter & pagination state
  const [boardPage, setBoardPage] = useState<number>(1);
  const [boardSearch, setBoardSearch] = useState<string>('');
  const [boardQuadrant, setBoardQuadrant] = useState<'ALL' | PriorityQuadrant>('ALL');
  const [boardCadence, setBoardCadence] = useState<'ALL' | DueCadence>('ALL');
  const debouncedBoardSearch = useDebouncedValue(boardSearch, 180);

  // Backlog filter & pagination state
  const [backlogPage, setBacklogPage] = useState<number>(1);
  const [backlogSearch, setBacklogSearch] = useState<string>('');
  const [backlogQuadrant, setBacklogQuadrant] = useState<'ALL' | PriorityQuadrant>('ALL');
  const [backlogCadence, setBacklogCadence] = useState<'ALL' | DueCadence>('ALL');
  const debouncedBacklogSearch = useDebouncedValue(backlogSearch, 180);

  // History filter & pagination state
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyOutcome, setHistoryOutcome] = useState<'ALL' | 'DONE' | 'CANCELLED'>('ALL');
  const [historyQuadrant, setHistoryQuadrant] = useState<'ALL' | PriorityQuadrant>('ALL');
  const [historyCadence, setHistoryCadence] = useState<'ALL' | DueCadence>('ALL');
  const debouncedHistorySearch = useDebouncedValue(historySearch, 180);

  // Modal & Toast state
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Update wall clock ticker every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Initial Load from Supabase
  useEffect(() => {
    let isMounted = true;
    async function fetchInitialTasks() {
      setSyncStatus('syncing');
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (isMounted) {
          if (data && data.length > 0) {
            const loadedTasks = (data as TaskRow[]).map(mapRowToTask);
            setTasks(loadedTasks);
          } else {
            // First run on blank table: seed sample tasks into Supabase
            const seedTasks = createSeedTasks();
            setTasks(seedTasks);
            const { error: seedError } = await supabase
              .from('tasks')
              .insert(seedTasks.map(mapTaskToRow));
            if (seedError) {
              console.warn('Initial seed error:', seedError);
            }
          }
          setSyncStatus('live');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Supabase fetch error:', err);
        if (isMounted) {
          // Fallback to demo seed tasks in case table is not ready or network fails
          setTasks(createSeedTasks());
          setSyncStatus('error');
          setIsLoading(false);
          triggerToast('Failed to connect to Supabase. Loaded demo tasks.');
        }
      }
    }

    fetchInitialTasks();
    return () => {
      isMounted = false;
    };
  }, [triggerToast]);

  // Filter setters that reset pagination without cascading effect re-renders
  const handleBoardSearchChange = useCallback((val: string) => {
    setBoardSearch(val);
    setBoardPage(1);
  }, []);

  const handleBoardQuadrantChange = useCallback((val: 'ALL' | PriorityQuadrant) => {
    setBoardQuadrant(val);
    setBoardPage(1);
  }, []);

  const handleBoardCadenceChange = useCallback((val: 'ALL' | DueCadence) => {
    setBoardCadence(val);
    setBoardPage(1);
  }, []);

  const handleBacklogSearchChange = useCallback((val: string) => {
    setBacklogSearch(val);
    setBacklogPage(1);
  }, []);

  const handleBacklogQuadrantChange = useCallback((val: 'ALL' | PriorityQuadrant) => {
    setBacklogQuadrant(val);
    setBacklogPage(1);
  }, []);

  const handleBacklogCadenceChange = useCallback((val: 'ALL' | DueCadence) => {
    setBacklogCadence(val);
    setBacklogPage(1);
  }, []);

  const handleHistorySearchChange = useCallback((val: string) => {
    setHistorySearch(val);
    setHistoryPage(1);
  }, []);

  const handleHistoryOutcomeChange = useCallback((val: 'ALL' | 'DONE' | 'CANCELLED') => {
    setHistoryOutcome(val);
    setHistoryPage(1);
  }, []);

  const handleHistoryQuadrantChange = useCallback((val: 'ALL' | PriorityQuadrant) => {
    setHistoryQuadrant(val);
    setHistoryPage(1);
  }, []);

  const handleHistoryCadenceChange = useCallback((val: 'ALL' | DueCadence) => {
    setHistoryCadence(val);
    setHistoryPage(1);
  }, []);

  const handlePageSizeChange = useCallback(
    (sz: number) => {
      setSettings((prev) => ({ ...prev, pageSize: sz }));
      setBoardPage(1);
      setBacklogPage(1);
      setHistoryPage(1);
    },
    [setSettings]
  );

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

  // Task mutation handlers with optimistic UI updates and Supabase sync
  const handleStatusChange = useCallback(
    async (taskId: string, nextStatus: TaskStatus) => {
      const completedAt = nextStatus === 'DONE' ? new Date().toISOString() : null;
      let originalTask: Task | undefined;

      setTasks((prev) => {
        originalTask = prev.find((t) => t.id === taskId);
        return prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: nextStatus,
                completedAt,
                archivedFrom: null,
                archivedAt: null,
              }
            : t
        );
      });

      if (nextStatus === 'BACKLOG') triggerToast('Moved back to Backlog');
      if (nextStatus === 'DONE') triggerToast('Task marked Done');

      setSyncStatus('syncing');
      try {
        const { error } = await supabase
          .from('tasks')
          .update({
            status: nextStatus,
            completed_at: completedAt,
            archived_from: null,
            archived_at: null,
          })
          .eq('id', taskId);

        if (error) throw error;
        setSyncStatus('live');
      } catch (err) {
        console.error('Status change error:', err);
        setSyncStatus('error');
        triggerToast('Failed to update status in Supabase');
        if (originalTask) {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? (originalTask as Task) : t))
          );
        }
      }
    },
    [triggerToast]
  );

  const handlePullToBoard = useCallback(
    async (task: Task) => {
      const freshDue = DateService.getDefaultDueDate(task.cadence);
      let originalTask: Task | undefined;

      setTasks((prev) => {
        originalTask = prev.find((t) => t.id === task.id);
        return prev.map((t) =>
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
        );
      });

      triggerToast(`Pulled ${TaskService.formatTskKey(task.tskNumber)} to Board`);

      setSyncStatus('syncing');
      try {
        const { error } = await supabase
          .from('tasks')
          .update({
            status: 'TODO',
            due_at: freshDue,
            completed_at: null,
            archived_from: null,
            archived_at: null,
          })
          .eq('id', task.id);

        if (error) throw error;
        setSyncStatus('live');
      } catch (err) {
        console.error('Pull to board error:', err);
        setSyncStatus('error');
        triggerToast('Failed to pull task in Supabase');
        if (originalTask) {
          setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? (originalTask as Task) : t))
          );
        }
      }
    },
    [triggerToast]
  );

  const handleArchiveStatusToHistory = useCallback(
    async (sourceStatuses: BoardStatus | BoardStatus[]) => {
      const statusesToArchive = Array.isArray(sourceStatuses)
        ? sourceStatuses
        : [sourceStatuses];
      const nowIso = new Date().toISOString();
      const currentTasks = tasksRef.current;

      const matchingDoneIds = currentTasks
        .filter(
          (t) => statusesToArchive.includes(t.status as BoardStatus) && t.status === 'DONE'
        )
        .map((t) => t.id);
      const matchingCancelledIds = currentTasks
        .filter(
          (t) =>
            statusesToArchive.includes(t.status as BoardStatus) &&
            t.status === 'CANCELLED'
        )
        .map((t) => t.id);

      const matchingCount = matchingDoneIds.length + matchingCancelledIds.length;
      if (matchingCount === 0) return;

      setTasks((prev) =>
        prev.map((t) =>
          statusesToArchive.includes(t.status as BoardStatus)
            ? {
                ...t,
                status: 'HISTORY',
                archivedFrom: t.status as 'DONE' | 'CANCELLED',
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

      setSyncStatus('syncing');
      try {
        if (matchingDoneIds.length > 0) {
          const { error: doneErr } = await supabase
            .from('tasks')
            .update({
              status: 'HISTORY',
              archived_from: 'DONE',
              archived_at: nowIso,
            })
            .in('id', matchingDoneIds);
          if (doneErr) throw doneErr;
        }

        if (matchingCancelledIds.length > 0) {
          const { error: cancErr } = await supabase
            .from('tasks')
            .update({
              status: 'HISTORY',
              archived_from: 'CANCELLED',
              archived_at: nowIso,
            })
            .in('id', matchingCancelledIds);
          if (cancErr) throw cancErr;
        }
        setSyncStatus('live');
      } catch (err) {
        console.error('Archive to history error:', err);
        setSyncStatus('error');
        triggerToast('Failed to archive tasks to Supabase');
        setTasks(currentTasks);
      }
    },
    [triggerToast]
  );

  const handleRestoreFromHistory = useCallback(
    async (task: Task, targetStatus: 'TODO' | 'BACKLOG' = 'TODO') => {
      const freshDue = DateService.getDefaultDueDate(task.cadence);
      let originalTask: Task | undefined;

      setTasks((prev) => {
        originalTask = prev.find((t) => t.id === task.id);
        return prev.map((t) =>
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
        );
      });

      triggerToast(
        `Restored ${TaskService.formatTskKey(task.tskNumber)} to ${
          targetStatus === 'BACKLOG' ? 'Backlog' : 'Board'
        }`
      );

      setSyncStatus('syncing');
      try {
        const { error } = await supabase
          .from('tasks')
          .update({
            status: targetStatus,
            due_at: freshDue,
            completed_at: null,
            archived_from: null,
            archived_at: null,
          })
          .eq('id', task.id);

        if (error) throw error;
        setSyncStatus('live');
      } catch (err) {
        console.error('Restore error:', err);
        setSyncStatus('error');
        triggerToast('Failed to restore task in Supabase');
        if (originalTask) {
          setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? (originalTask as Task) : t))
          );
        }
      }
    },
    [triggerToast]
  );

  const handlePurgeHistory = useCallback(
    async () => {
      const currentTasks = tasksRef.current;
      setTasks((prev) => prev.filter((t) => t.status !== 'HISTORY'));
      triggerToast('Permanently purged all History records');

      setSyncStatus('syncing');
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('status', 'HISTORY');

        if (error) throw error;
        setSyncStatus('live');
      } catch (err) {
        console.error('Purge error:', err);
        setSyncStatus('error');
        triggerToast('Failed to purge history in Supabase');
        setTasks(currentTasks);
      }
    },
    [triggerToast]
  );

  const handleResetDemoData = useCallback(
    async () => {
      const currentTasks = tasksRef.current;
      const newSeed = createSeedTasks();
      setTasks(newSeed);
      triggerToast('Reset workspace to demo dataset');

      setSyncStatus('syncing');
      try {
        // Clear all tasks
        const { error: delErr } = await supabase
          .from('tasks')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        if (delErr) throw delErr;

        const { error: insErr } = await supabase
          .from('tasks')
          .insert(newSeed.map(mapTaskToRow));
        if (insErr) throw insErr;

        setSyncStatus('live');
      } catch (err) {
        console.error('Reset demo data error:', err);
        setSyncStatus('error');
        triggerToast('Failed to reset demo dataset in Supabase');
        setTasks(currentTasks);
      }
    },
    [triggerToast]
  );

  const handleOpenCreateModal = useCallback((defaultStatus: 'TODO' | 'BACKLOG' = 'TODO') => {
    setModalState({
      mode: 'create',
      task: {
        tskNumber: TaskService.suggestNextTskNumber(usedTskNumbers),
        status: defaultStatus === 'BACKLOG' ? 'BACKLOG' : 'TODO',
        cadence: 'DAILY',
        quadrant: 'NOT_URGENT_IMPORTANT',
      },
    });
  }, [usedTskNumbers]);

  const handleOpenDuplicateModal = useCallback((task: Task) => {
    setModalState({
      mode: 'duplicate',
      task: {
        ...task,
        tskNumber: TaskService.suggestNextTskNumber(usedTskNumbers),
        title: `${task.title} (I)`,
        status: 'BACKLOG',
      },
    });
  }, [usedTskNumbers]);

  const handleSaveModalTask = useCallback(
    async (savedTask: Task) => {
      const mode = modalState?.mode;
      const isEdit = mode === 'edit';
      setModalState(null);

      // Optimistic state update
      setTasks((prev) => {
        if (isEdit) {
          return prev.map((t) => (t.id === savedTask.id ? savedTask : t));
        }
        return [savedTask, ...prev];
      });

      triggerToast(
        isEdit
          ? `Updated ${TaskService.formatTskKey(savedTask.tskNumber)}`
          : `Created ${TaskService.formatTskKey(savedTask.tskNumber)}`
      );

      setSyncStatus('syncing');
      try {
        if (isEdit) {
          const { error } = await supabase
            .from('tasks')
            .update(mapTaskToRow(savedTask))
            .eq('id', savedTask.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('tasks')
            .insert([mapTaskToRow(savedTask)]);
          if (error) throw error;
        }
        setSyncStatus('live');
      } catch (err) {
        console.error('Save task error:', err);
        setSyncStatus('error');
        triggerToast(`Failed to sync ${TaskService.formatTskKey(savedTask.tskNumber)} to Supabase`);
        if (!isEdit) {
          setTasks((prev) => prev.filter((t) => t.id !== savedTask.id));
        }
      }
    },
    [modalState?.mode, triggerToast]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      const currentTasks = tasksRef.current;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setModalState(null);
      triggerToast('Ticket deleted');

      setSyncStatus('syncing');
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
        setSyncStatus('live');
      } catch (err) {
        console.error('Delete task error:', err);
        setSyncStatus('error');
        triggerToast('Failed to delete ticket in Supabase');
        setTasks(currentTasks);
      }
    },
    [triggerToast]
  );

  const handleJumpToBoard = useCallback((quadrant: 'ALL' | PriorityQuadrant = 'ALL') => {
    setBoardQuadrant(quadrant);
    setBoardPage(1);
    setActiveTab('board');
  }, []);

  const navItems: NavItemConfig[] = useMemo(
    () => [
      {
        id: 'dashboard',
        label: 'Dashboard',
        shortLabel: 'Dashboard',
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
    ],
    [
      telemetry.overdueTasks.length,
      telemetry.total,
      telemetry.backlogCount,
      telemetry.historyCount,
    ]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center p-4">
        <style>{THEME_STYLES}</style>
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="relative flex items-center justify-center shadow-2xl shadow-[#FF4D12]/30 rounded-2xl animate-pulse">
            <TaskPilotLogo size={64} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-white">TaskPilot</h1>
            <p className="text-xs font-mono-tech text-[#FFA489] mt-1">CONNECTING TO SUPABASE...</p>
          </div>
          <div className="w-48 h-1.5 bg-[#222222] rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[#FF4D12] rounded-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col lg:flex-row w-full overflow-x-hidden">
      <style>{THEME_STYLES}</style>

      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navItems={navItems}
        telemetry={telemetry}
        syncStatus={syncStatus}
        onOpenCreate={handleOpenCreateModal}
      />

      {/* Mobile Top Header */}
      <MobileHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        navItems={navItems}
        onOpenCreate={handleOpenCreateModal}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 lg:pl-64 w-full min-w-0 overflow-x-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full min-w-0">
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
              onPageSizeChange={handlePageSizeChange}
              boardView={boardView}
              onBoardViewChange={setBoardView}
              searchQuery={boardSearch}
              onSearchChange={handleBoardSearchChange}
              filterQuadrant={boardQuadrant}
              onQuadrantChange={handleBoardQuadrantChange}
              filterCadence={boardCadence}
              onCadenceChange={handleBoardCadenceChange}
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
              onPageSizeChange={handlePageSizeChange}
              backlogView={backlogView}
              onBacklogViewChange={setBacklogView}
              searchQuery={backlogSearch}
              onSearchChange={handleBacklogSearchChange}
              filterQuadrant={backlogQuadrant}
              onQuadrantChange={handleBacklogQuadrantChange}
              filterCadence={backlogCadence}
              onCadenceChange={handleBacklogCadenceChange}
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
              onPageSizeChange={handlePageSizeChange}
              searchQuery={historySearch}
              onSearchChange={handleHistorySearchChange}
              filterOutcome={historyOutcome}
              onOutcomeChange={handleHistoryOutcomeChange}
              filterQuadrant={historyQuadrant}
              onQuadrantChange={handleHistoryQuadrantChange}
              filterCadence={historyCadence}
              onCadenceChange={handleHistoryCadenceChange}
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
              syncStatus={syncStatus}
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
      <Toast message={toastMessage} />
    </div>
  );
}
