/**
 * Server-side Array user token cache.
 * Tokens have a 55-minute TTL from Array; we cache for 50 minutes to give a 5-minute
 * safety margin before expiry. A single shared Map is used so the token is reused
 * across the `/api/array/token` (display) and `/api/client/array/tradelines` (data)
 * endpoints without redundant API calls.
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

/**
 * Returns a valid Array user token for `userId`, using the in-memory cache if the
 * stored token has more than SAFETY_BUFFER_MS remaining, otherwise generating a fresh
 * one and storing it.
 *
 * @param userId       ScoreShift DB user ID (used as cache key)
 * @param arrayUserId  Array-side user ID (UUID or constructed placeholder)
 * @param apiKey       ARRAY_API_KEY env var value
 * @param appKey       Array app key (sandbox or production)
 * @param isSandbox    true = use sandbox.array.io, false = use api.array.io
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

  const tokenUrl = isSandbox
    ? "https://sandbox.array.io/api/authenticate/v2/usertoken"
    : "https://api.array.io/api/authenticate/v2/usertoken";

  console.log(`[ArrayToken] Generating fresh token for user ${userId} (arrayUserId: ${arrayUserId})`);

  try {
    const resp = await fetch(tokenUrl, {
      method: "POST",
      headers: { "x-array-server-token": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ appKey, userId: arrayUserId, ttlInMinutes: 55, rotate: true }),
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

    tokenCache.set(userId, { token, expiresAt: Date.now() + CACHE_TTL_MS });
    console.log(`[ArrayToken] Fresh token cached for user ${userId}`);
    return { token };
  } catch (e: any) {
    console.error(`[ArrayToken] Token fetch threw for user ${userId}:`, e.message);
    return { token: "", error: `token_failed: ${e.message}` };
  }
}

/** Evict a user's cached token (e.g. on manual refresh or enrollment change). */
export function clearArrayTokenCache(userId: number): void {
  tokenCache.delete(userId);
}
