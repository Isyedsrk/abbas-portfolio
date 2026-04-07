/**
 * Detect short thanks / goodbye / end-of-chat messages so we don't answer
 * with the "no matching project" portfolio guidance.
 */

const EXACT_CLOSING_PATTERNS = [
  /^thanks\s*[!?.]*$/i,
  /^thank\s*you\s*[!?.]*$/i,
  /^(thanks?|thank you|thx|ty|tysm)(\s+[!.]+)?$/i,
  /^(thanks?|thank you|thx)(\s+(so much|a lot|again|anyway))?\s*[!.]*$/i,
  /^(many thanks|much appreciated|appreciate it|cheers)\s*[!.]*$/i,
  /^(bye|good ?bye|see you(\s+later)?|see ya|cya|later|ttyl|talk to you later)\s*[!.]*$/i,
  /^(ok|okay|alright)[, ]+(thanks?|thank you|bye|good ?bye)\s*[!.]*$/i,
  /^(that'?s all|that is all|no more questions?|i'?m good|i'?m done|all good)\s*[!.]*$/i,
  /^(have a good (day|one|night)|take care|good (day|night))\s*[!.]*$/i,
  /^thanks?\s+for\s+(your\s+)?(help|time|the info|the chat|chatting|talking|everything)\s*[!.]*$/i,
  /^thank you\s+for\s+(your\s+)?(help|time|the info|the chat|chatting|talking|everything)\s*[!.]*$/i,
  /^(nice\s+)?talk(ing)?\s+to\s+you\s*[!.]*$/i,
  /^(good\s+(talk|chat)|great,? thanks?)\s*[!.]*$/i,
  /^((all\s+)?good|perfect),?\s*(thanks?|thank you|ty)\s*[!.]*$/i,
];

/** Words that suggest the user is still asking about content, not signing off */
const CONTENT_QUERY_HINTS =
  /\b(what|how|which|why|when|where|tell me|explain|describe|show|link|github|project|portfolio|tech|stack|feature|built|made|does|work)\b/i;

export function isConversationClosing(raw) {
  const q = String(raw).trim();
  if (!q) return false;
  if (q.length > 100) return false;

  const n = q.replace(/\s+/g, ' ').trim();

  if (EXACT_CLOSING_PATTERNS.some((re) => re.test(n))) {
    return true;
  }

  if (
    n.length <= 55 &&
    /\b(thanks?|thank you|thx|ty|bye|goodbye|see you)\b/i.test(n) &&
    !CONTENT_QUERY_HINTS.test(n)
  ) {
    return true;
  }

  return false;
}

/** Matches frontend structured format (### Quick answer) */
export const CLOSING_ASSISTANT_ANSWER = `### Quick answer
You're welcome — thanks for chatting! If you think of anything else about Syed's projects, just ask. Have a great day!`;
