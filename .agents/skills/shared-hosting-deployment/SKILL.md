---
name: shared-hosting-deployment
description: >-
  Guides deployment preparation and server configuration for Shared Hosting
  environments (cPanel, DirectAdmin, Plesk) using MySQL or MariaDB. Use when
  configuring or documenting deployment for a project hosted on shared hosting.
---

# Shared Hosting Deployment Skill

Use this workflow when deploying or preparing deployment configs for a project verified to run on Shared Hosting.

## Pre-Check

- Verify the host's actual supported runtime (PHP version or managed Node.js/Python passenger support), MySQL/MariaDB version, SSL status, and outbound SMTP capability before generating configs.
- Do not document or assume root-only VPS services (Docker, Nginx system edits, systemd) unless confirmed available.

## Procedure

1. **Database**: Provision dedicated MySQL/MariaDB database and user; apply additive schema starting from `foundation/database/mysql/001_core_schema.sql`.
2. **Environment**: Place `.env` outside public webroot where supported (`chmod 600`/`640`); set `APP_ENV=production`, `APP_DEBUG=false`, `COOKIE_SECURE=true`, `HOSTING_TYPE=shared_hosting`, `DB_DRIVER=mysql`, and real SMTP credentials.
3. **Upload Protection**: Keep upload storage outside `public_html` when possible; otherwise block script execution in the uploads directory (`.htaccess` disabling PHP/CGI execution).
4. **Permissions & SSL**: Set `755` directories and `644` files (never `777`), enable AutoSSL/Let's Encrypt, and force HTTPS redirects.
5. **Backups**: Document scheduled `mysqldump` + uploads backup workflow.

## Verification

- Check config syntax and `.env.example` alignment without exposing real secrets or running full unrequested deployment audits.

