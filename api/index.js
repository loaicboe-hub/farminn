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
    if (req.headers['x-inspect-farminn'] === '1') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        url: req.url,
        headers: req.headers
      }, null, 2));
      return;
    }

    await ensureDatabaseReady();

    // Inspect Vercel headers for original path
    const forwardedPath = req.headers['x-forwarded-uri'] || 
                          req.headers['x-matched-path'] || 
                          req.headers['x-invoke-path'] || 
                          req.headers['x-original-url'] ||
                          req.headers['x-vercel-matched-path'];

    if (forwardedPath && forwardedPath !== '/api' && forwardedPath !== '/api/index.js') {
      req.url = forwardedPath;
    }

    res.setHeader('x-debug-url', req.url);
    res.setHeader('x-debug-forwarded', forwardedPath || 'none');
    res.setHeader('x-debug-keys', Object.keys(req.headers).join(','));

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

