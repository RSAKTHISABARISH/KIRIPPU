import app from '../src/server/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel rewrites strip the path — restore it so Express can route correctly
  const originalUrl = req.url ?? '/';
  // req.url is already set correctly by Vercel when using :path* in rewrites
  return (app as any)(req, res);
}
