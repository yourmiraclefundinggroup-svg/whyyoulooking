/**
 * Array.com enrollment helper — callable server-side without an HTTP request.
 *
 * Outbound IP routing:
 *  - When RAILWAY_BACKEND_URL is set, all enrollment calls are proxied through the
 *    DigitalOcean backend, which has a static allowlisted IP.
 *  - When RAILWAY_BACKEND_URL is not set (or the proxy call fails), enrollment calls
 *    go directly from this server — the IP will be the Replit/hosting server's egress IP.
 *
 * Required DigitalOcean backend endpoint:
 *   POST /array/enroll
 *   Headers: Authorization: Bearer <INTERNAL_API_SECRET>
 *   Body: { userId: string, productCode: string }
 *   Calls: POST https://api.array.io/v2/user/enroll
 *     with Authorization: Basic base64(ARRAY_API_KEY:ARRAY_API_SECRET)
 */

import { db } from "./db";
import { eq } from "drizzle-orm";

export interface EnrollResult {
  enrolled: string[];        // product codes successfully enrolled
  failed: string[];          // product codes that failed (API error or credentials missing)
  alreadyEnrolled: string[]; // product codes that were already active (skipped)
}

// ── Railway proxy for enrollment ──────────────────────────────────────────────

async function enrollViaRailway(
  arrayUserId: string,
  productCode: string,
  railwayUrl: string,
  internalSecret: string,
): Promise<{ ok: boolean; error?: string }> {
  const url = `${railwayUrl}/array/enroll`;
  console.log(`[Array] Enrolling via Railway proxy (DigitalOcean static IP) — userId=${arrayUserId}, product=${productCode}`);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${internalSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: arrayUserId, productCode }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      console.error(`[Array] Railway enrollment failed (HTTP ${resp.status}) for ${arrayUserId}/${productCode}:`, body.slice(0, 200));
      return { ok: false, error: `Railway HTTP ${resp.status}` };
    }
    console.log(`[Array] Railway enrollment OK — userId=${arrayUserId}, product=${productCode}`);
    return { ok: true };
  } catch (e: any) {
    console.error(`[Array] Railway enrollment threw for ${arrayUserId}/${productCode}:`, e.message);
    return { ok: false, error: e.message };
  }
}

// ── Direct enrollment (fallback when Railway is not configured) ───────────────

async function enrollDirect(
  userId: number,
  arrayUserId: string,
  productCode: string,
  credentials: string,
): Promise<{ ok: boolean; error?: string }> {
  console.warn(`[Array] Enrolling DIRECT (no Railway proxy) — outbound IP is this server's egress IP, not DigitalOcean — userId=${userId}, product=${productCode}`);
  try {
    const resp = await fetch("https://api.array.io/v2/user/enroll", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: arrayUserId, productCode }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      console.error(`[Array] Direct enroll failed (HTTP ${resp.status}) for user ${userId}/${productCode}:`, body);
      return { ok: false, error: `HTTP ${resp.status}` };
    }
    console.log(`[Array] Direct enroll OK — userId=${userId}, product=${productCode}`);
    return { ok: true };
  } catch (e: any) {
    console.error(`[Array] Direct enroll threw for user ${userId}/${productCode}:`, e.message);
    return { ok: false, error: e.message };
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function enrollUserInArrayProducts(userId: number, productCodes: string[]): Promise<EnrollResult> {
  const result: EnrollResult = { enrolled: [], failed: [], alreadyEnrolled: [] };
  if (!productCodes.length) return result;

  const ARRAY_API_KEY    = process.env.ARRAY_API_KEY;
  const ARRAY_API_SECRET = process.env.ARRAY_API_SECRET;
  const RAILWAY_BACKEND_URL = (process.env.RAILWAY_BACKEND_URL || "").replace(/\/$/, "");
  const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "";

  if (!ARRAY_API_KEY || !ARRAY_API_SECRET) {
    console.warn("[Array] API credentials not configured — skipping enrollment");
    result.failed.push(...productCodes);
    return result;
  }

  const { arrayEnrollments } = await import("@shared/schema");
  const arrayUserId   = `scoreshift_user_${userId}`;
  const credentials   = Buffer.from(`${ARRAY_API_KEY}:${ARRAY_API_SECRET}`).toString("base64");

  const existing      = await db.select().from(arrayEnrollments).where(eq(arrayEnrollments.userId, userId));
  const existingCodes: string[] = existing[0]?.productCodes || [];
  const newCodes      = productCodes.filter((c) => !existingCodes.includes(c));
  const alreadyCodes  = productCodes.filter((c) =>  existingCodes.includes(c));
  result.alreadyEnrolled.push(...alreadyCodes);

  const useRailway = Boolean(RAILWAY_BACKEND_URL && INTERNAL_API_SECRET);
  console.log(`[Array] Enrollment for user ${userId} (${newCodes.length} new codes) via ${useRailway ? "Railway proxy → DigitalOcean static IP" : "DIRECT (no Railway configured)"}`);

  for (const productCode of newCodes) {
    let ok = false;

    if (useRailway) {
      const railwayResult = await enrollViaRailway(arrayUserId, productCode, RAILWAY_BACKEND_URL, INTERNAL_API_SECRET);
      if (railwayResult.ok) {
        ok = true;
      } else {
        // Fall back to direct if Railway proxy fails (e.g. /array/enroll not yet deployed)
        console.warn(`[Array] Railway enroll failed (${railwayResult.error}) — falling back to direct for user ${userId}/${productCode}`);
        const directResult = await enrollDirect(userId, arrayUserId, productCode, credentials);
        ok = directResult.ok;
      }
    } else {
      const directResult = await enrollDirect(userId, arrayUserId, productCode, credentials);
      ok = directResult.ok;
    }

    if (ok) {
      result.enrolled.push(productCode);
    } else {
      result.failed.push(productCode);
    }
  }

  if (result.enrolled.length === 0) return result;

  const allCodes = [...existingCodes, ...result.enrolled];
  if (existing.length === 0) {
    await db.insert(arrayEnrollments).values({ userId, arrayUserId, productCodes: allCodes });
  } else {
    await db.update(arrayEnrollments)
      .set({ productCodes: allCodes })
      .where(eq(arrayEnrollments.userId, userId));
  }

  return result;
}
