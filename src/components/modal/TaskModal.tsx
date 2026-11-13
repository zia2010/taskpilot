import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Task, ModalState, DueCadence, TaskStatus } from '../../types';
import {
  QUADRANTS,
  CADENCES,
  CADENCE_KEYS,
  CREATE_ALLOWED_STATUSES,
  ALL_STATUSES,
} from '../../constants';
import { TaskService } from '../../services/taskService';
import { DateService } from '../../services/dateService';
import { QuadrantBadge } from '../common/QuadrantBadge';

interface TaskModalProps {
  mode: ModalState['mode'];
  initialTask: ModalState['task'];
  usedTskNumbers: string[];
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskModal({
  mode,
  initialTask,
  usedTskNumbers,
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const isNew = mode === 'create' || mode === 'duplicate';
  const initQuad = QUADRANTS[initialTask.quadrant] || QUADRANTS.NOT_URGENT_IMPORTANT;

  const [tskInput, setTskInput] = useState<string>(
    initialTask.tskNumber || TaskService.suggestNextTskNumber(usedTskNumbers)
  );
  const [title, setTitle] = useState<string>(initialTask.title || '');
  const [description, setDescription] = useState<string>(initialTask.description || '');
  const [cadence, setCadence] = useState<DueCadence>(initialTask.cadence || 'DAILY');
  const [dueAtInput, setDueAtInput] = useState<string>(
    DateService.toDateTimeLocalValue(
      initialTask.dueAt || DateService.getDefaultDueDate(initialTask.cadence || 'DAILY')
    )
  );
  const [status, setStatus] = useState<TaskStatus>(
    isNew
      ? initialTask.status === 'BACKLOG'
        ? 'BACKLOG'
        : 'TODO'
      : initialTask.status || 'TODO'
  );
  const [urgent, setUrgent] = useState<boolean>(initQuad.urgent);
  const [important, setImportant] = useState<boolean>(initQuad.important);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const tskInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (mode === 'duplicate' && tskInputRef.current) {
      tskInputRef.current.focus();
      tskInputRef.current.select();
    }
  }, [mode]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
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
        (isNew || String(initialTask.tskNumber).padStart(4, '0') !== normalizedTsk)
    );

  const tskError =
    normalizedTsk === null
      ? 'Enter a valid 4-digit number from 0000 to 9999.'
      : isDuplicateTsk
      ? `TSK-${normalizedTsk} is already assigned to another task.`
      : null;

  const computedQuadrant = TaskService.getQuadrantFromFlags(urgent, important);

  const handleCadenceSelect = (nextCadence: DueCadence) => {
    setCadence(nextCadence);
    setDueAtInput(
      DateService.toDateTimeLocalValue(DateService.getDefaultDueDate(nextCadence))
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || tskError || !normalizedTsk) return;

    const finalStatus: TaskStatus = isNew
      ? status === 'BACKLOG'
        ? 'BACKLOG'
        : 'TODO'
      : status;

    const dueIso = dueAtInput
      ? new Date(dueAtInput).toISOString()
      : DateService.getDefaultDueDate(cadence);

    const isHistory = finalStatus === 'HISTORY';

    onSave({
      id: isNew || !initialTask.id ? TaskService.generateUUID() : initialTask.id,
      tskNumber: normalizedTsk,
      title: title.trim(),
      description: description.trim(),
      quadrant: computedQuadrant,
      status: finalStatus,
      cadence,
      dueAt: dueIso,
      completedAt:
        finalStatus === 'DONE'
          ? initialTask.completedAt || new Date().toISOString()
          : isHistory
          ? initialTask.completedAt || null
          : null,
      archivedFrom: isHistory ? initialTask.archivedFrom || 'DONE' : null,
      archivedAt: isHistory ? initialTask.archivedAt || new Date().toISOString() : null,
      createdAt:
        isNew || !initialTask.createdAt
          ? new Date().toISOString()
          : initialTask.createdAt,
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
            aria-label="Close modal"
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
                value={
                  isNew || !initialTask.id
                    ? 'Auto-generated UUID on save'
                    : initialTask.id
                }
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
                {CADENCE_KEYS.map((cad) => (
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
            {!isNew && initialTask.id ? (
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
                    onClick={() => initialTask.id && onDelete(initialTask.id)}
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

