# Authentication, Account Management & Email Delivery

Every project built from this foundation must implement **real, server-side authentication connected to the actual database**—never frontend-only state or mock sessions.

---

## 1. Core Authentication Flows

### Login & Password Hashing
- Email and password authentication checked against `users.password_hash` and `users.is_active = true`.
- **Password Hashing Standards**:
  - **Preferred**: Argon2id (`memoryCost >= 65536` KiB, `timeCost >= 3`, `parallelism >= 1`) or PHP `password_hash($pw, PASSWORD_ARGON2ID)`.
  - **Approved Fallback**: bcrypt with `cost >= 12`, or Node built-in `crypto.scrypt` (`N = 16384` or higher, `r = 8`, `p = 1`, 16-byte random salt, constant-time `timingSafeEqual`).
- Never store plain-text or reversible passwords; never serialize `password_hash` in API responses or logs.
- Generic invalid-credentials error message (never leak whether the email exists or whether password vs. account status failed).
- Optional **Remember Me** (`REMEMBER_ME_TTL_SECONDS`) extending session lifetime safely via rotated token hashes in `user_sessions`.
- Protected routes redirect unauthenticated requests cleanly; API endpoints return `401 Unauthorized` / `403 Forbidden`.
- Rate-limited and brute-force protected (`config/security-policy.json`, `foundation/security/rate-limiter.mjs`).

### Configurable Registration
- Controlled by `ALLOW_PUBLIC_REGISTRATION` in `.env` and project config (`false` by default).
- Projects that only need administrator/staff accounts keep public registration **disabled** (return `403`/`404` on registration routes and keep `auth-register.html` disabled).
- When enabled, enforce password policy (`validatePasswordStrength`), email uniqueness, default lowest-privilege role, rate limiting, and email verification if `REQUIRE_EMAIL_VERIFICATION=true`.

### Forgot Password (Complete Secure Recovery)
1. User submits registered email (`POST /api/auth/forgot-password`, rate-limited via `passwordReset` tier).
2. **Pre-Lookup SMTP Check**: Call `checkSmtpConfiguration(process.env)` *before* looking up the account. If SMTP is disabled (`SMTP_ENABLED=false`) or unconfigured, log the operational state internally and return `503 Service Unavailable` with `auth.emailServiceUnavailable`—never claim reset instructions were sent.
3. If SMTP is configured, check whether an active user exists; **always** return the non-enumerating response (`auth.genericResetSent`) to the client regardless of whether the email matched an account.
4. For matching active accounts, generate a 32-byte cryptographically random token (`generateOpaqueToken` in `token-utils.mjs`), store only its SHA-256 hash in `password_reset_tokens` with short expiration (`PASSWORD_RESET_TTL_MINUTES=30`), and construct the reset URL strictly from `APP_URL` via `buildTrustedAppUrl` (never from HTTP `Host` / `X-Forwarded-Host` headers).
5. If SMTP delivery throws at runtime, log the failure on the server (never swallow errors silently or log success).
6. Serve reset pages with `Referrer-Policy: no-referrer` so tokens in links are not leaked via `Referer` headers.
7. On reset submission (`POST /api/auth/reset-password`), verify the token hash exists, is unexpired, and `used_at IS NULL`; update `password_hash`, set `used_at = NOW()`, revoke existing active sessions (`user_sessions`), and log `auth.password.reset_complete`.

### Email Verification & Two-Step Email Changes
- Controlled by `REQUIRE_EMAIL_VERIFICATION`.
- Uses hashed, single-use, time-limited tokens in `email_verification_tokens` (`EMAIL_VERIFICATION_TTL_HOURS=24`, `purpose = 'registration' | 'email_change'`).
- **Two-Step Email Change**: When a user updates their email in Account Settings, verify current password first, store the requested address in `users.pending_email` and `email_verification_tokens.target_email`, and send a verification link to the new address. Keep the existing verified `users.email` active until the verification token is confirmed, then swap atomically and rotate/notify active sessions.

---

## 2. Admin Account Settings (Separate From Website Settings)

Inside the Admin Dashboard, **Account Settings** controls the **currently logged-in user's personal account** (`users` + `user_sessions`), completely separate from **Website Settings** (`website_settings`):

- View current account profile, assigned role, and verification status.
- Edit personal full name and mobile number.
- Edit personal email address via current-password verification + two-step `pending_email` verification.
- Upload/update personal profile picture (validated via `upload-policy.mjs` into `media_items`).
- Change password:
  - Requires **current password verification** (protected by the `accountPasswordVerify` rate-limit tier to prevent in-session brute force).
  - Enforces password policy (`validatePasswordStrength`).
  - Rotates the current session ID (`user_sessions`) and optionally revokes other active sessions; logs `auth.password.change`.
- Manage personal security preferences (`preferred_language`, review recent personal `security_events`).
- **Log Out of Other Active Sessions**: Inspect active rows in `user_sessions` (IP, user agent, last seen) and revoke all rows for `user_id` except the current session ID (`auth.sessions.revoke_others`).

---

## 3. Configurable Email Integration (SMTP)

- Store all SMTP credentials (`SMTP_ENABLED`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM_NAME`, `MAIL_FROM_ADDRESS`) exclusively in `.env`.
- Never hardcode email credentials in source files.
- Use `foundation/mail/email-templates.mjs` for localized 6-language HTML/plaintext emails and `checkSmtpConfiguration()` before claiming delivery.
- Document SMTP prerequisites clearly in deployment steps (`docs/DEPLOYMENT-GUIDE.md`).
