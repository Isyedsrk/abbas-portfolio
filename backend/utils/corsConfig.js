/**
 * Browser chat calls POST /api/ask with JSON → CORS preflight (OPTIONS) must succeed.
 * Render error pages / cold starts sometimes omit CORS headers; this keeps allowed origins explicit.
 */

const DEFAULT_ORIGINS = ['https://syedabs.netlify.app'];

function parseEnvOrigins() {
  const raw = process.env.CORS_ORIGINS;
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * @param {string | undefined} origin - Request Origin header (missing for same-origin / some tools)
 * @returns {boolean}
 */
export function isOriginAllowed(origin) {
  if (!origin) return true;

  const envList = parseEnvOrigins();
  if (envList.includes(origin)) return true;
  if (DEFAULT_ORIGINS.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith('.netlify.app')) return true;
  } catch {
    return false;
  }

  if (
    /^http:\/\/localhost(:\d+)?$/i.test(origin) ||
    /^http:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin)
  ) {
    return true;
  }

  return false;
}

/**
 * @returns {import('cors').CorsOptions}
 */
export function buildCorsOptions() {
  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn('[CORS] Blocked Origin:', origin || '(none)');
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  };
}
