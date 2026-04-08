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

  const o = String(origin).trim();

  let hostname = '';
  try {
    hostname = new URL(o).hostname;
  } catch {
    return false;
  }

  const envList = parseEnvOrigins();
  if (envList.some((e) => {
    try {
      return new URL(e).hostname === hostname;
    } catch {
      return e === o;
    }
  })) {
    return true;
  }
  if (
    DEFAULT_ORIGINS.some((d) => {
      try {
        return new URL(d).hostname === hostname;
      } catch {
        return d === o;
      }
    })
  ) {
    return true;
  }

  if (hostname.endsWith('.netlify.app')) return true;

  if (
    /^http:\/\/localhost(:\d+)?$/i.test(o) ||
    /^http:\/\/127\.0\.0\.1(:\d+)?$/i.test(o)
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
    // Do NOT set allowedHeaders: if omitted, `cors` echoes
    // `Access-Control-Request-Headers` from the browser. A fixed list breaks
    // preflight when Chrome (or extensions) adds extra requested headers.
    maxAge: 86400,
    optionsSuccessStatus: 204,
  };
}
