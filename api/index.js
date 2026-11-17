import app, { ensureDatabaseReady } from '../server.mjs';

export default async function handler(req, res) {
  try {
    await ensureDatabaseReady();
    return await app(req, res);
  } catch (err) {
    console.error('[FARMINN Vercel Handler Uncaught Error]', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'FUNCTION_INVOCATION_FAILED',
        message: err.message
      }));
    }
  }
}
