// API configuration
// Dev: localhost. Production: set VITE_API_URL in .env.production before `npm run build` (e.g. Netlify Drop).
const envUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL =
  typeof envUrl === 'string' && envUrl.trim()
    ? envUrl.trim().replace(/\/$/, '')
    : import.meta.env.DEV
      ? 'http://localhost:3000'
      : 'http://localhost:3000';

/** Minimum time the “thinking” state shows when the API returns quickly — reads more human */
const HUMAN_REPLY_MIN_MS = 1400;
/** Extra random 0..N ms so pauses aren’t identical every message */
const HUMAN_REPLY_JITTER_MS = 1600;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ask a question to the AI chat
 * @param {string} question - The question to ask
 * @param {string|null|undefined} lastProjectTitle - Title from last response's relevantProjects[0] for follow-ups ("when was it done?")
 * @returns {Promise<Object>} Response with answer and relevant projects
 */
export async function askQuestion(question, lastProjectTitle) {
  const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
  try {
    const payload = { question };
    if (lastProjectTitle && String(lastProjectTitle).trim()) {
      payload.lastProjectTitle = String(lastProjectTitle).trim();
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

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = now - started;
    const targetDelay =
      HUMAN_REPLY_MIN_MS + Math.floor(Math.random() * HUMAN_REPLY_JITTER_MS);
    const remaining = Math.max(0, targetDelay - elapsed);
    if (remaining > 0) {
      await sleep(remaining);
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

