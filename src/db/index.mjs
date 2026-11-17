import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from '../config.mjs';

const { Pool } = pg;

class DatabaseAdapter {
  constructor() {
    this.driver = null; // 'pg' or 'sqlite'
    this.pgPool = null;
    this.sqliteDb = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    // Check if PostgreSQL is available and requested
    if (config.db.driver === 'postgresql' && (config.db.url || config.db.host)) {
      try {
        const poolConfig = config.db.url
          ? { connectionString: config.db.url, connectionTimeoutMillis: 2000 }
          : {
              host: config.db.host,
              port: config.db.port,
              database: config.db.name,
              user: config.db.user,
              password: config.db.password,
              ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
              connectionTimeoutMillis: 2000
            };

        const testPool = new Pool(poolConfig);
        const client = await testPool.connect();
        await client.query('SELECT 1');
        client.release();

        this.pgPool = testPool;
        this.driver = 'pg';
        this.isInitialized = true;
        console.log('[FARMINN DB] Connected to PostgreSQL successfully (VPS / Production engine).');
        return;
      } catch (err) {
        console.warn(`[FARMINN DB] PostgreSQL connection unavailable locally (${err.message}). Activating local zero-dependency SQLite fallback for development.`);
      }
    }

    // Fallback to local SQLite for development
    const dataDir = path.join(config.rootDir, 'storage/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'farminn_dev.sqlite');
    this.sqliteDb = new DatabaseSync(dbPath);
    this.sqliteDb.exec('PRAGMA foreign_keys = ON;');
    this.driver = 'sqlite';
    this.isInitialized = true;
    console.log(`[FARMINN DB] Initialized local SQLite development database at ${dbPath}`);
  }

  async query(text, params = []) {
    await this.init();

    if (this.driver === 'pg') {
      const res = await this.pgPool.query(text, params);
      return {
        rows: res.rows,
        rowCount: res.rowCount,
        fields: res.fields
      };
    }

    // SQLite adapter emulation:
    // Convert PostgreSQL $1, $2, ... placeholders to ?
    let sqliteQuery = text;
    // Replace $1, $2 etc with ?
    sqliteQuery = sqliteQuery.replace(/\$[0-9]+/g, '?');
    // Replace NOW() with datetime('now')
    sqliteQuery = sqliteQuery.replace(/\bNOW\(\)/gi, "datetime('now')");
    // Replace TIMESTAMPTZ / BIGSERIAL / JSONB compatibility in DDL
    sqliteQuery = sqliteQuery.replace(/\bJSONB\b/gi, 'TEXT');
    sqliteQuery = sqliteQuery.replace(/\bBIGSERIAL\b/gi, 'INTEGER');
    sqliteQuery = sqliteQuery.replace(/\bTIMESTAMPTZ\b/gi, 'TEXT');
    sqliteQuery = sqliteQuery.replace(/\bBOOLEAN\b/gi, 'INTEGER');
    sqliteQuery = sqliteQuery.replace(/\bTRUE\b/gi, '1');
    sqliteQuery = sqliteQuery.replace(/\bFALSE\b/gi, '0');
    // Remove DO $$ ... $$; and PostgreSQL triggers if present in raw execution
    
    // Normalize params (objects to JSON strings, booleans to 1/0)
    const normalizedParams = params.map(p => {
      if (typeof p === 'boolean') return p ? 1 : 0;
      if (p !== null && typeof p === 'object') return JSON.stringify(p);
      return p;
    });

    try {
      const isSelect = /^\s*(SELECT|PRAGMA|WITH)/i.test(sqliteQuery);
      if (isSelect) {
        const stmt = this.sqliteDb.prepare(sqliteQuery);
        const rows = stmt.all(...normalizedParams);
        // Normalize rows (parse JSON fields or numeric strings if needed)
        for (const row of rows) {
          for (const key of Object.keys(row)) {
            if (typeof row[key] === 'string' && (row[key].startsWith('{') || row[key].startsWith('['))) {
              try { row[key] = JSON.parse(row[key]); } catch {}
            }
          }
        }
        return { rows, rowCount: rows.length };
      } else {
        const stmt = this.sqliteDb.prepare(sqliteQuery);
        const result = stmt.run(...normalizedParams);
        return {
          rows: [],
          rowCount: Number(result.changes),
          lastInsertRowid: Number(result.lastInsertRowid)
        };
      }
    } catch (err) {
      console.error('[DB Query Error]', err.message, '\nSQL:', sqliteQuery, '\nParams:', normalizedParams);
      throw err;
    }
  }

  async exec(sql) {
    await this.init();
    if (this.driver === 'pg') {
      return this.pgPool.query(sql);
    }
    return this.sqliteDb.exec(sql);
  }
}

export const db = new DatabaseAdapter();

