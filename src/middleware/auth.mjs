import { db } from '../db/index.mjs';
import { generateOpaqueToken, hashTokenSha256 } from '../../foundation/security/token-utils.mjs';
import { parseCookies, setCookie } from './security.mjs';
import { config } from '../config.mjs';

export async function getSessionUser(req) {
  const cookies = parseCookies(req);
  const sessionToken = cookies[config.authCookieName];
  if (!sessionToken) return null;

  const tokenHash = hashTokenSha256(sessionToken);

  const query = `
    SELECT u.id, u.full_name, u.email, u.mobile_number, u.account_type, u.preferred_language,
           r.slug as role_slug, r.name as role_name,
           s.id as session_id, s.expires_at
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    JOIN roles r ON u.role_id = r.id
    WHERE s.token_hash = $1
      AND (s.revoked_at IS NULL OR s.revoked_at = '')
      AND datetime(s.expires_at) > datetime('now')
      AND u.is_active = 1
  `;

  try {
    const res = await db.query(query, [tokenHash]);
    if (res.rowCount === 0) return null;
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching session user:', err.message);
    return null;
  }
}

export async function createSession(userId, rememberMe = false, req = null) {
  const { rawToken, tokenHash } = generateOpaqueToken(32);
  const sessionId = generateOpaqueToken(16).tokenHash;

  const ttlSeconds = rememberMe ? 86400 * 30 : 86400 * 2;
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  const ip = req?.headers['x-forwarded-for']?.split(',')[0].trim() || req?.socket?.remoteAddress || '127.0.0.1';
  const ua = req?.headers['user-agent'] || 'Unknown';

  await db.query(
    `INSERT INTO user_sessions (id, user_id, token_hash, ip_address, user_agent, remember_me, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [sessionId, userId, tokenHash, ip, ua, rememberMe ? 1 : 0, expiresAt]
  );

  return { rawToken, expiresAt, ttlSeconds };
}

export async function revokeSession(sessionToken) {
  if (!sessionToken) return;
  const tokenHash = hashTokenSha256(sessionToken);
  await db.query(
    "UPDATE user_sessions SET revoked_at = datetime('now') WHERE token_hash = $1",
    [tokenHash]
  );
}

export function requireRole(allowedRoles = []) {
  return (user) => {
    if (!user) return false;
    if (user.role_slug === 'super_admin') return true;
    return allowedRoles.includes(user.role_slug);
  };
}

