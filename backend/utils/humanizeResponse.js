/**
 * Light post-processing for LLM replies: less repeated greetings, tighter Quick answer.
 * Preserves ### Quick answer / ### More detail structure.
 */

import { isPriorAnswerChallenge } from './conversationConsistency.js';
import { isAmbiguousTechFollowUp } from './ambiguousFollowUp.js';

/**
 * Short factual / narrow questions — calibrate brevity (used in prompt + polish).
 * @param {string} q
 */
export function isShortFactualQuestion(q) {
  const s = String(q || '').trim();
  if (!s || s.length > 140) return false;
  const low = s.toLowerCase();
  if (
    /\b(team\s*size|how\s+many\s+(people|members)|solo|individual|alone|one\s+person|kitne\s+log)\b/i.test(
      low
    )
  ) {
    return true;
  }
  if (/\b(what\s+year|which\s+year|when\s+(was|did)|kab\s+)/i.test(low)) return true;
  if (
    /^(is|was)\s+it\b/i.test(low) &&
    s.length < 95 &&
    /\b(office|personal|solo|individual|client|company|team\s*project)\b/i.test(low)
  ) {
    return true;
  }
  const words = s.split(/\s+/).filter(Boolean);
  if (
    words.length <= 10 &&
    /\b(are you sure|you sure|really)\b/i.test(low)
  ) {
    return true;
  }
  if (
    words.length <= 14 &&
    /\b(latest|most recent|newest|current)\b/i.test(low) &&
    /\b(project|work|build|thing)\b/i.test(low)
  ) {
    return true;
  }
  return (
    words.length <= 12 &&
    (/\?/.test(s) || /\b(kya|what|which|who|how\s+much|how\s+many)\b/i.test(low))
  );
}

function stripRoboticMetaPhrases(quickBody) {
  let t = String(quickBody || '').trim();
  const meta = [
    /^For the question about[^.]+\.?\s*/i,
    /^Regarding (your )?question[^.]+\.?\s*/i,
    /^To answer (your )?question[^.]+\.?\s*/i,
    /^Based on (your )?question[^.]+\.?\s*/i,
    /^In response to (your )?query[^.]+\.?\s*/i,
    /^I'?m sure I (mentioned|said)[^.!?]*[.!?]\s*/i,
    /^I (definitely|already) (told|said|mentioned)[^.!?]*[.!?]\s*/i,
    /^(as|like) I (said|mentioned) (earlier|before)[^.!?]*[.!?]\s*/i,
  ];
  for (const p of meta) {
    t = t.replace(p, '');
  }
  return t.trim();
}

function stripRepeatedOpeners(quickBody) {
  let t = String(quickBody || '').trim();
  const patterns = [
    /^(hello!|hi!|hey!|hey there!)\s*\n+/i,
    /^I'm glad you're interested[^.!?\n]*[.!?]?\s*\n*/i,
    /^I('m| am) (glad|happy) (you're|you are|to hear)[^.!?\n]*[.!?]?\s*\n*/i,
    /^great question!?\s*\n+/i,
    /^thanks for asking!?\s*\n+/i,
    /^good question!?\s*\n+/i,
    /^(sure!|absolutely!)\s*\n+/i,
  ];
  for (const p of patterns) {
    t = t.replace(p, '');
  }
  return t.trim();
}

function stripTimelineMetaFromQuick(quickBody) {
  let t = String(quickBody || '').trim();
  const patts = [
    /\s*(Same ordering|That ordering|my year-ordered|portfolio timeline|step back|newer work|listed first|next entry)[^.!?\n]*[.!?]?\s*/gi,
    /\s*That'?s one step older[^.!?\n]*[.!?]?\s*/gi,
    /\s*the next step back after[^.!?\n]*[.!?]?\s*/gi,
  ];
  for (const p of patts) t = t.replace(p, '');
  return t.replace(/\n{3,}/g, '\n\n').trim();
}

function clampQuickAnswerLines(body, maxLines) {
  const raw = String(body || '').trim();
  if (!raw) return raw;
  const lines = raw.split('\n');
  const nonEmptyIdx = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().length > 0) nonEmptyIdx.push(i);
  }
  if (nonEmptyIdx.length <= maxLines) return raw;

  const lastKeep = nonEmptyIdx[maxLines - 1];
  return lines
    .slice(0, lastKeep + 1)
    .join('\n')
    .trim();
}

/**
 * @param {string} text
 * @param {{ hasPriorTurns?: boolean, question?: string }} [options]
 * @returns {string}
 */
export function polishAssistantReply(text, options = {}) {
  let raw = String(text || '');
  const hasPrior = options.hasPriorTurns === true;
  const q = String(options.question || '');

  if (!/###\s*Quick answer\s*/i.test(raw)) {
    if (/###\s*More detail\s*/i.test(raw)) {
      const spl = raw.split(/###\s*More detail\s*/i);
      const pre = (spl[0] || '').trim();
      const more = spl.slice(1).join('### More detail ').trim();
      raw = `### Quick answer\n${pre}\n\n### More detail\n${more}`;
    } else {
      const body = raw.trim();
      if (body) {
        raw = `### Quick answer\n${body}\n`;
      } else if (hasPrior) {
        return raw;
      }
    }
  }

  if (!/###\s*Quick answer\s*/i.test(raw)) {
    if (hasPrior && raw.trim().length > 0) {
      return stripRoboticMetaPhrases(stripRepeatedOpeners(raw.trim()));
    }
    return raw;
  }

  const splitQuick = raw.split(/###\s*Quick answer\s*/i);
  const head = splitQuick[0] || '';
  const afterQuick = splitQuick.slice(1).join('### Quick answer ');
  const splitMore = afterQuick.split(/###\s*More detail\s*/i);
  let quickBody = (splitMore[0] || '').trim();
  const moreBody =
    splitMore.length > 1 ? splitMore.slice(1).join('### More detail ').trim() : '';

  if (hasPrior) {
    const stripped = stripRepeatedOpeners(quickBody);
    if (stripped.length > 0) quickBody = stripped;
  }
  quickBody = stripRoboticMetaPhrases(quickBody);
  quickBody = stripTimelineMetaFromQuick(quickBody);
  quickBody = clampQuickAnswerLines(quickBody, 2);

  const maxQuickChars =
    isShortFactualQuestion(q) || isAmbiguousTechFollowUp(q) ? 220 : 280;
  let trimmedMore = moreBody;
  if (quickBody.length > maxQuickChars) {
    const headSlice = quickBody.slice(0, maxQuickChars);
    let cut = headSlice.lastIndexOf('. ');
    if (cut < 80) cut = headSlice.lastIndexOf('\n');
    if (cut < 80) cut = headSlice.lastIndexOf(' ');
    const spill = quickBody.slice(cut > 80 ? cut + 1 : maxQuickChars).trim();
    quickBody = quickBody.slice(0, cut > 80 ? cut + 1 : maxQuickChars).trim();
    if (spill) {
      trimmedMore = trimmedMore ? `${spill}\n\n${trimmedMore}` : spill;
    }
  }

  if (
    trimmedMore &&
    q &&
    /^(is|was)\s+it\b/i.test(String(q).trim()) &&
    String(q).length < 90
  ) {
    trimmedMore = '';
  } else if (q && isShortFactualQuestion(q) && trimmedMore.length > 420) {
    trimmedMore = `${trimmedMore.slice(0, 400).trim()}…`;
  }

  const qWords = String(q)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (
    trimmedMore &&
    isPriorAnswerChallenge(q) &&
    qWords.length > 0 &&
    qWords.length <= 14
  ) {
    trimmedMore = '';
  }

  let out = `${head}### Quick answer\n${quickBody}`;
  if (trimmedMore) {
    out += `\n\n### More detail\n${trimmedMore}`;
  }
  return out.replace(/\n{4,}/g, '\n\n\n').trim();
}
