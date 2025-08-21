/**
 * Jscbc: SQLite 数据库与迁移
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "chuju.db");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS scripts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  alias TEXT,
  era TEXT,
  author TEXT,
  cover_url TEXT,
  excerpt TEXT,
  markdown_path TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS script_tags (
  script_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (script_id, tag_id),
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
-- 聚合指标表
CREATE TABLE IF NOT EXISTS metrics (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
`);

export function run<T = unknown>(sql: string, params?: any[]): void {
  db.prepare(sql).run(params ?? []);
}

export function all<T = unknown>(sql: string, params?: any[]): T[] {
  return db.prepare(sql).all(params ?? []) as T[];
}

export function get<T = unknown>(sql: string, params?: any[]): T | undefined {
  return db.prepare(sql).get(params ?? []) as T | undefined;
} 