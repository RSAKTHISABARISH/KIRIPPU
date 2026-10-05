import { Router } from 'express';
import multer from 'multer';
import { db } from '../db/client';
import { processDocument } from '../services/documentProcessor';
import { buildGraph, completionPercentage, refreshDerivedStatuses } from '../services/dependencyEngine';
import { extractText, safeFilename, validateUpload } from '../services/textExtractor';
import { MAX_UPLOAD_BYTES } from '../../shared/constants';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES } });

// Wraps multer to catch parse errors and return proper JSON
function runMulter(req: import('express').Request, res: import('express').Response): Promise<void> {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

router.get('/', (_req, res) => {
  const documents = db.listDocuments().map((document) => { refreshDerivedStatuses(document); return { ...document, rawText: undefined, pages: undefined, completion: completionPercentage(document), actions: document.actions.map((action) => ({ id: action.id, title: action.title, status: action.status, deadline: action.deadline, priority: action.priority })) }; });
  res.json({ documents });
});

router.post('/upload', async (req, res) => {
  try {
    await runMulter(req, res);
  } catch (multerError) {
    const msg = multerError instanceof Error ? multerError.message : 'File upload failed.';
    return res.status(400).json({ error: msg });
  }
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'Choose a document before uploading.' });
  const validationError = validateUpload(file);
  if (validationError) return res.status(400).json({ error: validationError });
  try {
    const extracted = await extractText(file.buffer, file.mimetype);
    const document = await processDocument({ name: file.originalname, safeFilename: safeFilename(file.originalname), mimeType: file.mimetype, size: file.size, ...extracted });
    db.saveDocument(document);
    return res.status(201).json({ document, processing: { mode: document.analysisMode, stages: ['uploading', 'processing', 'extracting', 'analyzing', 'building action plan', 'completed'] } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'We could not process that document. Try a clearer file.';
    return res.status(422).json({ error: message });
  }
});

router.get('/:id', (req, res) => {
  const document = db.getDocument(req.params.id);
  if (!document) return res.status(404).json({ error: 'Document not found.' });
  refreshDerivedStatuses(document);
  return res.json({ document: { ...document, completion: completionPercentage(document) }, graph: buildGraph(document) });
});

router.get('/:id/actions', (req, res) => {
  const document = db.getDocument(req.params.id);
  if (!document) return res.status(404).json({ error: 'Document not found.' });
  refreshDerivedStatuses(document);
  return res.json({ actions: document.actions, completion: completionPercentage(document) });
});

router.get('/:id/graph', (req, res) => {
  const document = db.getDocument(req.params.id);
  if (!document) return res.status(404).json({ error: 'Document not found.' });
  refreshDerivedStatuses(document);
  return res.json(buildGraph(document));
});

export default router;
