import 'dotenv/config';
import express from 'express';
import documentsRouter from './routes/documents';
import actionsRouter from './routes/actions';
import dashboardRouter from './routes/dashboard';
import chatRouter from './routes/chat';
import { seedDemoData } from './db/seed';

const app = express();

// Handle body parsing safely across both local server and serverless functions
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    return next();
  }
  return express.json({ limit: '4.5mb' })(req, res, next);
});

app.get('/api', (_req, res) => res.json({ ok: true, service: 'kurippu', mode: process.env.GEMINI_API_KEY ? 'gemini-enabled' : 'local-fallback' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'kurippu', mode: process.env.GEMINI_API_KEY ? 'gemini-enabled' : 'local-fallback' }));
app.use('/api/documents', documentsRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/chat', chatRouter);

// Ensure demo data is seeded
seedDemoData();

export default app;
export { app };
