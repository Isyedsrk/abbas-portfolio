/**
 * Persist portfolio chat turns in SQLite (same DB as projects).
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db/projects.db');

const MAX_CONTENT_LEN = 64000;

let tablesReady = null;

function truncate(s, max) {
  const str = String(s ?? '');
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

/**
 * Create chat tables once (idempotent).
 */
export function ensureChatTables() {
  if (!tablesReady) {
    tablesReady = new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        db.exec(
          `CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
          );
          CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            response_source TEXT,
            ai_used INTEGER,
            ai_provider TEXT,
            relevant_projects_json TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          );
          CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);`,
          (e) => {
            db.close((closeErr) => {
              if (e) reject(e);
              else if (closeErr) reject(closeErr);
              else resolve();
            });
          }
        );
      });
    });
  }
  return tablesReady;
}

/**
 * Accept client session id or issue a new UUID.
 * @param {unknown} raw
 */
export function resolveChatSessionId(raw) {
  const s = String(raw ?? '').trim();
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      s
    )
  ) {
    return s;
  }
  if (/^[a-zA-Z0-9_-]{8,128}$/.test(s)) {
    return s.slice(0, 128);
  }
  return randomUUID();
}

/**
 * @param {object} p
 * @param {string} p.sessionId
 * @param {string} p.userContent
 * @param {string} p.assistantContent
 * @param {string} [p.responseSource]
 * @param {boolean} [p.aiUsed]
 * @param {string | null} [p.aiProvider]
 * @param {Array<{ title?: string }>} [p.relevantProjects]
 */
export async function saveChatExchange(p) {
  await ensureChatTables();

  const sid = p.sessionId;
  const u = truncate(p.userContent, MAX_CONTENT_LEN);
  const a = truncate(p.assistantContent, MAX_CONTENT_LEN);
  const rs = p.responseSource != null ? String(p.responseSource).slice(0, 200) : null;
  const aiUsed = p.aiUsed ? 1 : 0;
  const aiPr = p.aiProvider != null ? String(p.aiProvider).slice(0, 120) : null;
  let rp = '[]';
  try {
    rp = JSON.stringify(
      (p.relevantProjects || []).map((x) => ({
        title: x.title,
        links: x.links,
      }))
    );
  } catch {
    rp = '[]';
  }
  if (rp.length > 16000) rp = rp.slice(0, 16000);

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (openErr) => {
      if (openErr) {
        reject(openErr);
        return;
      }
      db.serialize(() => {
        db.run(
          `INSERT INTO chat_sessions (id, created_at, updated_at)
           VALUES (?, datetime('now'), datetime('now'))
           ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now')`,
          [sid],
          (e1) => {
            if (e1) {
              db.close(() => reject(e1));
              return;
            }
            db.run(
              `INSERT INTO chat_messages (session_id, role, content, response_source, ai_used, ai_provider, relevant_projects_json)
               VALUES (?, 'user', ?, NULL, NULL, NULL, NULL)`,
              [sid, u],
              (e2) => {
                if (e2) {
                  db.close(() => reject(e2));
                  return;
                }
                db.run(
                  `INSERT INTO chat_messages (session_id, role, content, response_source, ai_used, ai_provider, relevant_projects_json)
                   VALUES (?, 'assistant', ?, ?, ?, ?, ?)`,
                  [sid, a, rs, aiUsed, aiPr, rp],
                  (e3) => {
                    db.close((closeErr) => {
                      if (e3) reject(e3);
                      else if (closeErr) reject(closeErr);
                      else resolve();
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  });
}

/**
 * Load chat rows for dataset export (single query, session-then-time order).
 * @param {{ since?: string }} [options] — optional ISO/datetime filter on created_at
 * @returns {Promise<Array<{ id: number, session_id: string, role: string, content: string, response_source: string | null, ai_used: number | null, ai_provider: string | null, relevant_projects_json: string | null, created_at: string }>>}
 */
export async function fetchChatMessagesOrdered(options = {}) {
  await ensureChatTables();
  const since =
    options.since != null && String(options.since).trim()
      ? String(options.since).trim()
      : null;

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (openErr) => {
      if (openErr) {
        reject(openErr);
        return;
      }
      const sql = since
        ? `SELECT id, session_id, role, content, response_source, ai_used, ai_provider, relevant_projects_json, created_at
           FROM chat_messages WHERE created_at >= ? ORDER BY session_id, datetime(created_at), id`
        : `SELECT id, session_id, role, content, response_source, ai_used, ai_provider, relevant_projects_json, created_at
           FROM chat_messages ORDER BY session_id, datetime(created_at), id`;
      const params = since ? [since] : [];
      db.all(sql, params, (err, rows) => {
        db.close((closeErr) => {
          if (err) reject(err);
          else if (closeErr) reject(closeErr);
          else resolve(rows || []);
        });
      });
    });
  });
}
