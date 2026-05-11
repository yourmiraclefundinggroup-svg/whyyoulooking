/**
 * Utilities for parsing the `array-event` custom DOM event fired by the
 * `<array-account-enroll>` web component during the signup flow.
 *
 * Keeping this logic in a standalone module makes it testable without
 * React and prevents silent regressions when the Array event shape changes.
 */

export interface ArrayEventPII {
  rawUserId: string | null;
  rawDob: string | null;
  ssnLast4: string | null;
  address: { line1: string; city: string; state: string; zip: string } | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/**
 * Extract PII from an `array-event` detail object.
 *
 * Array payloads vary across SDK versions:
 *   - Sometimes PII lives under `detail.data.*`
 *   - Sometimes `detail.userId` is at the top level with no `.data` wrapper
 *
 * This function normalises both shapes and returns a single typed result.
 */
export function extractArrayEventPII(detail: Record<string, unknown>): ArrayEventPII {
  const d: Record<string, unknown> =
    (detail?.data as Record<string, unknown>) ?? detail ?? {};

  const rawUserId =
    (d.userId as string) ||
    (d.arrayUserId as string) ||
    (d.userToken as string) ||
    (detail?.userId as string) ||
    null;

  const rawDob = (d.dateOfBirth as string) || (d.dob as string) || null;

  const rawSsn: string = (d.ssn as string) || (d.ssnNumber as string) || "";
  const ssnLast4 = rawSsn.length >= 4 ? rawSsn.slice(-4) : null;

  const line1 =
    (d.addressLine1 as string) ||
    (d.address1 as string) ||
    (d.streetAddress as string) ||
    "";
  const city = (d.city as string) || "";
  const state = (d.state as string) || "";
  const zip =
    (d.zipCode as string) || (d.zip as string) || (d.postalCode as string) || "";
  const address =
    line1 || city || state || zip ? { line1, city, state, zip } : null;

  const firstName = (d.firstName as string) || "";
  const lastName = (d.lastName as string) || "";
  const email = (d.email as string) || "";
  const phone = (d.phone as string) || (d.phoneNumber as string) || "";

  return { rawUserId, rawDob, ssnLast4, address, firstName, lastName, email, phone };
}

/**
 * The set of event type strings that represent a completed enrollment.
 * Exported so tests can verify completeness.
 */
export const ARRAY_COMPLETION_TYPES = new Set([
  "complete",
  "success",
  "enrolled",
  "enroll-success",
  "userRegistrationCreated",
  "userCreated",
  "onUserCreated",
]);
