import { createClient } from '@supabase/supabase-js';
import type { Task, PriorityQuadrant, TaskStatus, DueCadence } from '../types';

const defaultUrl = 'https://mvvbzeueownxlkroqquk.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12dmJ6ZXVlb3dueGxrcm9xcXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NDk3MjgsImV4cCI6MjExMDEyNTcyOH0.QEylMzRC6pZI_rcRt2oywX8GwMCehjOkwQnrXEWnWAU';
const defaultSecret = 'taskpilot-personal-2026';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  defaultUrl;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  defaultAnonKey;

const secret =
  import.meta.env.VITE_TASKPILOT_SECRET ||
  import.meta.env.TASKPILOT_SECRET ||
  defaultSecret;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    global: {
      headers: secret ? { 'x-taskpilot-key': secret } : {},
    },
  }
);

export interface TaskRow {
  id: string;
  tsk_number: string;
  title: string;
  description: string;
  quadrant: string;
  status: string;
  cadence: string;
  due_at: string;
  completed_at: string | null;
  archived_from: string | null;
  archived_at: string | null;
  created_at: string;
}

export function mapRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    tskNumber: row.tsk_number,
    title: row.title,
    description: row.description || '',
    quadrant: (row.quadrant || 'NOT_URGENT_IMPORTANT') as PriorityQuadrant,
    status: (row.status || 'TODO') as TaskStatus,
    cadence: (row.cadence || 'DAILY') as DueCadence,
    dueAt: row.due_at || new Date().toISOString(),
    completedAt: row.completed_at || null,
    archivedFrom: (row.archived_from as 'DONE' | 'CANCELLED' | null) || null,
    archivedAt: row.archived_at || null,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapTaskToRow(task: Task): TaskRow {
  return {
    id: task.id,
    tsk_number: task.tskNumber,
    title: task.title,
    description: task.description || '',
    quadrant: task.quadrant,
    status: task.status,
    cadence: task.cadence,
    due_at: task.dueAt,
    completed_at: task.completedAt,
    archived_from: task.archivedFrom,
    archived_at: task.archivedAt,
    created_at: task.createdAt,
  };
}

