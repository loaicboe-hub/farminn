#!/usr/bin/env bash
# ==============================================================================
# FARMINN — HOSTINGER VPS AUTOMATED PROVISIONING & DEPLOYMENT SCRIPT
# OS: Ubuntu 22.04 / 24.04 LTS
# ==============================================================================
set -e

echo "=== 1. Updating System Packages ==="
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw nginx postgresql postgresql-contrib

echo "=== 2. Installing Node.js LTS ==="
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "=== 3. Setting Up PostgreSQL Database ==="
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'farminn_db'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE farminn_db;"

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = 'farminn_user'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER farminn_user WITH ENCRYPTED PASSWORD 'StrongProductionPassword2026!';"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE farminn_db TO farminn_user;"
sudo -u postgres psql -d farminn_db -c "GRANT ALL ON SCHEMA public TO farminn_user;"

echo "=== 4. Installing Application Dependencies ==="
npm ci --omit=dev

echo "=== 5. Running Database Migrations ==="
export DB_DRIVER=postgresql
export DB_HOST=127.0.0.1
export DB_PORT=5432
export DB_NAME=farminn_db
export DB_USER=farminn_user
export DB_PASSWORD='StrongProductionPassword2026!'

node -e "import('./src/db/migrate.mjs').then(m => m.runMigrations())"

echo "=== 6. Configuring Nginx & systemd ==="
sudo cp deploy/nginx-farminn.conf /etc/nginx/sites-available/farminn
sudo ln -sf /etc/nginx/sites-available/farminn /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo cp deploy/farminn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable farminn
sudo systemctl restart farminn

echo "=== Deployment Completed Successfully! FARMINN is LIVE ==="

