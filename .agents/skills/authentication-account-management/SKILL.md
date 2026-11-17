---
name: authentication-account-management
description: >-
  Guides real server-side authentication, login, configurable registration,
  secure password recovery, email verification, SMTP delivery, RBAC checks, and
  Admin Account Settings. Use when implementing auth endpoints, session
  management, password reset, email integration, or user account settings.
---

# Authentication & Account Management Skill

Use this skill when building or modifying authentication, session handling, password recovery, SMTP integration, or Admin Account Settings.

Reference manual: `docs/AUTHENTICATION-ACCOUNT-MANAGEMENT.md`.

## Non-Negotiable Rules

- **Real Backend Auth Only**: Never build frontend-only login or mock account management. All auth state and changes must persist in the real database (`users`, `user_sessions`, `password_reset_tokens`, `email_verification_tokens`).
- **Additive-Only**: Preserve existing user accounts, sessions, and auth flows when updating an active project.
- **Registration Toggle**: Keep `ALLOW_PUBLIC_REGISTRATION=false` unless the project explicitly requires public registration.
- **Password Security**: Hash with Argon2id or bcrypt (cost >= 12); enforce `config/security-policy.json` password rules; never return or log `password_hash`.
- **Forgot Password**: Check `checkSmtpConfiguration()` before lookup (return `503` if SMTP is disabled/unconfigured), generate 32-byte random tokens (`token-utils.mjs`), store only SHA-256 hash, construct reset URL strictly from `APP_URL` (`buildTrustedAppUrl` in `csrf.mjs`), enforce single-use + short expiry (`PASSWORD_RESET_TTL_MINUTES`), serve reset screens with `Referrer-Policy: no-referrer`, and return a **non-enumerating response** regardless of whether the email exists.
- **Email Transparency**: Read SMTP credentials solely from `.env`. Use `foundation/mail/email-templates.mjs` and never report an email as sent when `SMTP_ENABLED=false` or delivery fails.
- **Account Settings vs. Website Settings**: Implement **Account Settings** inside Admin strictly for the authenticated user's personal profile (name, two-step verified email change via `pending_email`/`target_email`, mobile, avatar, password change verifying current password with `accountPasswordVerify` rate limit + session rotation, revoking other sessions in `user_sessions`)—separate from centralized `website_settings`.

## Verification

- Verify modified auth endpoint checks rate limit, password verification/hash, HTTP-only cookie flags, and RBAC without printing secrets.

