/**
 * Smoke test: Array sandbox enrollment end-to-end
 *
 * Section 1 — Client-side event extraction
 *   Imports the REAL `extractArrayEventPII` function from
 *   `client/src/lib/array-enrollment-event.ts` and exercises it with
 *   representative payloads.  No logic is duplicated — if the utility
 *   drifts from the Array SDK's actual event shape, these assertions fail.
 *
 * Section 2 — Server-side HTTP integration
 *   Makes real HTTP calls to the running Express server (localhost:5000):
 *     POST /api/array/enroll  → insert + update enrollment row
 *     GET  /api/array/enrollment → verify response contract
 *   A temporary CLIENT_VIEWER user is created in the DB before the HTTP
 *   calls and torn down in the finally block.
 *
 * Run:  npx tsx scripts/test-array-enroll.ts
 */

// ─── node built-ins ──────────────────────────────────────────────────────────
import { createServer } from "http";

// ─── project imports ─────────────────────────────────────────────────────────
import { db } from "../server/db";
import { eq } from "drizzle-orm";
import { users, arrayEnrollments } from "../shared/schema";

// ─── the REAL client-side utility — no logic duplication ─────────────────────
// ts-node / tsx resolves the path alias used in the Vite app via tsconfig paths;
// we use a relative path here because this script runs outside the Vite pipeline.
import {
  extractArrayEventPII,
  ARRAY_COMPLETION_TYPES,
} from "../client/src/lib/array-enrollment-event";

// ─── helpers ─────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:5000";

let passed = 0;
let failed = 0;

function pass(msg: string) {
  console.log(`  ✓  ${msg}`);
  passed++;
}

function fail(msg: string) {
  console.log(`  ✗  ${msg}`);
  failed++;
}

function assert(condition: boolean, passMsg: string, failMsg: string) {
  if (condition) pass(passMsg);
  else fail(failMsg);
}

async function apiPost(path: string, body: unknown, token: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function apiGet(path: string, token: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, body: await res.json() };
}

// ─── main ────────────────────────────────────────────────────────────────────

async function run() {
  const TS = Date.now();
  const TEST_EMAIL = `smoke-array-${TS}@scoreshift.test`;
  const ARRAY_UUID_1 = `array-uuid-initial-${TS}`;
  const ARRAY_UUID_2 = `array-uuid-updated-${TS}`;
  let testUserId: number | null = null;

  console.log("\n=== Array Enrollment Smoke Test ===\n");

  try {
    // ── Section 1: Client-side event extraction (real utility, no duplication) ──
    console.log("Section 1 — extractArrayEventPII (client/src/lib/array-enrollment-event.ts)");

    // 1a. Standard payload: PII inside `detail.data`
    const standardPayload = {
      type: "userRegistrationCreated",
      data: {
        userId: ARRAY_UUID_1,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        phone: "5550001234",
        dateOfBirth: "1990-05-15",
        ssn: "123456789",
        addressLine1: "123 Main St",
        city: "Dallas",
        state: "TX",
        zipCode: "75201",
      },
    };

    const pii1 = extractArrayEventPII(standardPayload);

    assert(pii1.rawUserId === ARRAY_UUID_1,
      "standard payload: userId extracted from data.userId",
      `standard payload userId mismatch — got: ${pii1.rawUserId}`);
    assert(pii1.rawDob === "1990-05-15",
      "standard payload: dateOfBirth extracted",
      `DOB mismatch — got: ${pii1.rawDob}`);
    assert(pii1.ssnLast4 === "6789",
      "standard payload: SSN last 4 digits extracted",
      `SSN last-4 mismatch — got: ${pii1.ssnLast4}`);
    assert(pii1.address?.city === "Dallas",
      "standard payload: city extracted from address",
      `city mismatch — got: ${pii1.address?.city}`);
    assert(pii1.address?.zip === "75201",
      "standard payload: zip extracted from zipCode",
      `zip mismatch — got: ${pii1.address?.zip}`);
    assert(pii1.firstName === "Jane" && pii1.lastName === "Doe",
      "standard payload: first and last name extracted",
      `name mismatch — got: ${pii1.firstName} ${pii1.lastName}`);
    assert(pii1.email === "jane@example.com",
      "standard payload: email extracted",
      `email mismatch — got: ${pii1.email}`);
    assert(pii1.phone === "5550001234",
      "standard payload: phone extracted",
      `phone mismatch — got: ${pii1.phone}`);

    // 1b. Flat payload: userId at detail level (older Array SDK versions)
    const flatPayload = { type: "complete", userId: ARRAY_UUID_1 };
    const pii2 = extractArrayEventPII(flatPayload);
    assert(pii2.rawUserId === ARRAY_UUID_1,
      "flat payload: userId extracted from detail.userId (no .data wrapper)",
      `flat payload userId mismatch — got: ${pii2.rawUserId}`);

    // 1c. Fallback field names (addressLine1 → address1, zipCode → zip)
    const altFieldsPayload = {
      type: "enrolled",
      data: {
        arrayUserId: ARRAY_UUID_1,
        dob: "1985-01-01",
        ssnNumber: "987654321",
        address1: "456 Elm Ave",
        city: "Austin",
        state: "TX",
        zip: "73301",
        phoneNumber: "5559998888",
      },
    };
    const pii3 = extractArrayEventPII(altFieldsPayload);
    assert(pii3.rawUserId === ARRAY_UUID_1,
      "alt fields: arrayUserId fallback works",
      `arrayUserId fallback mismatch — got: ${pii3.rawUserId}`);
    assert(pii3.rawDob === "1985-01-01",
      "alt fields: dob fallback works",
      `dob fallback mismatch — got: ${pii3.rawDob}`);
    assert(pii3.ssnLast4 === "4321",
      "alt fields: ssnNumber fallback + last-4 extraction works",
      `ssnNumber fallback mismatch — got: ${pii3.ssnLast4}`);
    assert(pii3.address?.line1 === "456 Elm Ave",
      "alt fields: address1 fallback works",
      `address1 fallback mismatch — got: ${pii3.address?.line1}`);
    assert(pii3.address?.zip === "73301",
      "alt fields: zip fallback works",
      `zip fallback mismatch — got: ${pii3.address?.zip}`);
    assert(pii3.phone === "5559998888",
      "alt fields: phoneNumber fallback works",
      `phoneNumber fallback mismatch — got: ${pii3.phone}`);

    // 1d. Edge cases
    const shortSsnPayload = { type: "complete", data: { ssn: "123" } };
    const pii4 = extractArrayEventPII(shortSsnPayload);
    assert(pii4.ssnLast4 === null,
      "edge case: SSN < 4 chars → ssnLast4 is null (not stored)",
      `short SSN guard failed — got: ${pii4.ssnLast4}`);

    const noAddressPayload = { type: "complete", data: { userId: ARRAY_UUID_1 } };
    const pii5 = extractArrayEventPII(noAddressPayload);
    assert(pii5.address === null,
      "edge case: missing address fields → address is null",
      `missing address guard failed — got: ${JSON.stringify(pii5.address)}`);

    // 1e. Verify the completion type set includes the common event names
    const expectedTypes = ["userRegistrationCreated", "complete", "success", "enrolled"];
    for (const t of expectedTypes) {
      assert(ARRAY_COMPLETION_TYPES.has(t),
        `ARRAY_COMPLETION_TYPES includes "${t}"`,
        `ARRAY_COMPLETION_TYPES is missing "${t}"`);
    }

    // ── Section 2: Server HTTP integration ──────────────────────────────────
    console.log("\nSection 2 — POST /api/array/enroll & GET /api/array/enrollment (real HTTP)");

    // 2a. Create a temporary CLIENT_VIEWER user directly in DB (bypasses auth
    //     only for setup; all subsequent calls go through the real HTTP API)
    const [testUser] = await db
      .insert(users)
      .values({
        email: TEST_EMAIL,
        password: "SmokeTe$t1!",
        firstName: "Smoke",
        lastName: "Test",
        accessLevel: "CLIENT_VIEWER",
      })
      .returning();
    testUserId = testUser.id;

    // Construct a valid auth token in the format the server expects
    const authToken = `token_${testUserId}_${TS}`;
    console.log(`  [setup] created test user id=${testUserId}, token=${authToken.replace(String(testUserId), "<id>")}`);

    // 2b. First POST — new enrollment with a real Array UUID and product code
    const enroll1 = await apiPost(
      "/api/array/enroll",
      { arrayUserId: ARRAY_UUID_1, productCode: "ck" },
      authToken,
    );

    assert(enroll1.status === 200,
      "POST /api/array/enroll returns 200 on first call",
      `unexpected status on first enroll — got: ${enroll1.status} ${JSON.stringify(enroll1.body)}`);
    assert(enroll1.body?.arrayUserId === ARRAY_UUID_1,
      "first enroll response contains the provided arrayUserId",
      `first enroll response arrayUserId mismatch — got: ${enroll1.body?.arrayUserId}`);
    assert(enroll1.body?.productCode === "ck",
      "first enroll response echoes productCode",
      `first enroll response productCode mismatch — got: ${enroll1.body?.productCode}`);

    // Verify DB row directly
    const [row1] = await db
      .select()
      .from(arrayEnrollments)
      .where(eq(arrayEnrollments.userId, testUserId));

    assert(row1?.arrayUserId === ARRAY_UUID_1,
      "DB row: arrayUserId matches what was POSTed",
      `DB arrayUserId mismatch — got: ${row1?.arrayUserId}`);
    assert(Array.isArray(row1?.productCodes) && row1.productCodes.includes("ck"),
      "DB row: productCode 'ck' is stored",
      `DB productCodes missing 'ck' — got: ${JSON.stringify(row1?.productCodes)}`);
    assert(!!row1?.enrolledAt,
      "DB row: enrolledAt timestamp is set automatically",
      "DB row: enrolledAt timestamp is missing");

    // 2c. Second POST — updated Array UUID + additional product code (update path)
    const enroll2 = await apiPost(
      "/api/array/enroll",
      { arrayUserId: ARRAY_UUID_2, productCode: "cr" },
      authToken,
    );

    assert(enroll2.status === 200,
      "POST /api/array/enroll returns 200 on second call",
      `unexpected status on second enroll — got: ${enroll2.status}`);

    const [row2] = await db
      .select()
      .from(arrayEnrollments)
      .where(eq(arrayEnrollments.userId, testUserId));

    assert(row2?.arrayUserId === ARRAY_UUID_2,
      "DB row: arrayUserId updated to new UUID on second call",
      `arrayUserId not updated — got: ${row2?.arrayUserId}`);
    assert(
      row2?.productCodes?.includes("ck") && row2?.productCodes?.includes("cr"),
      "DB row: product codes merged across two calls ('ck' + 'cr')",
      `product codes not merged — got: ${JSON.stringify(row2?.productCodes)}`,
    );

    // 2d. GET /api/array/enrollment — verify response contract
    const check = await apiGet("/api/array/enrollment", authToken);

    assert(check.status === 200,
      "GET /api/array/enrollment returns 200",
      `unexpected status — got: ${check.status}`);
    assert(check.body?.enrolled === true,
      "GET /api/array/enrollment: enrolled is true",
      `enrolled flag mismatch — got: ${check.body?.enrolled}`);
    assert(check.body?.arrayUserId === ARRAY_UUID_2,
      "GET /api/array/enrollment: returns the latest arrayUserId",
      `arrayUserId in check response mismatch — got: ${check.body?.arrayUserId}`);
    assert(
      Array.isArray(check.body?.productCodes) &&
        check.body.productCodes.includes("ck") &&
        check.body.productCodes.includes("cr"),
      "GET /api/array/enrollment: productCodes contains both codes",
      `productCodes mismatch — got: ${JSON.stringify(check.body?.productCodes)}`,
    );
    assert(check.body?.welcomeShown === false,
      "GET /api/array/enrollment: welcomeShown defaults to false",
      `welcomeShown mismatch — got: ${check.body?.welcomeShown}`);
    assert(check.body?.enrolledAt !== null && check.body?.enrolledAt !== undefined,
      "GET /api/array/enrollment: enrolledAt is present",
      "GET /api/array/enrollment: enrolledAt is missing");

    // 2e. Unauthenticated request should be rejected
    const unauth = await fetch(`${BASE_URL}/api/array/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ arrayUserId: ARRAY_UUID_1 }),
    });
    assert(unauth.status === 401,
      "POST /api/array/enroll without auth returns 401",
      `expected 401 for unauthenticated request, got: ${unauth.status}`);

  } catch (err) {
    console.error("\n[unexpected error]", err);
    failed++;
  } finally {
    // ── Cleanup ──────────────────────────────────────────────────────────────
    if (testUserId !== null) {
      await db.delete(arrayEnrollments).where(eq(arrayEnrollments.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
      console.log(`\n  [cleanup] removed test user id=${testUserId} and enrollment row`);
    }

    const total = passed + failed;
    console.log(`\n=== Results: ${passed}/${total} passed ===\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
