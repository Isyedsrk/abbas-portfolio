function namesAProject(low) {
  return /\b(party\s*room|bigg\s*boss|dar\s*\(|healthease|obliviate|fruit\s*slicer|apna\s*super|learning\s*with\s*ar)\b/i.test(
    low
  );
}

/**
 * Tech/stack question with **no** project name and **no** pronoun pointing at the last topic —
 * should not bind to `lastProjectTitle` / Party Room.
 * @param {string} question
 */
export function isGenericUnscopedTechQuestion(question) {
  const s = String(question || '').trim();
  if (s.length < 3 || s.length > 130) return false;
  const low = s.toLowerCase();
  if (namesAProject(low)) return false;
  if (
    /\b(this|that|it|the same|same one|that one|this one|there)\b/i.test(low) ||
    /\b(that project|this project|the project)\b/i.test(low)
  ) {
    return false;
  }
  if (
    !/\b(tech|technology|technologies|stack|framework|frameworks|library|libraries|language)\b/i.test(
      low
    )
  ) {
    return false;
  }
  return /\b(what|which|how|tell me|list|name|use|used|using)\b/i.test(low);
}

/**
 * Very short tech/stack questions with no project name — easy to mis-ground if thread focus is lost.
 * @param {string} question
 */
export function isAmbiguousTechFollowUp(question) {
  const s = String(question || '').trim();
  if (s.length < 4 || s.length > 96) return false;
  const low = s.toLowerCase();
  if (namesAProject(low)) {
    return false;
  }
  return (
    /\b(framework|frameworks|stack|tech\b|technology|technologies|library|libraries|language)\b/i.test(
      low
    ) && /\b(which|what|use|used|using)\b/i.test(low)
  );
}
