/**
 * Filter chat pairs for training: length, greetings, static/error sources, dedup.
 */

import { isGreeting } from '../conversationGuidance.js';
import { isConversationClosing } from '../conversationClosing.js';

function normKey(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function dedupeKey(pair) {
  return `${normKey(pair.question)}|${normKey(pair.answer).slice(0, 240)}`;
}

/** LLM + grounded smart response paths only */
export function isTrustedResponseSource(source) {
  const s = String(source || '');
  if (/^error/i.test(s)) return false;
  if (/^ollama\b/i.test(s)) return true;
  if (/^hugging face\b/i.test(s)) return true;
  if (/^openai\b/i.test(s)) return true;
  if (/smart response \(smartResponse\.js/i.test(s)) return true;
  return false;
}

function isStaticTemplateSource(source) {
  return /^static template/i.test(String(source || ''));
}

const SERVER_ERROR_ANSWER = /i'?m having trouble processing your question right now/i;

/**
 * @param {Array<object>} pairs — from pairUserAssistantMessages
 * @param {object} [options]
 * @param {number} [options.minQuestionLen=12]
 * @param {number} [options.minAnswerLen=28]
 * @param {boolean} [options.includeStaticTemplates=false]
 * @param {boolean} [options.dedup=true]
 */
export function cleanAndLabelPairs(pairs, options = {}) {
  const minQuestionLen = options.minQuestionLen ?? 12;
  const minAnswerLen = options.minAnswerLen ?? 28;
  const includeStaticTemplates = options.includeStaticTemplates ?? false;
  const dedup = options.dedup !== false;

  const seen = new Set();
  /** @type {Array<object>} */
  const good = [];
  /** @type {Array<object>} */
  const rejected = [];

  for (const p of pairs) {
    const reasons = [];
    const q = String(p.question || '').trim();
    const a = String(p.answer || '').trim();
    const src = String(p.responseSource || '');

    if (q.length < minQuestionLen) reasons.push('question_too_short');
    if (a.length < minAnswerLen) reasons.push('answer_too_short');
    if (SERVER_ERROR_ANSWER.test(a)) reasons.push('server_error_message');

    if (isGreeting(q)) reasons.push('greeting');
    if (isConversationClosing(q)) reasons.push('closing_or_thanks');

    if (/^error/i.test(src)) reasons.push('error_response_source');

    if (isStaticTemplateSource(src) && !includeStaticTemplates) {
      reasons.push('static_template_source');
    }

    if (!includeStaticTemplates) {
      if (!isTrustedResponseSource(src)) {
        reasons.push('untrusted_source');
      }
    } else {
      if (
        !isTrustedResponseSource(src) &&
        !isStaticTemplateSource(src) &&
        !/^error/i.test(src)
      ) {
        reasons.push('untrusted_source');
      }
    }

    const key = dedupeKey(p);
    if (dedup && reasons.length === 0 && seen.has(key)) {
      reasons.push('duplicate');
    }

    const out = { ...p, quality: /** @type {'good'|'bad'} */ ('good') };

    if (reasons.length > 0) {
      rejected.push({
        ...out,
        quality: 'bad',
        rejectReasons: reasons,
      });
    } else {
      if (dedup) seen.add(key);
      good.push(out);
    }
  }

  return { good, rejected };
}
