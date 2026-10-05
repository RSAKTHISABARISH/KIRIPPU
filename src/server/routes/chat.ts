import { Router } from 'express';
import { db } from '../db/client';
import { chatRequestSchema } from '../validation/chatSchema';
import { answerFromDocument } from '../services/sourceGroundedChat';

const router = Router();
router.post('/', (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Ask a question about this document.' });
  const document = db.getDocument(parsed.data.documentId);
  if (!document) return res.status(404).json({ error: 'Document not found.' });
  return res.json(answerFromDocument(document, parsed.data.question));
});
export default router;
