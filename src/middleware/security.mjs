import { MemoryRateLimitStore, DEFAULT_RATE_LIMIT_TIERS } from '../../foundation/security/rate-limiter.mjs';
import { stripControlChars, escapeHtml } from '../../foundation/security/input-sanitizer.mjs';
import { generateCsrfToken, verifyCsrfToken } from '../../foundation/security/csrf.mjs';
import { config } from '../config.mjs';

const rateLimitStore = new MemoryRateLimitStore({ maxEntries: 10000 });

export async function rateLimitMiddleware(req, res, tierName = 'apiPublic') {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
  const tier = DEFAULT_RATE_LIMIT_TIERS[tierName] || DEFAULT_RATE_LIMIT_TIERS.apiPublic;
  const key = `${tierName}:${ip}`;

  const result = await rateLimitStore.consume(key, tier.maxAttempts, tier.windowSeconds, tier.lockoutSeconds);
  if (!result.allowed) {
    res.writeHead(429, {
      'Content-Type': 'application/json',
      'Retry-After': String(result.retryAfterSeconds)
    });
    res.end(JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfterSeconds: result.retryAfterSeconds
    }));
    return false;
  }
  return true;
}

export function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

export function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const name = parts.shift().trim();
      const value = decodeURIComponent(parts.join('='));
      list[name] = value;
    });
  }
  return list;
}

export function setCookie(res, name, value, options = {}) {
  const maxAge = options.maxAge ?? 86400 * 30;
  const path = options.path || '/';
  const httpOnly = options.httpOnly !== false ? '; HttpOnly' : '';
  const secure = config.cookieSecure ? '; Secure' : '';
  const sameSite = options.sameSite ? `; SameSite=${options.sameSite}` : '; SameSite=Lax';
  
  res.setHeader('Set-Cookie', `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=${path}${httpOnly}${secure}${sameSite}`);
}

export async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

