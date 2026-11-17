---
name: vps-deployment
description: >-
  Guides deployment preparation for VPS or Dedicated Servers using PostgreSQL
  (default), reverse proxy TLS termination, process management, and hardening.
  Use when preparing production configs or guides for a VPS-hosted project.
---

# VPS Deployment Skill

Use this workflow when configuring or documenting deployment for a verified VPS or Dedicated Server.

## Pre-Check

- Confirm actual server OS, runtime version, database choice (PostgreSQL 15+ default unless project specifies otherwise), firewall access, and DNS readiness.
- Document only technologies actually used by the project.

## Procedure

1. **Database**: Provision PostgreSQL bound locally (`127.0.0.1`) with least-privilege DB role; apply non-destructive migrations starting from `foundation/database/postgresql/001_core_schema.sql`.
2. **Process & Service**: Run application under an unprivileged user via `systemd` or `pm2`.
3. **Reverse Proxy & TLS**: Configure Nginx or Caddy for HTTPS termination (Let's Encrypt), `client_max_body_size` matching `config/security-policy.json`, security headers (`foundation/security/security-headers.json`), and safe `X-Forwarded-For` overwrite (`TRUST_PROXY=true` in `.env`).
4. **Environment & Storage**: Store `.env` with `chmod 600` (`APP_ENV=production`, `APP_DEBUG=false`, `COOKIE_SECURE=true`, `DB_DRIVER=postgresql`, real SMTP creds) and store uploads in a non-executable path outside the code release folder.
5. **Backups & Firewall**: Enable `ufw` (`22`, `80`, `443` only) and automated compressed `pg_dump` + uploads backups.

## Verification

- Validate reverse-proxy/process syntax for changed files only; do not run full stress tests or audits unless explicitly instructed.

