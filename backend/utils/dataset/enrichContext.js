/**
 * Build production-aligned RAG context strings for dataset rows.
 */

import { projectDetails } from '../../data/projectDetails.js';
import { resolveProjectDetailsKey } from '../projectKeywordMatch.js';
import { formatRagContextChunks } from '../formatRagContext.js';
import { buildPortfolioTimelineBlock } from '../portfolioTimeline.js';
import { buildNoMatchPortfolioContext } from '../../config/llmPrompt.js';
import { retrieveContextHybrid } from '../retrieve.js';
import { embedQueryText } from '../embedQuery.js';

const MAX_CHUNKS_DEFAULT = 5;

function userAsksForLink(question) {
  const q = String(question || '').toLowerCase();
  return /\b(link|github|repository|repo|code|source|where can i|how can i|show me|give me|provide|share|url|website)\b/.test(
    q
  );
}

/**
 * @param {string | null} jsonStr
 * @param {Array<{ id: number, title: string, description: string, links: string }>} allRows
 */
export function projectsFromStoredJson(jsonStr, allRows) {
  let arr = [];
  try {
    const parsed = JSON.parse(String(jsonStr || '[]'));
    arr = Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }

  const byTitle = new Map();
  for (const r of allRows) {
    byTitle.set(String(r.title).trim().toLowerCase(), r);
  }

  const out = [];
  const seen = new Set();
  for (const item of arr) {
    const t = String(item?.title || '').trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const row = byTitle.get(key);
    if (row) {
      out.push({
        id: row.id,
        title: row.title,
        description: row.description,
        links: row.links,
        similarity: 0.92,
      });
    }
  }
  return out;
}

/**
 * Same shape as chat: timeline + RAG chunks (or no-match index).
 */
export function formatContextForProjects(projects, question, allRows, maxChunks) {
  const m = maxChunks ?? MAX_CHUNKS_DEFAULT;
  const timelineBlock = buildPortfolioTimelineBlock(projectDetails);
  const link = userAsksForLink(question);

  let ragBody;
  if (projects.length > 0) {
    ragBody = formatRagContextChunks(projects, {
      projectDetails,
      resolveProjectDetailsKey,
      userAsksForLink: link,
      maxChunks: m,
    });
  } else {
    const titles = (allRows || []).map((r) => r.title).filter(Boolean);
    ragBody = buildNoMatchPortfolioContext(titles);
  }

  return `${timelineBlock}\n\n---\n\n${ragBody}`;
}

/**
 * @param {object} pair — cleaned pair with question, relevantProjectsJson
 * @param {object} ctx
 * @param {Array} ctx.allRows
 * @param {Map<string, string>} ctx.ragFallbackCache — norm question -> context
 * @param {boolean} [ctx.ragFallback=true]
 */
export async function enrichPairContext(pair, ctx) {
  const { allRows, ragFallbackCache } = ctx;
  const ragFallback = ctx.ragFallback !== false;
  const maxChunks = ctx.maxChunks ?? MAX_CHUNKS_DEFAULT;

  let projects = projectsFromStoredJson(pair.relevantProjectsJson, allRows);

  if (projects.length > 0) {
    return {
      context: formatContextForProjects(
        projects,
        pair.question,
        allRows,
        maxChunks
      ),
      contextSource: 'stored_relevant_projects',
    };
  }

  if (!ragFallback) {
    return {
      context: formatContextForProjects([], pair.question, allRows, maxChunks),
      contextSource: 'no_match_index_only',
    };
  }

  const nq = normQuestion(pair.question);
  if (ragFallbackCache.has(nq)) {
    return {
      context: ragFallbackCache.get(nq),
      contextSource: 'rag_fallback_cached',
    };
  }

  const emb = await embedQueryText(pair.question);
  const retrieved = await retrieveContextHybrid(
    emb,
    pair.question,
    maxChunks,
    0.4
  );
  const text = formatContextForProjects(
    retrieved,
    pair.question,
    allRows,
    maxChunks
  );
  ragFallbackCache.set(nq, text);
  return { context: text, contextSource: 'rag_fallback_fresh' };
}

function normQuestion(q) {
  return String(q || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}
