import { Router } from 'express';
import { db } from '../db/client';
import { actionPatchSchema } from '../validation/chatSchema';
import { refreshDerivedStatuses, completionPercentage } from '../services/dependencyEngine';

const router = Router();

router.patch('/:id', (req, res) => {
  const parsed = actionPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'That action update is not valid.' });
  const found = db.findAction(req.params.id);
  if (!found) return res.status(404).json({ error: 'Action not found.' });
  const action = db.updateAction(req.params.id, parsed.data);
  refreshDerivedStatuses(found.document);
  return res.json({ action, documentId: found.document.id, completion: completionPercentage(found.document) });
});

export default router;
