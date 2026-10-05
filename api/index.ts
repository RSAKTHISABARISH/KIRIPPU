import app from '../src/server/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Restore the original URL so Express sub-router paths work correctly
  if (!req.url) req.url = '/';
  return app(req as any, res as any);
}
