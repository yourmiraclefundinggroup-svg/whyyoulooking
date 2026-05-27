/**
 * Server-side Array user token cache.
 * Tokens have a 55-minute TTL from Array; we cache for 50 minutes to give a 5-minute
 * safety margin before expiry. A single shared Map is used so the token is reused
 * across the `/api/array/token` (display) and `/api/client/array/tradelines` (data)
 * endpoints without redundant API calls.
 *
 * When RAILWAY_BACKEND_URL is set, token generation is proxied through the Railway
 * service (which has a static outbound IP that Array can permanently allowlist).
 * Falls back to calling Array directly when RAILWAY_BACKEND_URL is not configured.
 */

interface CachedToken {
  token: string;
  expiresAt: number; // Unix ms
}

const tokenCache = new Map<number, CachedToken>();

const CACHE_TTL_MS = 50 * 60 * 1000; // 50 minutes
const SAFETY_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

export interface TokenResult {
  token: string;
  error?: string;
  fromCache?: boolean;
}

// ── Railway proxy helper ───────────────────────────────────────────────────────

async function fetchTokenViaRailway(
  arrayUserId: string,
  appKey: string,
  railwayUrl: string,
  internalSecret: string,
): Promise<TokenResult> {
  const url = `${railwayUrl}/array/token`;
  console.log(`[ArrayToken] Requesting token via Railway proxy for arrayUserId: ${arrayUserId}`);

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${internalSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: arrayUserId, appKey }),
    });

    const raw = await resp.text();

    if (!resp.ok) {
      console.error(`[ArrayToken] Railway proxy error (HTTP ${resp.status}):`, raw.slice(0, 300));
      return { token: "", error: `token_failed: Railway HTTP ${resp.status} — ${raw.slice(0, 200)}` };
    }

    let data: any = {};
    try { data = JSON.parse(raw); } catch { /* non-JSON */ }

    const token: string = data.token || "";
    if (!token) {
      console.error("[ArrayToken] Railway proxy returned no token:", raw.slice(0, 300));
      return { token: "", error: "token_failed: no token in Railway response" };
    }

    console.log(`[ArrayToken] Token received via Railway proxy`);
    return { token };
  } catch (e: any) {
    console.error(`[ArrayToken] Railway proxy fetch threw:`, e.message);
    return { token: "", error: `token_failed: ${e.message}` };
  }
}

// ── Direct Array helper ────────────────────────────────────────────────────────

async function fetchTokenDirect(
  userId: number,
  arrayUserId: string,
  apiKey: string,
  appKey: string,
  isSandbox: boolean,
): Promise<TokenResult> {
  const tokenUrl = isSandbox
    ? "https://sandbox.array.io/api/authenticate/v2/usertoken"
    : "https://api.array.io/api/authenticate/v2/usertoken";

  console.log(`[ArrayToken] Generating fresh token directly for user ${userId} (arrayUserId: ${arrayUserId})`);

  try {
    const resp = await fetch(tokenUrl, {
      method: "POST",
      headers: { "x-array-server-token": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ appKey, userId: arrayUserId, ttlInMinutes: 55 }),
    });

    const raw = await resp.text();

    if (!resp.ok) {
      console.error(`[ArrayToken] Token fetch failed (HTTP ${resp.status}) for user ${userId}:`, raw.slice(0, 500));
      return { token: "", error: `token_failed: HTTP ${resp.status} — ${raw.slice(0, 200)}` };
    }

    let data: any = {};
    try { data = JSON.parse(raw); } catch { /* non-JSON — leave data empty */ }

    const token: string = data.token || data.userToken || data.access_token || "";
    if (!token) {
      console.error(`[ArrayToken] No token field in response for user ${userId}:`, raw.slice(0, 500));
      return { token: "", error: "token_failed: no token in response" };
    }

    return { token };
  } catch (e: any) {
    console.error(`[ArrayToken] Token fetch threw for user ${userId}:`, e.message);
    return { token: "", error: `token_failed: ${e.message}` };
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns a valid Array user token for `userId`, using the in-memory cache if the
 * stored token has more than SAFETY_BUFFER_MS remaining, otherwise generating a fresh
 * one via Railway (if RAILWAY_BACKEND_URL is configured) or directly from Array.
 *
 * @param userId       ScoreShift DB user ID (used as cache key)
 * @param arrayUserId  Array-side user ID (UUID or constructed placeholder)
 * @param apiKey       ARRAY_API_KEY env var value (used for direct calls only)
 * @param appKey       Array app key (sandbox or production)
 * @param isSandbox    true = use sandbox.array.io, false = use api.array.io (direct only)
 */
export async function getOrRefreshArrayToken(
  userId: number,
  arrayUserId: string,
  apiKey: string,
  appKey: string,
  isSandbox: boolean,
): Promise<TokenResult> {
  // Return cached token if still fresh
  const cached = tokenCache.get(userId);
  if (cached && cached.expiresAt - Date.now() > SAFETY_BUFFER_MS) {
    console.log(`[ArrayToken] Cache HIT for user ${userId} (expires in ${Math.round((cached.expiresAt - Date.now()) / 60000)}m)`);
    return { token: cached.token, fromCache: true };
  }

  // ── Fetch fresh token ──────────────────────────────────────────────────────
  const RAILWAY_BACKEND_URL = (process.env.RAILWAY_BACKEND_URL || "").replace(/\/$/, "");
  const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "";

  let result: TokenResult;

  if (RAILWAY_BACKEND_URL) {
    result = await fetchTokenViaRailway(arrayUserId, appKey, RAILWAY_BACKEND_URL, INTERNAL_API_SECRET);
  } else {
    result = await fetchTokenDirect(userId, arrayUserId, apiKey, appKey, isSandbox);
  }

  if (result.error || !result.token) {
    return result;
  }

  tokenCache.set(userId, { token: result.token, expiresAt: Date.now() + CACHE_TTL_MS });
  console.log(`[ArrayToken] Fresh token cached for user ${userId} (via ${RAILWAY_BACKEND_URL ? "Railway" : "direct"})`);
  return result;
}

/** Evict a user's cached token (e.g. on 401/403 from Array or on enrollment change). */
export function clearArrayTokenCache(userId: number): void {
  tokenCache.delete(userId);
}

/**
 * Fetch the full credit report via Railway proxy (when RAILWAY_BACKEND_URL is set)
 * or directly from Array (fallback). Returns the raw parsed JSON or an error string.
 */
export async function fetchArrayCreditReport(
  userToken: string,
  userId: number,
  appKey: string,
  dataBaseUrl: string,
): Promise<{ data?: any; error?: string; status?: number }> {
  const RAILWAY_BACKEND_URL = (process.env.RAILWAY_BACKEND_URL || "").replace(/\/$/, "");
  const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "";

  if (RAILWAY_BACKEND_URL) {
    const url = `${RAILWAY_BACKEND_URL}/array/credit-report?userToken=${encodeURIComponent(userToken)}`;
    console.log(`[CreditFile] Fetching credit report via Railway proxy for user ${userId}`);

    try {
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${INTERNAL_API_SECRET}` },
      });
      const raw = await resp.text();
      console.log(`[CreditFile] Railway credit-report ${resp.status}:`, raw.slice(0, 300));

      if (!resp.ok) {
        return { error: `api_error: Railway HTTP ${resp.status}`, status: resp.status };
      }

      let data: any;
      try { data = JSON.parse(raw); } catch {
        return { error: "non_json_response", status: resp.status };
      }
      return { data, status: resp.status };
    } catch (e: any) {
      return { error: `fetch_failed: ${e.message}` };
    }
  }

  // ── Direct Array call (no Railway configured) ─────────────────────────────
  const reportUrl = `${dataBaseUrl}/v2/user/credit-report`;
  console.log(`[CreditFile] Fetching ${reportUrl} directly for user ${userId}`);

  try {
    const resp = await fetch(reportUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
        "x-array-app-key": appKey,
        "x-app-key": appKey,
      },
    });
    const raw = await resp.text();
    console.log(`[CreditFile] Array API ${resp.status} for user ${userId}:`, raw.slice(0, 500));

    if (!resp.ok) {
      if (resp.status === 401 || resp.status === 403) clearArrayTokenCache(userId);
      return { error: `api_error: HTTP ${resp.status}`, status: resp.status };
    }

    let data: any;
    try { data = JSON.parse(raw); } catch {
      return { error: "non_json_response", status: resp.status };
    }
    return { data, status: resp.status };
  } catch (e: any) {
    return { error: `fetch_failed: ${e.message}` };
  }
}
