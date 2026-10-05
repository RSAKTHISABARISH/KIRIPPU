import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../src/server/app';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
