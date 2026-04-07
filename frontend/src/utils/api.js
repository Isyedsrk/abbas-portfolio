// API configuration
// Dev: localhost. Production: set VITE_API_URL in .env.production before `npm run build` (e.g. Netlify Drop).
const envUrl = import.meta.env.VITE_API_URL;
/** In dev, empty base uses Vite proxy (see vite.config.js) so chat hits the same backend as your terminal. */
const API_BASE_URL =
  typeof envUrl === 'string' && envUrl.trim()
    ? envUrl.trim().replace(/\/$/, '')
    : import.meta.env.DEV
      ? ''
      : 'http://localhost:3000';

/** Minimum time the “thinking” state shows when the API returns quickly — reads more human */
const HUMAN_REPLY_MIN_MS = 1400;
/** Extra random 0..N ms so pauses aren’t identical every message */
const HUMAN_REPLY_JITTER_MS = 1600;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CHAT_SESSION_STORAGE_KEY = 'abbas_portfolio_chat_session_id';

/** Stable id per browser tab; sent with each /api/ask so turns are stored server-side. */
export function getChatSessionId() {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    let id = sessionStorage.getItem(CHAT_SESSION_STORAGE_KEY);
    if (!id || id.length < 8) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      sessionStorage.setItem(CHAT_SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function clearChatSessionId() {
  try {
    sessionStorage?.removeItem(CHAT_SESSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Label for DevTools console when `responseSource` is missing (older API or edge case). */
function describePortfolioChatSource(data) {
  const fromApi =
    typeof data.responseSource === 'string' ? data.responseSource.trim() : '';
  if (fromApi) return fromApi;
  if (data.aiUsed && data.aiProvider) return String(data.aiProvider);
  const hasProjects =
    Array.isArray(data.relevantProjects) && data.relevantProjects.length > 0;
  if (hasProjects) return 'smart response (fallback — LLM off or failed)';
  return 'static template (no project context — e.g. no retrieval match)';
}

/**
 * Ask a question to the AI chat
 * @param {string} question - The question to ask
 * @param {string | { lastProjectTitle?: string | null, history?: { role: 'user' | 'assistant', content: string }[], sessionId?: string | null } | null | undefined} options - Last focused project title, prior turns, optional session id
 * @returns {Promise<Object>} Response with answer and relevant projects
 */
export async function askQuestion(question, options) {
  const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
  try {
    let lastProjectTitle;
    let history;
    let sessionId;
    if (typeof options === 'string') {
      lastProjectTitle = options;
    } else if (options && typeof options === 'object' && !Array.isArray(options)) {
      lastProjectTitle = options.lastProjectTitle;
      history = options.history;
      sessionId = options.sessionId;
    }

    const payload = { question };
    if (lastProjectTitle && String(lastProjectTitle).trim()) {
      payload.lastProjectTitle = String(lastProjectTitle).trim();
    }
    if (Array.isArray(history) && history.length > 0) {
      payload.history = history.slice(-12);
    }
    const sid =
      sessionId && String(sessionId).trim() ? String(sessionId).trim() : getChatSessionId();
    if (sid) {
      payload.sessionId = sid;
    }
    const response = await fetch(`${API_BASE_URL}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get response');
    }

    const data = await response.json();

    const source = describePortfolioChatSource(data);
    console.log(
      `%c[Portfolio Chat]%c Response source: %c${source}`,
      'color:#ca8a04;font-weight:bold',
      'color:inherit;font-weight:normal',
      'color:#16a34a;font-weight:bold'
    );

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = now - started;
    const targetDelay =
      HUMAN_REPLY_MIN_MS + Math.floor(Math.random() * HUMAN_REPLY_JITTER_MS);
    const remaining = Math.max(0, targetDelay - elapsed);
    if (remaining > 0) {
      await sleep(remaining);
    }

    if (typeof data.sessionId === 'string' && data.sessionId.trim()) {
      try {
        sessionStorage?.setItem(CHAT_SESSION_STORAGE_KEY, data.sessionId.trim());
      } catch {
        /* ignore */
      }
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Check if the backend server is healthy
 * @returns {Promise<boolean>} True if server is healthy
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

