import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Simple .env parser to avoid external dependencies
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}
loadEnv();

let projectConfig = {};
try {
  const pcfgPath = path.join(rootDir, 'config/project.config.json');
  if (fs.existsSync(pcfgPath)) {
    projectConfig = JSON.parse(fs.readFileSync(pcfgPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not load project.config.json:', e.message);
}

let securityPolicy = {};
try {
  const spPath = path.join(rootDir, 'config/security-policy.json');
  if (fs.existsSync(spPath)) {
    securityPolicy = JSON.parse(fs.readFileSync(spPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not load security-policy.json:', e.message);
}

export const config = {
  appName: process.env.APP_NAME || projectConfig.project?.name || 'FARMINN',
  appEnv: process.env.APP_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  port: parseInt(process.env.PORT || '4000', 10),
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
  supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'ar,en').split(',').map(s => s.trim()),
  
  // Database configuration
  db: {
    driver: process.env.DB_DRIVER || 'postgresql',
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'farminn_db',
    user: process.env.DB_USER || 'farminn_user',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true'
  },
  
  // Auth & Security
  sessionSecret: process.env.SESSION_SECRET || 'farminn_development_session_secret_min32chars!',
  csrfSecret: process.env.CSRF_SECRET || 'farminn_development_csrf_secret_min32chars!',
  authCookieName: process.env.AUTH_COOKIE_NAME || 'farminn_session',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  allowPublicRegistration: process.env.ALLOW_PUBLIC_REGISTRATION !== 'false', // Enabled for FARMINN marketplace
  
  // Directories
  rootDir,
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || 'storage/uploads'),
  
  projectConfig,
  securityPolicy
};
