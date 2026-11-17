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

    // Debugging endpoint for Vercel
    if (req.url.includes('/api/debug') || req.headers['x-matched-path']?.includes('/api/debug')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        url: req.url,
        matchedPath: req.headers['x-matched-path'],
        forwardedUri: req.headers['x-forwarded-uri'],
        invokePath: req.headers['x-invoke-path'],
        allHeaders: req.headers
      }, null, 2));
      return;
    }

    // In Vercel rewrites, recover the original requested URL
    const parsed = new URL(req.url, 'http://localhost');
    let originalPath = parsed.searchParams.get('originalPath') || parsed.searchParams.get('__url');

    if (originalPath && originalPath !== '/$1' && originalPath !== '/:slug*' && originalPath !== '/:path*') {
      if (originalPath.startsWith('//')) {
        originalPath = '/' + originalPath.replace(/^\/+/, '');
      }
      parsed.searchParams.delete('originalPath');
      parsed.searchParams.delete('__url');
      const remainingSearch = parsed.searchParams.toString();
      req.url = originalPath + (remainingSearch ? (originalPath.includes('?') ? '&' : '?') + remainingSearch : '');
    } else {
      const hPath = req.headers['x-matched-path'] || 
                    req.headers['x-forwarded-uri'] || 
                    req.headers['x-invoke-path'] || 
                    req.headers['x-now-route-matches'] || 
                    req.headers['x-original-url'];
      if (hPath && hPath !== '/api/index.js' && hPath !== '/api' && !hPath.startsWith('/api/index.js')) {
        const search = parsed.search;
        req.url = hPath + (search && !hPath.includes('?') ? search : '');
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

