/**
 * Hints so the model repairs prior mistakes and stays aligned with portfolio data.
 */

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** User pushes back on a prior answer */
export function isPriorAnswerChallenge(question) {
  const q = norm(question);
  if (!q || q.length > 200) return false;
  return (
    /\b(but you|you said|you told|earlier you|you also|thought you|why did you|that'?s wrong|not what you|contradict)\b/i.test(
      q
    ) ||
    /^(are you sure|really\??|sure\??)$/i.test(q) ||
    /\bare you sure\b/i.test(q)
  );
}

/**
 * Prepended to RAG user payload when user challenges or asks tech existence.
 * @param {Record<string, object>} projectDetails
 * @param {string} question
 */
export function buildConsistencyGroundingPreamble(projectDetails, question, options = {}) {
  const challenge = isPriorAnswerChallenge(question);
  const techQ = options.techExistence === true;
  if (!challenge && !techQ) return '';

  const q = norm(question);
  const lines = [
    'GROUNDING RULES:',
    '- Facts must match the structured project data in Relevant Information. Never invent team sizes or stacks.',
    '- If you already denied something that the data below confirms (e.g. Python in DAR, AR in Learning with AR), you were wrong: briefly admit the mistake and answer with the correct project names.',
    '- Do not say "I might have" or dodge — state the correction clearly.',
    '- Do not answer "yes I am sure" or "I\'m sure I mentioned … earlier" to defend chat history — say "Let me clarify:" and give the correct fact from the snapshot below.',
    '- On short challenges like "are you sure?", restate the fact in one or two plain sentences; do not circle back to what you said before unless correcting it.',
  ];

  const facts = [];
  for (const [title, d] of Object.entries(projectDetails || {})) {
    const tech = Array.isArray(d.technologies) ? d.technologies.join(', ') : '';
    if (/\bpython\b/i.test(tech)) {
      facts.push(`**${title}** lists Python in its technologies.`);
    }
    if (/\bvuforia\b|\baugmented\b/i.test(tech) || /learning with ar/i.test(title)) {
      facts.push(`**${title}** is an AR-related project (Unity / Vuforia / AR features).`);
    }
    if (typeof d.teamSize === 'number' && d.teamSize > 0) {
      facts.push(`**${title}**: team size ${d.teamSize} in portfolio notes (use this exact number only).`);
    }
  }

  if (facts.length && (challenge || techQ)) {
    lines.push('', 'AUTHORITATIVE SNAPSHOT (do not contradict):', ...facts.slice(0, 20));
  }

  return lines.join('\n');
}
