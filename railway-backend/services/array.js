"use strict";

const BASE_URL = process.env.ARRAY_PRODUCTION_MODE === "true"
  ? "https://api.array.io"
  : "https://sandbox.array.io";

const API_KEY  = process.env.ARRAY_API_KEY  || "";
const APP_KEY  = process.env.ARRAY_APP_KEY  || "";

/**
 * Generate a short-lived Array user token.
 * @param {string} arrayUserId  The user's Array-side userId
 * @param {string} [appKey]     Optional override (falls back to ARRAY_APP_KEY env var)
 * @returns {Promise<{ token?: string, error?: string }>}
 */
async function getUserToken(arrayUserId, appKey) {
  const key = appKey || APP_KEY;
  const url = `${BASE_URL}/api/authenticate/v2/usertoken`;

  console.log(`[Array] Requesting token for userId=${arrayUserId} env=${process.env.ARRAY_PRODUCTION_MODE === "true" ? "prod" : "sandbox"}`);

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "x-array-server-token": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ appKey: key, userId: arrayUserId, ttlInMinutes: 55 }),
  });

  const raw = await resp.text();
  console.log(`[Array] Token response ${resp.status}:`, raw.slice(0, 200));

  if (!resp.ok) {
    return { error: `HTTP ${resp.status}: ${raw.slice(0, 200)}` };
  }

  let data = {};
  try { data = JSON.parse(raw); } catch { /* plain-text token */ }

  const token = data.token || data.userToken || data.access_token || (raw.trim().length < 300 ? raw.trim() : "");
  if (!token) return { error: "no_token_in_response" };

  return { token };
}

/**
 * Fetch the full credit report JSON for an authenticated user.
 * @param {string} userToken  Short-lived token returned by getUserToken
 * @returns {Promise<{ data?: object, error?: string, status?: number }>}
 */
async function getCreditReport(userToken) {
  const url = `${BASE_URL}/v2/user/credit-report`;
  console.log(`[Array] Fetching credit report from ${url}`);

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
      "x-array-app-key": APP_KEY,
      "x-app-key": APP_KEY,
    },
  });

  const raw = await resp.text();
  console.log(`[Array] Credit report ${resp.status}:`, raw.slice(0, 300));

  if (!resp.ok) {
    return { error: `HTTP ${resp.status}: ${raw.slice(0, 200)}`, status: resp.status };
  }

  let data;
  try { data = JSON.parse(raw); } catch {
    return { error: "non_json_response", status: resp.status };
  }

  return { data, status: resp.status };
}

module.exports = { getUserToken, getCreditReport };
