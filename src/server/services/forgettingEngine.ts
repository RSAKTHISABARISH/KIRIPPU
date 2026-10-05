import type { DocumentRecord, ForgettingItem } from '../../shared/types';
import { isPastDeadline, refreshDerivedStatuses } from './dependencyEngine';

export function buildForgettingItems(documents: DocumentRecord[]): ForgettingItem[] {
  const items: ForgettingItem[] = [];
  for (const document of documents) {
    refreshDerivedStatuses(document);
    for (const action of document.actions) {
      if (isPastDeadline(action)) {
        items.push({ kind: 'overdue', title: action.title, detail: `${document.title} · deadline passed`, actionId: action.id, priority: 'critical' });
      } else if (action.status === 'blocked') {
        const names = action.dependsOn.map((id) => document.actions.find((item) => item.id === id)?.title).filter(Boolean).slice(0, 2).join(' + ');
        items.push({ kind: 'blocked', title: action.title, detail: `Waiting on ${names || 'an incomplete prerequisite'}`, actionId: action.id, priority: action.priority });
      } else if (action.deadline) {
        const days = Math.ceil((new Date(action.deadline).getTime() - Date.now()) / 86400000);
        if (days >= 0 && days <= 5 && action.status !== 'completed') {
          items.push({ kind: 'upcoming', title: action.title, detail: days === 0 ? 'Due today' : `Due in ${days} day${days === 1 ? '' : 's'}`, actionId: action.id, priority: action.priority });
        }
      }
      if (action.requiredDocuments.length && action.status !== 'completed') {
        items.push({ kind: 'missing_document', title: `${action.requiredDocuments[0]} for ${action.title}`, detail: 'Required document is still attached to this action', actionId: action.id, priority: action.priority });
      }
      if ((action.priority === 'critical' || action.priority === 'high') && action.status !== 'completed' && action.dependsOn.length === 0) {
        items.push({ kind: 'high_risk', title: action.title, detail: 'High-impact action has no completed trail yet', actionId: action.id, priority: action.priority });
      }
    }
  }
  return items.slice(0, 12);
}
