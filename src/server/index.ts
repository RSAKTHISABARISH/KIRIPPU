import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { app } from './app';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const port = Number(process.env.PORT || 3000);

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ root: projectRoot, server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
      try {
        const html = await vite.transformIndexHtml(req.originalUrl, await import('node:fs/promises').then((fs) => fs.readFile(path.join(projectRoot, 'index.html'), 'utf-8')));
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
  } else {
    app.use(express.static(path.join(projectRoot, 'dist')));
    app.use((_req, res) => res.sendFile(path.join(projectRoot, 'dist', 'index.html')));
  }
  app.listen(port, '0.0.0.0', () => console.log(`KURIPPU listening on http://0.0.0.0:${port}`));
}

void start();
