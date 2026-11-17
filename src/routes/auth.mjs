import { db } from '../db/index.mjs';
import { hashPassword, verifyPassword } from '../utils/auth-crypto.mjs';
import { validatePasswordStrength, generateOpaqueToken } from '../../foundation/security/token-utils.mjs';
import { normalizeEmail, stripControlChars, escapeHtml } from '../../foundation/security/input-sanitizer.mjs';
import { getSessionUser, createSession, revokeSession } from '../middleware/auth.mjs';
import { rateLimitMiddleware, parseJsonBody, setCookie, parseCookies } from '../middleware/security.mjs';
import { config } from '../config.mjs';

export async function handleAuthRoutes(req, res, pathname) {
  // 1. GET /api/auth/me
  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const user = await getSessionUser(req);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user: user || null }));
    return true;
  }

  // 2. POST /api/auth/login
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const allowed = await rateLimitMiddleware(req, res, 'login');
    if (!allowed) return true;

    try {
      const body = await parseJsonBody(req);
      const email = normalizeEmail(body.email);
      const password = String(body.password || '');
      const rememberMe = Boolean(body.rememberMe);

      if (!email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email and password are required' }));
        return true;
      }

      const userRes = await db.query(
        `SELECT u.id, u.full_name, u.email, u.password_hash, u.is_active, u.account_type,
                r.slug as role_slug, r.name as role_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.email = $1`,
        [email]
      );

      if (userRes.rowCount === 0) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email or password' }));
        return true;
      }

      const user = userRes.rows[0];
      if (Number(user.is_active) !== 1) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'This account has been deactivated. Please contact support.' }));
        return true;
      }

      const validPass = verifyPassword(password, user.password_hash);
      if (!validPass) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email or password' }));
        return true;
      }

      // Update last login
      await db.query("UPDATE users SET last_login_at = datetime('now') WHERE id = $1", [user.id]);

      // Create session
      const { rawToken, ttlSeconds } = await createSession(user.id, rememberMe, req);
      setCookie(res, config.authCookieName, rawToken, { maxAge: ttlSeconds });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          account_type: user.account_type,
          role_slug: user.role_slug,
          role_name: user.role_name
        }
      }));
      return true;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return true;
    }
  }

  // 3. POST /api/auth/register
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    const allowed = await rateLimitMiddleware(req, res, 'publicForms');
    if (!allowed) return true;

    try {
      const body = await parseJsonBody(req);
      const fullName = stripControlChars(body.fullName);
      const email = normalizeEmail(body.email);
      const password = String(body.password || '');
      const mobile = stripControlChars(body.mobile);
      const accountType = ['buyer', 'farm_owner', 'farm_manager', 'supplier', 'worker'].includes(body.accountType)
        ? body.accountType
        : 'buyer';

      if (!fullName || !email || !password || !mobile) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'All fields (Name, Email, Mobile, Password) are required' }));
        return true;
      }

      const passCheck = validatePasswordStrength(password, { minLength: 8 });
      if (!passCheck.valid) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Password does not meet security requirements (must be at least 8 chars with uppercase, lowercase and numbers)' }));
        return true;
      }

      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rowCount > 0) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'An account with this email address already exists' }));
        return true;
      }

      // Find matching role
      const roleSlug = accountType === 'farm_owner' ? 'farm_owner'
        : accountType === 'farm_manager' ? 'farm_manager'
        : accountType === 'supplier' ? 'supplier'
        : 'buyer';

      const roleRes = await db.query('SELECT id FROM roles WHERE slug = $1', [roleSlug]);
      const roleId = roleRes.rows[0]?.id || 1;

      const passHash = hashPassword(password);
      const insertRes = await db.query(
        `INSERT INTO users (full_name, email, mobile_number, password_hash, role_id, account_type, preferred_language, is_active, email_verified_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'en', 1, datetime('now'))`,
        [fullName, email, mobile, passHash, roleId, accountType]
      );

      const newUserId = insertRes.lastInsertRowid || (await db.query('SELECT id FROM users WHERE email = $1', [email])).rows[0].id;

      // Auto login
      const { rawToken, ttlSeconds } = await createSession(newUserId, true, req);
      setCookie(res, config.authCookieName, rawToken, { maxAge: ttlSeconds });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: {
          id: newUserId,
          full_name: fullName,
          email,
          account_type: accountType,
          role_slug: roleSlug
        }
      }));
      return true;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      return true;
    }
  }

  // 4. POST /api/auth/logout
  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    const cookies = parseCookies(req);
    const token = cookies[config.authCookieName];
    if (token) {
      await revokeSession(token);
    }
    setCookie(res, config.authCookieName, '', { maxAge: -1 });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return true;
  }

  // 5. POST /api/auth/forgot-password
  if (req.method === 'POST' && pathname === '/api/auth/forgot-password') {
    const allowed = await rateLimitMiddleware(req, res, 'passwordReset');
    if (!allowed) return true;

    const body = await parseJsonBody(req);
    const email = normalizeEmail(body.email);

    // Non-enumerating response
    if (email) {
      const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userRes.rowCount > 0) {
        const { rawToken, tokenHash } = generateOpaqueToken(32);
        const expiresAt = new Date(Date.now() + 1800 * 1000).toISOString();
        await db.query(
          `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
          [userRes.rows[0].id, tokenHash, expiresAt]
        );
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'If an account matching this email exists, password reset instructions have been issued.'
    }));
    return true;
  }

  return false;
}

