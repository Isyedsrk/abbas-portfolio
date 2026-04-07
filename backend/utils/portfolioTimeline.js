import { PORTFOLIO_TIMELINE_NEWEST_FIRST } from '../data/portfolioTimelineOrder.js';

/**
 * Timeline position for a `projectDetails` key (0 = newest). Unknown keys sort last.
 * @param {string} detailsKey
 * @returns {number}
 */
export function timelineIndexForDetailsKey(detailsKey) {
  const k = String(detailsKey || '').trim().toLowerCase();
  const i = PORTFOLIO_TIMELINE_NEWEST_FIRST.findIndex(
    (t) => t.toLowerCase() === k
  );
  return i === -1 ? 9999 : i;
}

/**
 * Single source of truth for recency order (newest first) — see `portfolioTimelineOrder.js`.
 * Any `projectDetails` entry missing from the canonical list is appended alphabetically.
 * @param {Record<string, { developedIn?: string }>} projectDetails
 * @returns {string[]} titles
 */
export function orderProjectTitlesByRecency(projectDetails) {
  const pd = projectDetails || {};
  const ordered = PORTFOLIO_TIMELINE_NEWEST_FIRST.filter((t) => pd[t] != null);
  const seen = new Set(ordered.map((t) => t.toLowerCase()));
  const rest = Object.keys(pd).filter((k) => !seen.has(k.toLowerCase()));
  rest.sort((a, b) => String(a).localeCompare(String(b)));
  return [...ordered, ...rest];
}

/**
 * Sort retrieved RAG rows so **Relevant Information** project blocks follow the canonical timeline
 * (newest first), not embedding similarity.
 * @param {Array<{ title: string }>} projects
 * @param {(title: string) => string | undefined} [resolveProjectDetailsKey]
 * @returns {Array<{ title: string }>}
 */
export function sortRetrievedProjectsByTimeline(projects, resolveProjectDetailsKey) {
  if (!Array.isArray(projects) || projects.length < 2) return projects;
  const copy = [...projects];
  copy.sort((a, b) => {
    const ka = resolveProjectDetailsKey?.(a.title) || a.title;
    const kb = resolveProjectDetailsKey?.(b.title) || b.title;
    return timelineIndexForDetailsKey(ka) - timelineIndexForDetailsKey(kb);
  });
  return copy;
}

/**
 * Sort title strings (e.g. no-match fallback list) by canonical timeline.
 * @param {string[]} titles
 * @param {(title: string) => string | undefined} [resolveProjectDetailsKey]
 * @returns {string[]}
 */
export function sortTitleStringsByTimeline(titles, resolveProjectDetailsKey) {
  if (!Array.isArray(titles) || titles.length < 2) return titles;
  const copy = [...titles];
  copy.sort((a, b) => {
    const ka = resolveProjectDetailsKey?.(a) || a;
    const kb = resolveProjectDetailsKey?.(b) || b;
    return timelineIndexForDetailsKey(ka) - timelineIndexForDetailsKey(kb);
  });
  return copy;
}

/**
 * Team / headcount / "biggest team" questions must use project Details — never timeline ordinals.
 * @param {string} question
 */
export function isTeamOrCompositionQuery(question) {
  const q = String(question || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  if (!q) return false;
  return (
    /\b(team\s*size|teams?\b|team\b.*\b(size|members|people|big|small)|\bmembers?\b.*\b(team|project)|how\s+many\s+(people|members|developers?)|\bsolo\b|\bindividual\b.*\b(project|build)|who\s+(was|is)\s+on\s+(the\s+)?team|work\s+alone|worked\s+alone|biggest\s+team|largest\s+team|smallest\s+team|most\s+members|fewest\s+members)\b/i.test(
      q
    ) ||
    /\b(which|what)\s+project\b[\s\S]{0,90}\b(team|members|people|size|solo|individual)\b/i.test(
      q
    )
  );
}

/**
 * "Second last / third last" = 2nd, 3rd by recency after the latest (index 0 = newest).
 * Returns 0-based index into orderProjectTitlesByRecency, or null.
 * @param {string} question
 */
export function parseRecencyOrdinalIndex(question) {
  const q = String(question || '').toLowerCase();
  if (!q.trim()) return null;

  if (isTeamOrCompositionQuery(question)) return null;

  if (/\b(second|2nd|two)\s+last\b/i.test(q)) return 1;
  if (/\b(third|3rd|three)\s+last\b/i.test(q)) return 2;
  if (/\b(fourth|4th)\s+last\b/i.test(q)) return 3;
  if (/\b(fifth|5th)\s+last\b/i.test(q)) return 4;

  if (/\bsecond\s+most\s+recent\b/i.test(q)) return 1;
  if (/\bthird\s+most\s+recent\b/i.test(q)) return 2;
  if (/\bfourth\s+most\s+recent\b/i.test(q)) return 3;

  if (/\bpenultimate\s+(project|one)\b/i.test(q)) return 1;
  if (/\b(the\s+)?one\s+before\s+(the\s+)?latest\b/i.test(q)) return 1;
  if (
    /\bbefore\s+(the\s+)?latest\b/i.test(q) &&
    /\b(project|one)\b/i.test(q) &&
    !/\b(biggest|largest|smallest|best|worst|team|size)\b/i.test(q)
  ) {
    return 1;
  }
  if (/\bproject\s+right\s+before\s+(the\s+)?latest\b/i.test(q)) return 1;

  return null;
}

/**
 * Detect "latest / last / most recent project" style questions (not generic "challenges").
 * Does NOT match "second last", "before latest", etc. — those use parseRecencyOrdinalIndex.
 * @param {string} question
 */
export function isLatestProjectQuery(question) {
  const q = String(question || '').toLowerCase();
  if (/\b(challenges?|difficult|problem|issue|obstacle|failed)\b/i.test(q)) {
    return false;
  }
  if (isTeamOrCompositionQuery(question)) return false;
  if (parseRecencyOrdinalIndex(question) != null) return false;
  if (
    /\b(second|third|fourth|fifth|2nd|3rd|4th|5th)\s+last\b/i.test(q) ||
    /\b(second|third|2nd|3rd)\s+most\s+recent\b/i.test(q) ||
    /\bbefore\s+(the\s+)?latest\b/i.test(q) ||
    /\b(one\s+)?before\s+(the\s+)?(latest|most\s+recent)\b/i.test(q) ||
    /\bpenultimate\b/i.test(q)
  ) {
    return false;
  }
  return (
    /\b(latest|most recent|newest)\b[\s\S]{0,48}\b(project|work|build|app|thing)\b/i.test(
      q
    ) ||
    /\b(his|syed|the)\s+(latest|most recent|newest)\b/i.test(q) ||
    /\b(what|which)\s+(is|was)\s+(his|the|syed'?s?)\s+(latest|most recent|newest)\b/i.test(
      q
    ) ||
    /\b(latest|most recent|newest)\s+project\b/i.test(q) ||
    (/\blast\b[\s\S]{0,40}\b(project|work|build|app|thing)\b/i.test(q) &&
      !/\b(second|third|fourth|2nd|3rd|4th)\s+last\b/i.test(q) &&
      !/\blast\s+(two|three|2|3)\b/i.test(q))
  );
}

/**
 * Compact team roster from projectDetails for "biggest team" / team size questions.
 * @param {Record<string, object>} projectDetails
 */
export function buildTeamCompositionHint(projectDetails) {
  const lines = [];
  let maxSize = -1;
  const maxTitles = [];
  for (const [title, d] of Object.entries(projectDetails || {})) {
    if (!d) continue;
    if (d.isIndividual === true) {
      lines.push(`- **${title}**: individual (solo).`);
    } else if (typeof d.teamSize === 'number') {
      let tail = `team of ${d.teamSize}`;
      if (d.teamLead) tail += `; lead: ${d.teamLead}`;
      lines.push(`- **${title}**: ${tail}.`);
      if (d.teamSize > maxSize) {
        maxSize = d.teamSize;
        maxTitles.length = 0;
        maxTitles.push(title);
      } else if (d.teamSize === maxSize) {
        maxTitles.push(title);
      }
    }
  }
  if (lines.length === 0) return '';
  const largestLine =
    maxSize > 0 && maxTitles.length > 0
      ? `**LARGEST TEAM (by headcount):** **${maxTitles.join(' / ')}** — **${maxSize}** people. "Biggest / largest / most members" = this project (compare numbers below) — never answer from timeline phrases like "second last".`
      : '';
  return [
    'TEAM SIZES (authoritative for team-size / "biggest or smallest team" questions — use this, not timeline order):',
    largestLine,
    ...lines,
    'For "which project had the biggest team", pick the project with the highest team number; solo = 1 person.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildOrdinalTimelineAnswer(projectDetails, ordinalIndex) {
  const ordered = orderProjectTitlesByRecency(projectDetails);
  if (ordinalIndex < 1 || ordinalIndex >= ordered.length) return null;
  const picked = ordered[ordinalIndex];
  return `### Quick answer\n**${picked}**.`;
}

/**
 * "And before that?" — walk one step older on the recency-ordered list (newest at index 0).
 * @param {string} question
 */
export function isRelativeTimelineOlderQuery(question) {
  const q = String(question || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!q || q.length > 85) return false;
  if (isTeamOrCompositionQuery(question)) return false;
  return (
    /^(and\s+)?before\s+that\??$/i.test(q) ||
    /^(what\s+)?(about\s+)?before\s+that\??$/i.test(q) ||
    /^(the\s+)?one\s+before\s+that\??$/i.test(q) ||
    (/\b(even\s+)?older\b/i.test(q) && q.length < 48) ||
    /\bwhat\s+came\s+before\b/i.test(q) ||
    /\bnext\s+oldest\b/i.test(q) ||
    /^(and\s+)?prior\s+to\s+that\??$/i.test(q) ||
    /\bgo\s+back\s+one\b/i.test(q)
  );
}

/**
 * @param {Record<string, { developedIn?: string }>} projectDetails
 * @param {string} anchorTitle
 * @returns {{ older: string | null, anchor: string, atEnd: boolean }}
 */
export function resolveNextOlderTitleFromAnchor(projectDetails, anchorTitle) {
  const ordered = orderProjectTitlesByRecency(projectDetails);
  const a = String(anchorTitle || '').trim().toLowerCase();
  let idx = ordered.findIndex((t) => t.toLowerCase() === a);
  if (idx === -1) {
    const base = a.split('(')[0].trim();
    idx = ordered.findIndex(
      (t) =>
        t.toLowerCase().includes(base) ||
        (base.length > 4 && base.includes(t.toLowerCase().split('(')[0].trim()))
    );
  }
  if (idx === -1) {
    return { older: null, anchor: String(anchorTitle || ''), atEnd: false };
  }
  if (idx >= ordered.length - 1) {
    return { older: null, anchor: ordered[idx], atEnd: true };
  }
  return { older: ordered[idx + 1], anchor: ordered[idx], atEnd: false };
}

/**
 * @param {string | null} olderTitle
 * @param {string} anchorTitle
 * @param {boolean} atEnd
 */
export function buildTimelineOlderStepAnswer(olderTitle, anchorTitle, atEnd) {
  if (atEnd || !olderTitle) {
    const a = anchorTitle || 'that project';
    return `### Quick answer\n**${a}** — nothing before that in my lineup.`;
  }
  return `### Quick answer\n**${olderTitle}**.`;
}

/**
 * Use only Quick answer (or pre–More detail) text when inferring which project
 * the user is stepping back from — avoids ### More detail mentioning Party Room etc.
 * @param {string} fullContent
 */
export function sliceAssistantForTimelineAnchor(fullContent) {
  const c = String(fullContent || '');
  const beforeMore = c.split(/###\s*More detail\s*/i)[0] || c;
  const afterQuick = beforeMore.split(/###\s*Quick answer\s*/i);
  const body = afterQuick.length > 1 ? afterQuick.slice(1).join('') : beforeMore;
  return body.slice(0, 900);
}

/**
 * Substrings to find a canonical title inside assistant prose (e.g. "Bigg Boss" vs "Bigg Boss – App Room").
 * @param {string} title
 * @returns {string[]}
 */
export function titleMatchNeedlesForTimeline(title) {
  const base = String(title || '')
    .split('(')[0]
    .trim();
  const out = new Set();
  if (base.length >= 3) out.add(base);
  const beforeDash = base.split(/\s*[–—]\s*/)[0]?.trim();
  if (beforeDash && beforeDash.length >= 3) out.add(beforeDash);
  return [...out];
}

/**
 * First portfolio title mention in anchor slice (earliest character offset wins).
 * @param {string} sliceText
 * @param {string[]} orderedTitles
 * @returns {string | null}
 */
export function findEarliestPortfolioTitleInText(sliceText, orderedTitles) {
  const low = String(sliceText || '').toLowerCase();
  let bestPos = Infinity;
  let bestTitle = null;
  for (const t of orderedTitles) {
    for (const needle of titleMatchNeedlesForTimeline(t)) {
      if (needle.length < 3) continue;
      const pos = low.indexOf(needle.toLowerCase());
      if (pos !== -1 && pos < bestPos) {
        bestPos = pos;
        bestTitle = t;
      }
    }
  }
  return bestTitle;
}

/**
 * All portfolio titles whose needles appear in slice (for timeline walk anchoring).
 * @param {string} sliceText
 * @param {string[]} orderedTitles
 * @returns {string[]}
 */
export function findMentionedPortfolioTitlesInText(sliceText, orderedTitles) {
  const low = String(sliceText || '').toLowerCase();
  const found = new Set();
  for (const t of orderedTitles) {
    for (const needle of titleMatchNeedlesForTimeline(t)) {
      if (needle.length < 3) continue;
      if (low.includes(needle.toLowerCase())) {
        found.add(t);
        break;
      }
    }
  }
  return [...found];
}

/**
 * For "and before that?" follow-ups: anchor should be the project we *landed on* in the last reply.
 * When several titles appear (e.g. "latest Party Room … Bigg Boss"), choose the **oldest** on the
 * recency list among them so we step back from the right place — never from stale lastProjectTitle alone.
 * @param {string} sliceText
 * @param {string[]} orderedTitles — newest first
 * @returns {string | null}
 */
export function pickTimelineWalkAnchorFromSlice(sliceText, orderedTitles) {
  const mentioned = findMentionedPortfolioTitlesInText(sliceText, orderedTitles);
  if (mentioned.length === 0) return null;
  let best = mentioned[0];
  let bestIdx = orderedTitles.findIndex(
    (x) => x.toLowerCase() === best.toLowerCase()
  );
  for (let i = 1; i < mentioned.length; i++) {
    const t = mentioned[i];
    const idx = orderedTitles.findIndex((x) => x.toLowerCase() === t.toLowerCase());
    if (idx !== -1 && idx > bestIdx) {
      bestIdx = idx;
      best = t;
    }
  }
  return best;
}

/**
 * @param {Record<string, { developedIn?: string }>} projectDetails
 * @returns {string} block prepended to RAG context
 */
export function buildPortfolioTimelineBlock(projectDetails) {
  const ordered = orderProjectTitlesByRecency(projectDetails);
  const items = ordered.map((title) => {
    const d = projectDetails[title] || {};
    const raw = d.developedIn || '';
    return { title, developedIn: raw };
  });

  const byYearLine = items
    .map((x) => `${x.title} — ${x.developedIn || 'year not set'}`)
    .join('; ');

  const numberedNewestFirst = ordered
    .map((title, i) => `${i + 1}. ${title}`)
    .join('; ');

  const secondTitle = ordered[1] || '';
  const thirdTitle = ordered[2] || '';
  const latestTitle = ordered[0] || 'Party Room';

  return [
    'PORTFOLIO TIMELINE (authoritative — use for questions about year order, "latest", "most recent", "last/newest project", "second last", "before latest"):',
    `Ordered **newest → oldest** (same order everywhere below): ${numberedNewestFirst}.`,
    `Recency order (newest first, index 0 = latest): ${byYearLine}.`,
    `**Latest (index 0):** **${latestTitle}** — see developedIn in the list above.`,
    secondTitle
      ? `**Second-most-recent (index 1):** **${secondTitle}** — use this for "second last project", "before Party Room", "penultimate", "2nd most recent" when counting from newest.`
      : '',
    thirdTitle
      ? `**Third-most-recent (index 2):** **${thirdTitle}** — for "third last" / "3rd most recent".`
      : '',
    secondTitle
      ? `When the user asks only for the single **latest** project, answer **${latestTitle}**. When they ask **second last** / **before latest** / **2nd most recent**, answer **${secondTitle}** — not **${latestTitle}**.`
      : '',
    'Do not claim you cannot determine ordering — the list above is definitive.',
    '',
    'PORTFOLIO COMPARISON (authoritative for *hardest / most challenging / toughest / best / proudest project* — these are whole-portfolio questions; **do not** answer using only whatever project was discussed last in chat unless the user names that project):',
    '- **Bigg Boss – App Room:** Strong answer for *production / delivery difficulty* — real-time Unity client + React/Node/Socket.IO backend, TV production constraints, multi-layer interactive flows.',
    '- **Party Room:** Strong answer for *solo product scope* — synchronized video, Firebase, WebSockets, host control, ongoing 2025–Present.',
    '- Other projects (e.g. Healthease, DAR, games, AR) have their own difficulty; tie-break using the angles above instead of defaulting to the last-mentioned project.',
  ]
    .filter(Boolean)
    .join('\n');
}
