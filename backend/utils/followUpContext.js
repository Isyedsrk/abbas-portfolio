/**
 * Detect short follow-up questions that refer to the previously discussed project
 * (e.g. "when was it done?" after talking about Healthease).
 */

export function isFollowUpQuestion(question) {
  const q = String(question || '').trim();
  if (q.length === 0 || q.length > 160) return false;

  const lower = q.toLowerCase();

  if (/^(hi|hello|hey|thanks|thank you|ok|okay|bye|goodbye)[\s!.]*$/i.test(q)) {
    return false;
  }

  return (
    /\b(this|that|it)\b/.test(lower) ||
    /\b(this project|the project|that project|same project)\b/.test(lower) ||
    /^(when|what|who|how|why|where|which|did|was|is|are|can|could|would)\b/i.test(q) ||
    /\b(when|what year)\b[\s\S]{0,55}\b(done|finished|complete|built|made)\b/i.test(lower)
  );
}
