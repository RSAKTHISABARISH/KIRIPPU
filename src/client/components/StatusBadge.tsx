import type { ActionStatus, Priority } from '../../shared/types';
import { priorityLabel, statusLabel } from '../lib/formatters';

export function PriorityBadge({ priority }: { priority: Priority }) { return <span className={`badge badge--priority-${priority}`}>{priorityLabel[priority]}</span>; }
export function StatusBadge({ status }: { status: ActionStatus }) { return <span className={`badge badge--status-${status}`}>{status === 'completed' ? '✓ ' : ''}{statusLabel[status]}</span>; }
