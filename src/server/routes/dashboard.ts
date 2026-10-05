import { Router } from 'express';
import { db } from '../db/client';
import { buildForgettingItems } from '../services/forgettingEngine';
import { completionPercentage, isPastDeadline, refreshDerivedStatuses } from '../services/dependencyEngine';
import type { ActionItem } from '../../shared/types';

const router = Router();

router.get('/', (_req, res) => {
  const documents = db.listDocuments();
  documents.forEach(refreshDerivedStatuses);
  const actions = documents.flatMap((document) => document.actions);
  const completed = actions.filter((action) => action.status === 'completed').length;
  const critical = actions.filter((action) => action.priority === 'critical' && action.status !== 'completed').length;
  const overdue = actions.filter(isPastDeadline).length;
  const upcoming = actions.filter((action) => action.deadline && action.status !== 'completed' && !isPastDeadline(action)).length;
  const inProgress = actions.filter((action) => action.status === 'in_progress').length;
  const candidates = actions.filter((action) => action.status !== 'completed').sort((a, b) => {
    const score = (item: ActionItem) => ({ critical: 4, high: 3, medium: 2, low: 1 }[item.priority] ?? 1) + (isPastDeadline(item) ? 5 : 0);
    return score(b) - score(a);
  });
  const recentDocuments = documents.slice(0, 4).map((document) => ({ ...document, rawText: undefined, pages: undefined, completion: completionPercentage(document) }));
  return res.json({ metrics: { critical, upcoming, completed, overdue, inProgress, total: actions.length, completion: actions.length ? Math.round((completed / actions.length) * 100) : 0 }, urgentActions: candidates.slice(0, 5), forgetting: buildForgettingItems(documents), recentDocuments, nextAction: candidates[0] ?? null });
});

export default router;
