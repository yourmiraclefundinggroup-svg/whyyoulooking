/**
 * Array.com enrollment helper — callable server-side without an HTTP request.
 */
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface EnrollResult {
  enrolled: string[];  // product codes successfully enrolled
  failed: string[];    // product codes that failed (API error or credentials missing)
  alreadyEnrolled: string[]; // product codes that were already active (skipped)
}

export async function enrollUserInArrayProducts(userId: number, productCodes: string[]): Promise<EnrollResult> {
  const result: EnrollResult = { enrolled: [], failed: [], alreadyEnrolled: [] };
  if (!productCodes.length) return result;

  const ARRAY_API_KEY = process.env.ARRAY_API_KEY;
  const ARRAY_API_SECRET = process.env.ARRAY_API_SECRET;

  if (!ARRAY_API_KEY || !ARRAY_API_SECRET) {
    console.warn("[Array] API credentials not configured — skipping enrollment");
    result.failed.push(...productCodes);
    return result;
  }

  const { arrayEnrollments } = await import("@shared/schema");
  const arrayUserId = `scoreshift_user_${userId}`;
  const credentials = Buffer.from(`${ARRAY_API_KEY}:${ARRAY_API_SECRET}`).toString("base64");

  const existing = await db.select().from(arrayEnrollments).where(eq(arrayEnrollments.userId, userId));
  const existingCodes: string[] = existing[0]?.productCodes || [];
  const newCodes = productCodes.filter((c) => !existingCodes.includes(c));
  const alreadyCodes = productCodes.filter((c) => existingCodes.includes(c));
  result.alreadyEnrolled.push(...alreadyCodes);

  for (const productCode of newCodes) {
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
        console.error(`[Array] Failed to enroll user ${userId} in ${productCode}:`, body);
        result.failed.push(productCode);
      } else {
        console.log(`[Array] Enrolled user ${userId} in ${productCode}`);
        result.enrolled.push(productCode);
      }
    } catch (err) {
      console.error(`[Array] Enroll error for user ${userId} / ${productCode}:`, err);
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
