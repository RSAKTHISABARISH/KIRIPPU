import express, { type Request, type Response, type NextFunction } from 'express';
import documentsRouter from './routes/documents';
import actionsRouter from './routes/actions';
import dashboardRouter from './routes/dashboard';
import chatRouter from './routes/chat';
import { seedDemoData } from './db/seed';

const app = express();

// Only parse JSON bodies — never consume multipart streams (multer handles those)
app.use((req: Request, res: Response, next: NextFunction) => {
  const ct = req.headers['content-type'] ?? '';
  if (ct.includes('multipart/form-data') || ct.includes('application/octet-stream')) {
    return next();
  }
  return express.json({ limit: '4.5mb' })(req, res, next);
});

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'kurippu', mode: process.env.GEMINI_API_KEY ? 'gemini-enabled' : 'local-fallback' })
);
app.get('/api', (_req, res) =>
  res.json({ ok: true, service: 'kurippu', mode: process.env.GEMINI_API_KEY ? 'gemini-enabled' : 'local-fallback' })
);
app.use('/api/documents', documentsRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/chat', chatRouter);

// Global error handler — always return JSON so the client can parse it
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || 'Internal server error.';
  console.error('[kurippu error]', err);
  res.status(status).json({ error: message });
});

try {
  seedDemoData();
} catch (_e) {
  // seed errors are non-fatal
}

export default app;
export { app };
