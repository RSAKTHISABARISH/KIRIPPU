import express from 'express';
import documentsRouter from './routes/documents';
import actionsRouter from './routes/actions';
import dashboardRouter from './routes/dashboard';
import chatRouter from './routes/chat';
import { seedDemoData } from './db/seed';

const app = express();

app.use(express.json({ limit: '4.5mb' }));
app.use(express.urlencoded({ extended: true, limit: '4.5mb' }));

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

try {
  seedDemoData();
} catch (_e) {
  // seed errors are non-fatal
}

export default app;
export { app };
