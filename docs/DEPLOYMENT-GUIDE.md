# Deployment Guide — Shared Hosting & VPS

> **Active Project Target (Farm INN)**:
> - **Platform**: VPS Hostinger (Ubuntu Linux LTS)
> - **Primary Database**: PostgreSQL 15+ (Single primary database; `foundation/database/postgresql/001_core_schema.sql`)
> - **Runtime & Process**: Node.js LTS managed by systemd or PM2
> - **Reverse Proxy & SSL**: Nginx with Let's Encrypt (Certbot)
> - **Supported Languages**: Arabic (`ar`, RTL) & English (`en`, LTR) strictly.

Deployment instructions must always match the **actual chosen stack** of the copied project. Do not assume technologies are installed until verified on the target host.

---

## Part A: Shared Hosting Deployment (Default DB: MySQL / MariaDB)

### 1. Pre-Deployment Verification
- Confirm hosting control panel capabilities (cPanel / DirectAdmin / Plesk):
  - Supported runtime version (e.g., PHP 8.2+ or managed Node.js/Python Passenger app).
  - MySQL 8.0+ or MariaDB 10.6+ database creation & credentials.
  - SSL certificate (AutoSSL / Let's Encrypt) enabled for the primary domain.
  - Outbound SMTP port availability (`587` STARTTLS or `465` SMTPS) for password reset and verification emails.

### 2. Database Setup
1. Create a dedicated MySQL/MariaDB database and least-privilege user in the hosting panel.
2. Import or run the project's versioned MySQL migrations starting from `foundation/database/mysql/001_core_schema.sql` (non-destructive).
3. Record database credentials only in `.env`.

### 3. Environment & Security Configuration
1. Copy `.env.example` to `.env` on the server (never inside the publicly servable `public_html` root if possible!).
2. Set `APP_ENV=production`, `APP_DEBUG=false`, `COOKIE_SECURE=true`, `HOSTING_TYPE=shared_hosting`, `DB_DRIVER=mysql`.
3. Generate unique 32+ character `SESSION_SECRET` and `CSRF_SECRET`.
4. Configure real SMTP credentials (`SMTP_ENABLED=true`) and verify password-reset email delivery manually.
5. Set strict permissions (`640`/`600` on `.env`; `755` directories; `644` files — never `777`).

### 4. Upload Storage & Webroot Protection
- Place `.env`, backend source files, and uploaded files **outside** `public_html` wherever host structure allows.
- Keep `foundation/` `.mjs` helpers mirrored in the host's supported runtime (PHP/Python/Node) if the shared host does not run Node.js.
- If uploads live under a web-accessible folder, add an Apache `.htaccess` file inside the uploads directory disabling script execution and sniffing:

```apache
# Inside public uploads folder (only if outside-webroot storage is unavailable)
Options -Indexes -ExecCGI
<IfModule mod_php.c>
  php_flag engine off
</IfModule>
<FilesMatch "\.(?i:php|phtml|phar|pl|py|rb|cgi|sh|html|htm|svg|js)$">
  Require all denied
</FilesMatch>
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
</IfModule>
```

### 5. Domain, SSL & Backups
- Force HTTPS redirects (`301`) to the canonical domain.
- Schedule regular database dumps (`mysqldump`) and off-site backups of the uploads directory.

---

## Part B: VPS / Dedicated Server Deployment (Default DB: PostgreSQL)

### 1. Server Requirements & Hardening
- Provision supported LTS OS (e.g., Ubuntu LTS), non-root sudo user, SSH key authentication, and firewall (`ufw` allowing only `22`, `80`, `443`).
- Install only the runtime required by `templates/PROJECT-ARCHITECTURE.md` (e.g., Node.js LTS, Python, or PHP-FPM) plus reverse proxy (Nginx or Caddy).

### 2. PostgreSQL Setup
1. Install and secure PostgreSQL 15+ (bind to `127.0.0.1` or private network; never expose `5432` publicly without strict firewall/TLS).
2. Create dedicated project role and database with least-privilege permissions.
3. Apply versioned migrations starting from `foundation/database/postgresql/001_core_schema.sql`.

### 3. Process Management & Reverse Proxy
- Run the application server as an unprivileged service user managed by `systemd` or `pm2`.
- Terminate TLS at Nginx/Caddy with Let's Encrypt certificates and proxy traffic to `127.0.0.1:<app_port>`.
- Set `TRUST_PROXY=true` in `.env` **only** when Nginx/Caddy overwrites `X-Forwarded-For` and `X-Forwarded-Proto` cleanly.
- Configure request body size caps (`client_max_body_size` matching `MAX_MULTIPART_REQUEST_BYTES`) and security headers (`foundation/security/security-headers.json`):

```nginx
# Example Nginx server block security & proxy hardening (adapt to actual upstream/domain)
client_max_body_size 12m;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $remote_addr;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 4. Environment, Email & Uploads
- Store production `.env` with `chmod 600` owned by the service user (`APP_ENV=production`, `APP_DEBUG=false`, `COOKIE_SECURE=true`, `DB_DRIVER=postgresql`).
- Configure real SMTP provider credentials and verify outbound mail works (ensure PTR/SPF/DKIM/DMARC DNS records are set).
- Store uploaded media in a non-executable directory (e.g., `/var/lib/<project>/uploads`) served safely through validated routes or hardened static rules.

### 5. Automated Backups & Recovery
- Schedule daily automated `pg_dump` backups (compressed and stored off-server or encrypted object storage) alongside `/var/lib/<project>/uploads`.
- Periodically test restoration on a staging database (only when requested or during maintenance).

