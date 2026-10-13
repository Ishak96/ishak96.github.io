// Cloudflare Worker that reads public Google Scholar profile metrics on request
// and returns them as JSON with CORS headers, so the static GitHub Pages site
// can display them live in the visitor's browser.

const PROFILE_URL = "https://scholar.google.com/citations";
const CACHE_SECONDS = 3600;

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.includes(origin) ? origin : allowed[0] || "*";
}

function jsonResponse(body, status, origin, maxAge = 0) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": maxAge ? `public, max-age=${maxAge}` : "no-store",
      Vary: "Origin",
    },
  });
}

export function parseScholarMetrics(html) {
  const table = html.match(/<table[^>]*id="gsc_rsb_st"[\s\S]*?<\/table>/);
  const values = [...(table ? table[0] : "").matchAll(/<td class="gsc_rsb_std">([\d,]+)<\/td>/g)].map((match) => Number(match[1].replace(/,/g, "")));
  if (values.length < 6 || values.some((value) => !Number.isInteger(value))) {
    throw new Error(/captcha|unusual traffic/i.test(html) ? "Google Scholar requested a captcha." : "Unexpected Google Scholar profile layout.");
  }
  return {
    citations: { all: values[0], recent: values[1] },
    h_index: { all: values[2], recent: values[3] },
    i10_index: { all: values[4], recent: values[5] },
  };
}

export async function fetchScholarMetrics(userId, fetchSource = fetch) {
  const profileUrl = `${PROFILE_URL}?user=${encodeURIComponent(userId)}&hl=en`;
  const response = await fetchSource(profileUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`Google Scholar responded with HTTP ${response.status}.`);
  return {
    available: true,
    source: "google-scholar",
    user_id: userId,
    profile_url: profileUrl,
    fetched_at: new Date().toISOString(),
    ...parseScholarMetrics(await response.text()),
  };
}

export default {
  async fetch(request, env, ctx) {
    const origin = allowedOrigin(request, env);
    if (request.method === "OPTIONS") return jsonResponse(null, 204, origin);
    if (request.method !== "GET") return jsonResponse({ available: false, error: "Method not allowed." }, 405, origin);

    // Only the configured profile can be requested, so this is not an open proxy.
    const userId = String(env.SCHOLAR_USER_ID || "").trim();
    if (!userId) return jsonResponse({ available: false, error: "SCHOLAR_USER_ID is not configured." }, 500, origin);

    // A short cache shields Scholar from repeated visits and reduces captcha blocks.
    const cache = typeof caches !== "undefined" ? caches.default : null;
    const cacheKey = new Request(`https://scholar-metrics.cache/${encodeURIComponent(userId)}`);
    const cached = cache && (await cache.match(cacheKey));
    if (cached) return jsonResponse(await cached.json(), 200, origin, CACHE_SECONDS);

    try {
      const metrics = await fetchScholarMetrics(userId);
      if (cache) ctx.waitUntil(cache.put(cacheKey, jsonResponse(metrics, 200, "*", CACHE_SECONDS)));
      return jsonResponse(metrics, 200, origin, CACHE_SECONDS);
    } catch (error) {
      return jsonResponse({ available: false, error: error instanceof Error ? error.message : String(error) }, 502, origin);
    }
  },
};
