import sqlite3 from 'sqlite3';
import { cosineSimilarity } from './similarity.js';
import { rankProjectsByKeywords } from './projectKeywordMatch.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../db/projects.db');

/**
 * All project rows (for keyword fallback)
 */
/**
 * Find a DB row by title (case-insensitive), for follow-up context injection.
 * @param {string} title - e.g. as returned in API relevantProjects[0].title
 */
export async function getProjectRowByTitleCi(title) {
  const rows = await getAllProjectRows();
  if (!title || !String(title).trim()) return null;
  const want = String(title).trim().toLowerCase();
  let row = rows.find((r) => r.title.trim().toLowerCase() === want);
  if (row) return row;
  row = rows.find(
    (r) =>
      want.includes(r.title.trim().toLowerCase()) ||
      r.title.trim().toLowerCase().includes(want)
  );
  return row || null;
}

export function getAllProjectRows() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
    });
    db.all('SELECT id, title, description, links, embedding FROM projects', [], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Retrieve relevant context from database using embeddings
 * @param {number[]} queryEmbedding - The embedding vector of the query
 * @param {number} topK - Number of top results to return (default: 3)
 * @param {number} threshold - Minimum similarity threshold (default: 0.5)
 * @returns {Promise<Array>} Array of relevant project contexts
 */
export async function retrieveContext(queryEmbedding, topK = 3, threshold = 0.5) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
    });

    // Get all projects with their embeddings
    db.all('SELECT id, title, description, links, embedding FROM projects', [], (err, rows) => {
      if (err) {
        db.close();
        reject(err);
        return;
      }

      // Calculate similarity for each project
      const similarities = rows.map((row) => {
        try {
          const embedding = JSON.parse(row.embedding);
          const similarity = cosineSimilarity(queryEmbedding, embedding);
          return {
            id: row.id,
            title: row.title,
            description: row.description,
            links: row.links,
            similarity: similarity,
          };
        } catch (parseErr) {
          console.error(`Error parsing embedding for project ${row.id}:`, parseErr);
          return {
            id: row.id,
            title: row.title,
            description: row.description,
            links: row.links,
            similarity: 0,
          };
        }
      });

      // Sort by similarity and filter by threshold
      const relevant = similarities
        .filter((item) => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      db.close();
      resolve(relevant);
    });
  });
}

/**
 * Embedding search + keyword/alias fallback (typos & short queries)
 */
export async function retrieveContextHybrid(queryEmbedding, question, topK = 3, threshold = 0.4) {
  const [embeddingHits, allRows] = await Promise.all([
    retrieveContext(queryEmbedding, topK, threshold),
    getAllProjectRows(),
  ]);

  const keywordMin = 0.82;
  const keywordHits = rankProjectsByKeywords(question, allRows, keywordMin).slice(0, topK);

  const byTitle = new Map();

  for (const p of embeddingHits) {
    byTitle.set(p.title, { ...p });
  }

  for (const p of keywordHits) {
    const existing = byTitle.get(p.title);
    if (!existing) {
      byTitle.set(p.title, { ...p });
    } else {
      const best = Math.max(existing.similarity || 0, p.similarity || 0);
      byTitle.set(p.title, { ...existing, similarity: best });
    }
  }

  const merged = Array.from(byTitle.values()).sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

  if (merged.length === 0 && keywordHits.length === 0) {
    const loose = rankProjectsByKeywords(question, allRows, 0.75).slice(0, topK);
    return loose;
  }

  return merged.slice(0, topK);
}
