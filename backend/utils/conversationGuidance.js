/**
 * Human-style replies for greetings and vague portfolio questions,
 * instead of the generic "I'm not sure / no match" message.
 */

function norm(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Casual hi / hello — short messages only */
export function isGreeting(raw) {
  const q = norm(raw);
  if (!q || q.length > 40) return false;

  return (
    /^(hi+|hello+|hey+|hii+|hiii+|helo+|yo|sup|wassup|whats up|what's up)\s*[!.?]*$/i.test(q) ||
    /^(good\s+(morning|afternoon|evening)|gm|ge)\b[!.?\s]*$/i.test(q) ||
    /^(howdy|greetings)\s*[!.?]*$/i.test(q)
  );
}

/**
 * User wants an overview / "his projects" without naming one.
 * (Keyword recovery in chat.js runs first — if a project name matches, this won't be used.)
 */
export function isVaguePortfolioQuestion(raw) {
  const q = norm(raw);
  if (!q || q.length > 220) return false;

  const patterns = [
    /\b(tell me about|about)\s+(his|her|syed'?s?|the)\s+(project|projects|portfolio|work)\b/,
    /\b(tell me about|what about)\s+(his|her|syed'?s?)\s+(work|stuff)\b/,
    /^(tell me about|what about)\s+(the\s+)?projects\b/,
    /\b(tell me|tell us)\s+(about\s+)?(his|her|syed'?s?|your)\s+projects\b/,
    /\b(show|give)\s+me\s+(all\s+|his\s+|her\s+|syed'?s?\s+)?(the\s+)?projects\b/,
    /\b(list|enumerate)\s+(all\s+|his\s+)?(the\s+)?projects\b/,
    /\b(what|which)\s+projects\s+(has|have|did|are|do|does)\b/,
    /\b(what|which)\s+projects\b\??$/,
    /\b(what|which)\s+project(s)?\s+(has|have|did|does)\s+(he|she|syed)\b/,
    /\b(what|which)\s+project(s)?\s+does\s+he\s+have\b/,
    /\b(show|list)\s+(me\s+)?(all\s+)?(his|her|syed'?s?|the)\s+(project|projects|work)\b/,
    /\ball\s+(of\s+)?(his|her|syed'?s?)\s+projects\b/,
    /\b(his|her|syed'?s?)\s+projects\b/,
    /\bwhat\s+(has|did)\s+(he|she|syed)\s+(built|made|worked on|done)\b/,
    /\bwhat\s+kind(s)?\s+of\s+project(s)?\b/,
    /\bportfolio\b.*\b(project|work|built|made)\b/,
    /^what('?s| is)\s+in\s+(his|her|syed'?s?)\s+portfolio\b/,
    /\bdescribe\s+(his|her|syed'?s?)\s+(project|projects|work)\b/,
    /\bany\s+project(s)?\s+(he|she|syed)\b/,
    /\bproject(s)?\s+he('?s| has| did)\b/,
    /\bname\s+(all\s+|his\s+)?projects\b/,
    /\bhow\s+many\s+projects\b/,
  ];

  if (!patterns.some((re) => re.test(q))) return false;

  // Not vague if they're clearly asking a technical facet about "a" project
  if (
    /\b(tech|stack|language|framework|github|link|repo|feature|how\s+does|how\s+do|source\s+code)\b/.test(
      q
    )
  ) {
    return false;
  }

  return true;
}

function safeTitleForList(t) {
  return String(t)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\*\*/g, '');
}

/** If DB returns no titles (shouldn’t happen) */
const VAGUE_PORTFOLIO_FALLBACK = `### Quick answer
Syed has several projects across mobile, web, games, and AR. Check the **Projects** section on this site, then ask me about any title you’re curious about.

### More detail
You can ask how something works, what it was built with, or what problem it solves — name the project and I’ll take it from there.`;

/**
 * Lists every project title from the DB and invites the user to pick one.
 * @param {Array<{ id?: number, title?: string }>} rows — same order as DB id (matches embed / site flow)
 */
export function buildVaguePortfolioAnswer(rows) {
  const sorted = [...(rows || [])].sort(
    (a, b) => (a.id ?? 0) - (b.id ?? 0)
  );
  const seen = new Set();
  const clean = [];
  for (const r of sorted) {
    const t = safeTitleForList(r.title);
    if (!t || seen.has(t)) continue;
    seen.add(t);
    clean.push(t);
  }

  if (clean.length === 0) {
    return VAGUE_PORTFOLIO_FALLBACK;
  }

  const bullets = clean.map((t) => `- **${t}**`).join('\n');

  return `### Quick answer
Here are **all the projects** in Syed’s portfolio. Pick **any one** and ask me about it — I’ll go into detail on tech, features, or how it works.

### More detail
${bullets}

Use any title from the list — ask what it does, what tech it uses, or anything else you’re curious about.`;
}

export const GREETING_ASSISTANT_ANSWER = `### Quick answer
Hey! Have a look at the **Projects** section on this site — that’s where you’ll see everything Syed has built, with demos and short descriptions.

### More detail
When something catches your eye, come back here and ask me about it — tech stack, how it works, what problem it solves, anything. I’ll walk you through whichever project you’re curious about.`;

export const SOFT_UNCLEAR_ASSISTANT_ANSWER = `### Quick answer
I’d love to help — could you point me to a **specific project** or rephrase a little? Syed’s work covers a lot of areas.

### More detail
Some names people ask about: **DAR**, **Bigg Boss – App Room**, **Learning with AR**, **Obliviate**, **Fruit-Slicer**, **Apna super bazaar**, **Healthease**, **Party Room**. Or use the **Contact** page to reach Syed directly.`;
