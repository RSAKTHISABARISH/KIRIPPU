import type { ActionItem, Priority, ActionStatus } from '../../shared/types';

export const priorityLabel: Record<Priority, string> = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
export const statusLabel: Record<ActionStatus, string> = { pending: 'Ready', in_progress: 'In progress', completed: 'Completed', blocked: 'Blocked', overdue: 'Overdue' };

export function formatDate(value: string | null | undefined, fallback = 'Date requires confirmation'): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function relativeDeadline(action: ActionItem): string {
  if (!action.deadline) return 'Date requires confirmation';
  const days = Math.ceil((new Date(action.deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 8) return `Due in ${days} days`;
  return formatDate(action.deadline);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function typeLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}
