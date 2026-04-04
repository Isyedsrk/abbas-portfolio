// API configuration
// In development, use backend URL (default: http://localhost:3000)
// In production, use VITE_API_URL environment variable
// For Render/Railway: Set VITE_API_URL to your deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000' : 'http://localhost:3000');

/**
 * Ask a question to the AI chat
 * @param {string} question - The question to ask
 * @param {string|null|undefined} lastProjectTitle - Title from last response's relevantProjects[0] for follow-ups ("when was it done?")
 * @returns {Promise<Object>} Response with answer and relevant projects
 */
export async function askQuestion(question, lastProjectTitle) {
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

    return await response.json();
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

