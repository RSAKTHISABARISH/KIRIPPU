import type { ActionItem, DocumentRecord, ActionStatus, GraphData } from '../../shared/types';

export function isPastDeadline(action: ActionItem): boolean {
  return Boolean(action.deadline && action.status !== 'completed' && new Date(action.deadline).getTime() < Date.now());
}

export function refreshDerivedStatuses(document: DocumentRecord): void {
  const completedIds = new Set(document.actions.filter((action) => action.status === 'completed').map((action) => action.id));
  for (const action of document.actions) {
    if (action.status === 'completed' || action.status === 'in_progress') continue;
    if (isPastDeadline(action)) {
      action.status = 'overdue';
    } else if (action.dependsOn.some((dependency) => !completedIds.has(dependency))) {
      action.status = 'blocked';
    } else if (action.status === 'blocked') {
      action.status = 'pending';
    }
  }
}

export function completionPercentage(document: DocumentRecord): number {
  if (!document.actions.length) return 0;
  return Math.round((document.actions.filter((action) => action.status === 'completed').length / document.actions.length) * 100);
}

export function buildGraph(document: DocumentRecord): GraphData {
  const columns = new Map<number, ActionItem[]>();
  const depth = (action: ActionItem, seen = new Set<string>()): number => {
    if (seen.has(action.id) || !action.dependsOn.length) return 0;
    seen.add(action.id);
    return Math.min(2, 1 + Math.max(...action.dependsOn.map((id) => {
      const parent = document.actions.find((candidate) => candidate.id === id);
      return parent ? depth(parent, seen) : 0;
    })));
  };
  for (const action of document.actions) {
    const layer = depth(action);
    const existing = columns.get(layer) ?? [];
    existing.push(action);
    columns.set(layer, existing);
  }
  const nodes = [...columns.entries()].flatMap(([layer, actions]) => actions.map((action, index) => ({
    id: action.id,
    label: action.title,
    shortLabel: action.title.length > 24 ? `${action.title.slice(0, 23)}…` : action.title,
    status: action.status,
    priority: action.priority,
    deadline: action.deadline,
    x: 130 + layer * 245,
    y: 80 + index * 115,
  })));
  const edges = document.actions.flatMap((action) => action.dependsOn.map((dependency) => ({
    id: `${dependency}-${action.id}`,
    from: dependency,
    to: action.id,
  })));
  return { nodes, edges };
}

export function dependencyCount(action: ActionItem): number {
  return action.dependsOn.length;
}

export function deriveActionStatus(action: ActionItem, document: DocumentRecord): ActionStatus {
  if (action.status === 'completed' || action.status === 'in_progress') return action.status;
  if (isPastDeadline(action)) return 'overdue';
  const completed = new Set(document.actions.filter((item) => item.status === 'completed').map((item) => item.id));
  return action.dependsOn.some((dependency) => !completed.has(dependency)) ? 'blocked' : 'pending';
}
