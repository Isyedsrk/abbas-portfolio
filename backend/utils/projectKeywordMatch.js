/**
 * Keyword / alias matching so short or misspelled queries still resolve projects
 * (embeddings alone often miss "Biggboss", "about bigboss", etc.)
 */

import { projectDetails } from '../data/projectDetails.js';

/** Canonical DB titles → extra phrases users might type (lowercased, no need for exact punctuation) */
const TITLE_ALIASES = {
  'Bigg Boss – App Room': [
    'bigg boss',
    'biggboss',
    'bigboss',
    'big boss',
    'bb19',
    'bb 19',
    'season 19',
    'app room',
    'biggboss app',
  ],
  'Learning with AR': ['learning with ar', 'learning ar', 'ar learning', 'vuforia project'],
  'Fruit-Slicer': ['fruit slicer', 'fruitslicer', 'fruit-slicer'],
  'Apna super bazaar': ['apna super bazaar', 'apna bazaar', 'e commerce', 'ecommerce website'],
  Healthease: ['healthease', 'health ease', 'healthcare app', 'lab test app'],
  DAR: ['dar', 'detection and recognition', 'detect recognize'],
  Obliviate: ['obliviate'],
  'Party Room': ['party room', 'watch together', 'sync video'],
};

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[–—\-]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((t) => t.length > 0);
}

/**
 * @param {string} question
 * @param {{ title: string, description: string }} row
 * @returns {number} score 0..1; 0 = no match
 */
export function scoreKeywordMatch(question, row) {
  const q = normalize(question);
  if (!q) return 0;

  const title = row.title || '';
  const desc = row.description || '';
  const titleN = normalize(title);
  const descN = normalize(desc).slice(0, 280);

  let score = 0;

  // Whole-title substring (handles "about bigg boss – app room")
  if (titleN.length >= 3 && q.includes(titleN)) {
    score = Math.max(score, 0.95);
  }

  // Title words: require all significant words (length > 2) to appear for multi-word titles
  const titleWords = tokenize(title).filter((w) => w.length > 2);
  if (titleWords.length > 0) {
    const allWordsPresent = titleWords.every((w) => q.includes(w));
    if (allWordsPresent) {
      score = Math.max(score, 0.88);
    }
  }

  // Short exact titles (DAR, etc.)
  if (titleN.length <= 6 && titleWords.length === 1) {
    const word = titleWords[0];
    if (word && new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(q)) {
      score = Math.max(score, 0.92);
    }
  }

  // Configured aliases
  const aliases = TITLE_ALIASES[title] || [];
  for (const alias of aliases) {
    const a = normalize(alias);
    if (a.length < 2) continue;
    if (q.includes(a)) {
      score = Math.max(score, 0.9);
    }
    // "biggboss" one word
    if (a.replace(/\s/g, '') === q.replace(/\s/g, '') && a.replace(/\s/g, '').length >= 4) {
      score = Math.max(score, 0.88);
    }
  }

  // Light description overlap (only if something already matched weakly)
  if (score > 0 && descN.length > 20) {
    const qTokens = new Set(tokenize(q).filter((t) => t.length > 3));
    const descTokens = tokenize(descN).filter((t) => t.length > 3);
    let overlap = 0;
    for (const t of descTokens) {
      if (qTokens.has(t)) overlap++;
    }
    if (overlap >= 2) score = Math.min(1, score + 0.05);
  }

  return score;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} question
 * @param {Array<{ id, title, description, links, embedding }>} rows
 * @param {number} minScore
 */
export function rankProjectsByKeywords(question, rows, minScore = 0.85) {
  const scored = rows
    .map((row) => {
      const s = scoreKeywordMatch(question, row);
      return s >= minScore
        ? {
            id: row.id,
            title: row.title,
            description: row.description,
            links: row.links,
            similarity: s,
          }
        : null;
    })
    .filter(Boolean);

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored;
}

/**
 * Map SQLite project title → key in projectDetails (same logic as chat route)
 */
export function resolveProjectDetailsKey(projectTitle) {
  const projectTitleLower = String(projectTitle || '').toLowerCase().trim();
  const exact = Object.keys(projectDetails).find(
    (key) => key.toLowerCase().trim() === projectTitleLower
  );
  if (exact) return exact;

  return Object.keys(projectDetails).find((key) => {
    const keyLower = key.toLowerCase();
    const keyBase = keyLower.split('(')[0].split('–')[0].split('-')[0].trim();
    const titleBase = projectTitleLower.split('(')[0].split('–')[0].split('-')[0].trim();
    const normalizeStr = (str) => str.replace(/\b(app|room|project|system|application)\b/gi, '').trim();
    const normalizedKey = normalizeStr(keyBase);
    const normalizedTitle = normalizeStr(titleBase);
    return (
      keyLower.includes(projectTitleLower) ||
      projectTitleLower.includes(keyBase) ||
      normalizedKey.includes(normalizedTitle) ||
      normalizedTitle.includes(normalizedKey) ||
      (projectTitleLower.includes('biggboss') && keyLower.includes('bigg boss')) ||
      (projectTitleLower.includes('bigg boss') && keyLower.includes('biggboss'))
    );
  });
}

/** True if the question is only naming a project / vague hook (no specific facet). */
export function isVagueProjectQuery(question) {
  const q = normalize(question);
  if (q.length < 2) return true;
  const facet =
    /\b(tech|technologies|stack|feature|features|how\s+(does|do|it|this|work)|what\s+(tech|technologies|stack|does)|who\s+(made|build)|made\s+by|team|why|when|where|github|link|repo)\b/i.test(
      question
    );
  if (facet) return false;
  const wordCount = q.split(' ').filter(Boolean).length;
  if (wordCount <= 4 && !/\?/.test(question)) return true;
  if (/^(tell me about|about|info on|what is|what's)\s+/i.test(question.trim()) && wordCount <= 8) {
    return true;
  }
  return false;
}
