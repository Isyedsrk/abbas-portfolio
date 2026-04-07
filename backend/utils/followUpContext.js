/**
 * Detect short follow-up questions that refer to the previously discussed project
 * (e.g. "when was it done?" after talking about Healthease).
 */

/**
 * Whole-portfolio comparison (hardest / best / most challenging) — must NOT reuse
 * lastProjectTitle; "which … challenging" starts with "which" but isn’t a thread follow-up.
 */
export function isPortfolioWideComparisonQuestion(question) {
  const q = String(question || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  if (!q || q.length > 220) return false;

  const compares =
    /\b(most challenging|hardest|toughest|most difficult|biggest challenge)\b/.test(
      q
    ) ||
    /\b(best|favorite|favourite|proudest)\s+project\b/.test(q) ||
    /\bwhich\s+project\b[\s\S]{0,80}\b(most|hardest|best|challenging|difficult|tough)\b/.test(
      q
    ) ||
    /\bwhich\s+(is|was)\s+(the\s+|his\s+|her\s+|syed'?s?\s+)?(hardest|toughest|most challenging|most difficult)\b/.test(
      q
    ) ||
    /\b(hardest|toughest|most challenging|most difficult)\s+project\b/.test(q);

  if (!compares) return false;

  const namesProject =
    /\b(dar\b|healthease|obliviate|party room|bigg boss|fruit.?slicer|apna super|learning with ar)\b/i.test(
      q
    );
  if (namesProject) return false;

  return true;
}

export function isFollowUpQuestion(question) {
  const q = String(question || '').trim();
  if (q.length === 0 || q.length > 160) return false;

  const lower = q.toLowerCase();

  /** Openers that are never “continue previous topic” */
  if (/^(hi|hello|hey|hii+)\s*[!.?]*$/i.test(q)) {
    return false;
  }
  if (/^(thanks?|thank you|thx|ty|bye|good ?bye)\s*[!.?]*$/i.test(q)) {
    return false;
  }

  /**
   * After “Want me to elaborate?” / “Should I go on?” — single-word replies must
   * still count as follow-ups so lastProjectTitle + RAG stay on the same project.
   */
  if (
    /^(yes|yeah|yep|yup|sure|ok|okay|alright|please|go on|go ahead|do it|tell me more|more details?|elaborate|continue|sounds good)\s*[!.?]*$/i.test(
      q
    )
  ) {
    return true;
  }

  return (
    /\b(this|that|it)\b/.test(lower) ||
    /\b(this project|the project|that project|same project)\b/.test(lower) ||
    /^(when|what|who|how|why|where|which|did|was|is|are|can|could|would)\b/i.test(q) ||
    /\b(when|what year)\b[\s\S]{0,55}\b(done|finished|complete|built|made)\b/i.test(lower)
  );
}
