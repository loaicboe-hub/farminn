import app from '../server.mjs';
import { runMigrations } from '../src/db/migrate.mjs';

let isReady = false;
let initPromise = null;

async function ensureDatabaseReady() {
  if (isReady) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        console.log('[FARMINN Vercel Function] Initializing database...');
        await runMigrations();
        isReady = true;
        console.log('[FARMINN Vercel Function] Database ready.');
      } catch (err) {
        console.error('[FARMINN Vercel Function DB Error]', err);
        // Mark as ready so serverless requests do not hang
        isReady = true;
      }
    })();
  }
  await initPromise;
}

export default async function handler(req, res) {
  try {
    await ensureDatabaseReady();

    // In Vercel rewrites, adjust URL if needed
    if (req.url === '/api/index.js' || req.url.startsWith('/api/index.js?')) {
      const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'] || req.headers['x-invoke-path'];
      if (forwardedUri) {
        req.url = forwardedUri;
      }
    }

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
