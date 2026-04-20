import Database from 'better-sqlite3'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

const DB_PATH = path.join(DATA_DIR, 'ontologies.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
    initSchema(_db)
  }
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id                     TEXT PRIMARY KEY,
      email                  TEXT NOT NULL UNIQUE,
      name                   TEXT NOT NULL DEFAULT '',
      plan                   TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id     TEXT,
      stripe_subscription_id TEXT,
      import_count           INTEGER NOT NULL DEFAULT 0,
      analyze_count          INTEGER NOT NULL DEFAULT 0,
      billing_period_start   TEXT,
      created_at             TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ontologies (
      id          TEXT PRIMARY KEY,
      user_id     TEXT,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      domain      TEXT NOT NULL DEFAULT 'general',
      nodes       TEXT NOT NULL DEFAULT '[]',
      edges       TEXT NOT NULL DEFAULT '[]',
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)

  // Migrations for existing DBs
  const ontCols = db.pragma('table_info(ontologies)') as { name: string }[]
  if (!ontCols.find(c => c.name === 'user_id')) {
    db.exec(`ALTER TABLE ontologies ADD COLUMN user_id TEXT REFERENCES users(id)`)
  }

  const userCols = db.pragma('table_info(users)') as { name: string }[]
  if (!userCols.find(c => c.name === 'tokens_used')) {
    db.exec(`ALTER TABLE users ADD COLUMN tokens_used INTEGER NOT NULL DEFAULT 0`)
  }
}
