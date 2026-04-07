/**
 * Ground “do you have X tech?” questions in projectDetails (no LLM guessing).
 */

import { resolveProjectDetailsKey } from './projectKeywordMatch.js';
import { orderProjectTitlesByRecency } from './portfolioTimeline.js';

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[–—\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** User asks whether portfolio has a technology / stack */
export function isTechExistenceQuestion(question) {
  const q = norm(question);
  if (!q || q.length > 220) return false;
  if (
    /\b(python|django|flask|vuforia|\bar\b|augmented reality)\b/i.test(q) &&
    q.length < 48
  ) {
    return true;
  }
  if (
    !/\b(tech|stack|language|framework|built|have|had|any|some|project|portfolio|work|using|use)\b/i.test(
      q
    ) &&
    q.length > 36
  ) {
    return false;
  }
  return /\b(python|django|flask|javascript|typescript|react|node\.?\s*js|vue|vite|unity|vuforia|\bar\b|augmented reality|opencv|firebase|java|kotlin|android|c#|csharp|socket\.?\s*io|websocket|machine learning|ml\b|computer vision)\b/i.test(
    q
  );
}

function projectBlob(titleKey, details) {
  const d = details || {};
  return norm(
    [
      titleKey,
      ...(Array.isArray(d.technologies) ? d.technologies : []),
      ...(Array.isArray(d.features) ? d.features : []),
      d.type || '',
      d.category || '',
      d.additionalInfo || '',
    ].join(' ')
  );
}

function questionWantsPython(q) {
  return /\bpython\b|django|flask/i.test(q);
}

function questionWantsAR(q) {
  return (
    /\baugmented reality\b|\bvuforia\b|marker-?based\s*ar/i.test(q) ||
    /\b(ar|a\.r\.)\s+(project|app)\b/i.test(q) ||
    /\bproject.*\bar\b|\bar\s*project/i.test(q)
  );
}

/**
 * @param {Record<string, object>} projectDetails
 * @param {string} question
 * @returns {string} block for RAG (may be empty)
 */
export function buildTechGroundingBlock(projectDetails, question) {
  const q = norm(question);
  const lines = [];

  const matches = [];
  for (const [title, d] of Object.entries(projectDetails || {})) {
    const blob = projectBlob(title, d);
    let hit = false;
    if (questionWantsPython(q) && /\bpython\b/.test(blob)) hit = true;
    if (questionWantsAR(q) && (/\bvuforia\b|\baugmented\b|\bar\b/i.test(blob) || /learning with ar/i.test(title)))
      hit = true;
    if (hit) {
      const techs = Array.isArray(d.technologies) ? d.technologies.join(', ') : '';
      matches.push({ title, techs });
    }
  }

  if (matches.length === 0) {
    return '';
  }

  lines.push(
    'TECH CHECK (authoritative — if the user asks about Python, AR, Vuforia, etc., these rows are in the portfolio and you must NOT deny them):'
  );
  for (const m of matches) {
    lines.push(`- **${m.title}** — technologies include: ${m.techs || '(see structured project details)'}.`);
  }
  lines.push(
    'If you said earlier that there was no such project, that was wrong — correct yourself using the list above only.'
  );

  return lines.join('\n');
}

/**
 * Merge retrieval rows with grounded tech rows from SQLite `allRows`.
 * @param {Array} relevantProjects — existing hits
 * @param {Record<string, object>} projectDetails
 * @param {Array<{ title: string, description?: string, links?: string, id?: number }>} allRows
 * @param {string} question
 * @param {number} maxTotal
 */
/**
 * "Do you have any Python projects?" — presence question, not stack deep-dives.
 * @param {string} question
 */
export function isPythonPresencePortfolioQuestion(question) {
  const q = norm(question);
  if (!q.includes('python')) return false;
  if (
    /\b(version|versions|venv|virtualenv|pip|package|import|syntax|debug|traceback|django|flask\s+vs)\b/i.test(
      q
    ) &&
    !/\b(any|have|project|projects|portfolio)\b/i.test(q)
  ) {
    return false;
  }
  return (
    /\b(do you have|have you|have any|got any|any|some)\b[\s\S]{0,50}\bpython\b/i.test(q) ||
    /\bpython\b[\s\S]{0,55}\b(project|projects|portfolio|anything)\b/i.test(q) ||
    /\bpython\b[\s\S]{0,40}\b(work|built|used|use)\b/i.test(q)
  );
}

/**
 * Short grounded reply for Python presence (avoids "I have no Python" hallucinations).
 * @param {Record<string, object>} projectDetails
 * @returns {string | null}
 */
export function buildPythonPresenceStaticAnswer(projectDetails) {
  const ordered = orderProjectTitlesByRecency(projectDetails);
  let title = null;
  for (const t of ordered) {
    const d = projectDetails[t];
    const techs = Array.isArray(d?.technologies) ? d.technologies : [];
    if (techs.some((x) => /\bpython\b/i.test(String(x)))) {
      title = t;
      break;
    }
  }
  if (!title) {
    for (const [k, d] of Object.entries(projectDetails || {})) {
      const techs = Array.isArray(d?.technologies) ? d.technologies : [];
      if (techs.some((x) => /\bpython\b/i.test(String(x)))) {
        title = k;
        break;
      }
    }
  }
  if (!title) return null;
  return {
    focusTitle: title,
    answer: `### Quick answer\nYes — **${title}** is my Python project (ML / OpenCV stack in the portfolio data).\n\n### More detail\nPython is listed in that project’s technologies, so do **not** say there are no Python projects.`,
  };
}

export function mergeTechGroundedProjects(
  relevantProjects,
  projectDetails,
  allRows,
  question,
  maxTotal
) {
  if (!isTechExistenceQuestion(question) || !Array.isArray(allRows)) {
    return relevantProjects;
  }

  const wantP = questionWantsPython(norm(question));
  const wantAR = questionWantsAR(norm(question));
  if (!wantP && !wantAR) return relevantProjects;

  const byTitle = new Map();
  for (const p of relevantProjects || []) {
    byTitle.set(String(p.title || '').trim().toLowerCase(), p);
  }

  for (const [titleKey, d] of Object.entries(projectDetails || {})) {
    const blob = projectBlob(titleKey, d);
    let need = false;
    if (wantP && /\bpython\b/.test(blob)) need = true;
    if (wantAR && (/\bvuforia\b|\baugmented\b|\bar\b/i.test(blob) || /learning with ar/i.test(titleKey)))
      need = true;
    if (!need) continue;

    const row = allRows.find(
      (r) => String(r.title || '').toLowerCase() === String(titleKey).toLowerCase()
    );
    const rowAlt =
      row ||
      allRows.find((r) => resolveProjectDetailsKey(r.title) === resolveProjectDetailsKey(titleKey));
    const hit = rowAlt;
    if (!hit) continue;
    const k = String(hit.title || '').trim().toLowerCase();
    if (byTitle.has(k)) continue;
    byTitle.set(k, {
      id: hit.id,
      title: hit.title,
      description: hit.description,
      links: hit.links,
      similarity: 0.97,
    });
  }

  const merged = Array.from(byTitle.values()).sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  return merged.slice(0, maxTotal);
}
