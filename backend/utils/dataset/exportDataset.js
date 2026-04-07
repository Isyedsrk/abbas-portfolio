/**
 * Orchestrate: load DB → pair → clean → enrich → JSONL-ready records.
 */

import { ensureChatTables, fetchChatMessagesOrdered } from '../chatStore.js';
import { getAllProjectRows } from '../retrieve.js';
import { pairUserAssistantMessages } from './pairMessages.js';
import { cleanAndLabelPairs } from './cleanPairs.js';
import { enrichPairContext } from './enrichContext.js';

/**
 * @param {object} [options]
 * @param {string} [options.since] — filter chat_messages.created_at
 * @param {boolean} [options.ragFallback=true]
 * @param {boolean} [options.includeStaticTemplates=false]
 * @param {number} [options.minQuestionLen]
 * @param {number} [options.minAnswerLen]
 * @param {boolean} [options.dedup=true]
 * @param {number} [options.maxContextProjects=5]
 */
export async function buildChatTrainingDataset(options = {}) {
  await ensureChatTables();

  const [rows, allRows] = await Promise.all([
    fetchChatMessagesOrdered({ since: options.since }),
    getAllProjectRows(),
  ]);

  const paired = pairUserAssistantMessages(rows);
  const { good, rejected } = cleanAndLabelPairs(paired, {
    minQuestionLen: options.minQuestionLen,
    minAnswerLen: options.minAnswerLen,
    includeStaticTemplates: options.includeStaticTemplates,
    dedup: options.dedup,
  });

  const ragFallbackCache = new Map();
  const maxChunks = options.maxContextProjects ?? 5;

  /** @type {Array<object>} */
  const records = [];
  for (const p of good) {
    const { context, contextSource } = await enrichPairContext(p, {
      allRows,
      ragFallbackCache,
      ragFallback: options.ragFallback !== false,
      maxChunks,
    });

    records.push({
      question: p.question,
      context,
      answer: p.answer,
      meta: {
        quality: 'good',
        session_id: p.sessionId,
        response_source: p.responseSource,
        ai_used: p.aiUsed,
        ai_provider: p.aiProvider,
        context_source: contextSource,
        created_at: p.createdAt,
      },
    });
  }

  /** @type {Array<object>} */
  const rejectedRecords = rejected.map((r) => ({
    question: r.question,
    context: null,
    answer: r.answer,
    meta: {
      quality: 'bad',
      reject_reasons: r.rejectReasons,
      session_id: r.sessionId,
      response_source: r.responseSource,
      created_at: r.createdAt,
    },
  }));

  return {
    records,
    rejectedRecords,
    stats: {
      raw_rows: rows.length,
      pairs: paired.length,
      accepted: records.length,
      rejected: rejected.length,
      rag_fallback_unique_queries: ragFallbackCache.size,
    },
  };
}
