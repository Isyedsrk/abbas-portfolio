/**
 * Pair user rows with the following assistant row per session (ordered by time).
 */

/**
 * @param {Array<{ id?: number, session_id: string, role: string, content: string, response_source?: string | null, ai_used?: number | null, ai_provider?: string | null, relevant_projects_json?: string | null, created_at?: string }>} rows
 */
export function pairUserAssistantMessages(rows) {
  const sorted = [...rows].sort((a, b) => {
    const sa = String(a.session_id);
    const sb = String(b.session_id);
    if (sa !== sb) return sa.localeCompare(sb);
    const ta = String(a.created_at || '');
    const tb = String(b.created_at || '');
    if (ta !== tb) return ta.localeCompare(tb);
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });

  /** @type {Array<object>} */
  const pairs = [];
  let pendingUser = null;

  for (const row of sorted) {
    const role = String(row.role || '').toLowerCase();
    if (role === 'user') {
      pendingUser = row;
      continue;
    }
    if (role === 'assistant') {
      if (
        pendingUser &&
        String(pendingUser.session_id) === String(row.session_id)
      ) {
        pairs.push({
          sessionId: row.session_id,
          userMessageId: pendingUser.id,
          assistantMessageId: row.id,
          question: String(pendingUser.content || '').trim(),
          answer: String(row.content || '').trim(),
          responseSource: row.response_source ?? null,
          aiUsed: Boolean(row.ai_used),
          aiProvider: row.ai_provider ?? null,
          relevantProjectsJson: row.relevant_projects_json ?? null,
          createdAt: row.created_at ?? null,
        });
        pendingUser = null;
      }
    }
  }

  return pairs;
}
