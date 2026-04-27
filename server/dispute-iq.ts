import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Metro 2 Violation Detection ──────────────────────────────────────────────

export interface Metro2Violation {
  field: string;
  code: string;
  description: string;
  crrgSection: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

export interface Metro2Account {
  accountNumber?: string;
  accountStatus?: string;
  paymentRating?: string;
  paymentHistoryProfile?: string;
  dateOfFirstDelinquency?: string;
  complianceConditionCode?: string;
  dateAccountInfoChanged?: string;
  k4Segment?: string;
  originalBalance?: number;
  currentBalance?: number;
  dateOpened?: string;
  dateClosed?: string;
  reportedStatus?: string;
}

export function detectMetro2Violations(account: Metro2Account): Metro2Violation[] {
  const violations: Metro2Violation[] = [];

  if (account.dateAccountInfoChanged) {
    const daDate = new Date(account.dateAccountInfoChanged);
    const daysSinceUpdate = (Date.now() - daDate.getTime()) / 86_400_000;
    if (daysSinceUpdate > 90) {
      violations.push({
        field: "DA (Date Account Info Changed)",
        code: "DA-STALE",
        description: `The DA field (Date Account Information Changed) reflects a date more than 90 days old (${account.dateAccountInfoChanged}), indicating the furnisher has not submitted a monthly update as required by Metro 2 reporting standards.`,
        crrgSection: "CRRG Section 2.1 — Reporting Cycle Requirements",
        severity: "MEDIUM",
      });
    }
  }

  if (account.k4Segment) {
    const validK4 = /^[0-9BCDEGHIJKLMNOPRSTUZ ]+$/;
    if (!validK4.test(account.k4Segment)) {
      violations.push({
        field: "K4 Segment (Historical Payment Data)",
        code: "K4-INVALID",
        description: `The K4 Segment contains invalid payment pattern codes ("${account.k4Segment}"). CRRG Appendix B specifies only valid status codes (0–9, B, C, D, E, G, H, etc.) may appear in the K4 historical payment field.`,
        crrgSection: "CRRG Appendix B — Special Comment / K4 Segment Codes",
        severity: "HIGH",
      });
    }
  }

  if (account.paymentHistoryProfile) {
    const phf = account.paymentHistoryProfile.replace(/\s/g, "");
    const validPHF = /^[0-9BCDEGHIJKLMNOPRSTUZ]*$/;
    if (!validPHF.test(phf)) {
      violations.push({
        field: "PHF (Payment History Profile)",
        code: "PHF-INVALID-CODES",
        description: `The Payment History Profile field contains invalid status codes. Each monthly position must reflect a valid Metro 2 payment status code per CRRG Section 4.5.`,
        crrgSection: "CRRG Section 4.5 — Payment History Profile Field",
        severity: "HIGH",
      });
    }
    if (phf.length > 24) {
      violations.push({
        field: "PHF (Payment History Profile)",
        code: "PHF-OVERFLOW",
        description: `The Payment History Profile contains ${phf.length} monthly positions — exceeding the Metro 2 maximum of 24 months. This over-reporting can artificially extend a derogatory history.`,
        crrgSection: "CRRG Section 4.5 — Payment History Profile Field",
        severity: "MEDIUM",
      });
    }
  }

  if (account.paymentRating !== undefined) {
    const rating = parseInt(account.paymentRating, 10);
    if (isNaN(rating) || rating < 0 || rating > 6) {
      violations.push({
        field: "Field 17A (Payment Rating)",
        code: "PR-INVALID",
        description: `Payment Rating code "${account.paymentRating}" is outside the valid Metro 2 range (0=Current, 1=30 days late, 2=60 days, 3=90 days, 4=120 days, 5=150 days, 6=180+ days). This is a direct Field 17A coding error.`,
        crrgSection: "CRRG Section 4.2 — Field 17A Payment Rating",
        severity: "HIGH",
      });
    } else if (rating >= 1 && (account.reportedStatus || "").toLowerCase().includes("current")) {
      violations.push({
        field: "Field 17A / ACCT_STATUS Mismatch",
        code: "PR-STATUS-MISMATCH",
        description: `Payment Rating code "${account.paymentRating}" (indicating late/delinquent payment) directly conflicts with the account status reported as "current." This Field 17A and ACCT_STATUS discrepancy is a Metro 2 reporting error.`,
        crrgSection: "CRRG Section 4.2 — Field 17A; Section 4.1 — Account Status",
        severity: "HIGH",
      });
    }
  }

  if (account.dateOfFirstDelinquency) {
    const dofd = new Date(account.dateOfFirstDelinquency);
    const yearsOld = (Date.now() - dofd.getTime()) / (86_400_000 * 365.25);
    if (yearsOld >= 7) {
      violations.push({
        field: "DOFD (Date of First Delinquency)",
        code: "DOFD-REAGING",
        description: `The Date of First Delinquency (${account.dateOfFirstDelinquency}) shows this account is ${yearsOld.toFixed(1)} years old — past the 7-year maximum reporting period under FCRA § 1681c(a)(4). Continued reporting constitutes illegal DOFD re-aging.`,
        crrgSection: "CRRG Section 4.8 — Date of First Delinquency; FCRA § 1681c(a)(4)",
        severity: "HIGH",
      });
    }
  }

  if (account.complianceConditionCode && account.complianceConditionCode !== "XB") {
    violations.push({
      field: "CCC XB (Compliance Condition Code)",
      code: "CCC-XB-WRONG",
      description: `Compliance Condition Code "${account.complianceConditionCode}" was reported instead of "XB" (Account information disputed by consumer). While a dispute is under investigation, furnishers must report CCC=XB to indicate the pending dispute.`,
      crrgSection: "CRRG Section 4.9 — Compliance Condition Codes; FCRA § 1681s-2(a)(3)",
      severity: "MEDIUM",
    });
  }

  if (account.accountStatus && account.reportedStatus) {
    const statusMap: Record<string, string[]> = {
      "11": ["current", "open", "ok"],
      "64": ["collection", "collections"],
      "78": ["closed"],
      "80": ["charge off", "charged off", "charge-off"],
      "13": ["paid", "paid in full"],
    };
    const expectedKeywords = statusMap[account.accountStatus] || [];
    const reportedLower = account.reportedStatus.toLowerCase();
    if (expectedKeywords.length > 0 && !expectedKeywords.some((kw) => reportedLower.includes(kw))) {
      violations.push({
        field: "ACCT_STATUS (Account Status Code)",
        code: "ACCT-STATUS-MISMATCH",
        description: `ACCT_STATUS code "${account.accountStatus}" does not align with the reported account status "${account.reportedStatus}." Metro 2 requires account status codes to accurately reflect the true state of the account at the time of reporting.`,
        crrgSection: "CRRG Section 4.1 — Account Status Codes",
        severity: "HIGH",
      });
    }
  }

  return violations;
}

function formatMetro2ViolationsBlock(violations: Metro2Violation[]): string {
  if (violations.length === 0) return "";
  const lines = violations.map(
    (v, i) =>
      `${i + 1}. [${v.severity}] ${v.field} — Code: ${v.code}\n   ${v.description}\n   Citation: ${v.crrgSection}`
  );
  return `METRO 2® FIELD VIOLATIONS DETECTED (${violations.length} total):\n${lines.join("\n\n")}`;
}

// ─── FCRA Section Mapping ──────────────────────────────────────────────────────

const FCRA_SECTION_DEFINITIONS: Record<string, string> = {
  "§1681e(b)": "Maximum possible accuracy — CRA must follow reasonable procedures to ensure accuracy of consumer information",
  "§1681i": "Reinvestigation of disputed information — CRA must investigate within 30 days and provide written results",
  "§1681i(a)(5)(A)": "Prompt deletion — unverifiable information must be promptly deleted",
  "§1681i(a)(7)": "Method of verification — consumer may request the method used to verify disputed information",
  "§1681s-2(b)": "Furnisher duty after dispute notice — furnisher must investigate and correct or delete inaccurate data",
  "§1681s-2(a)(3)": "Furnisher duty during dispute — must flag account with CCC XB while dispute is pending",
  "§1681s-2(a)(6)": "Furnisher duty to fraud victims — must cease reporting information identified as identity theft",
  "§1681b": "Permissible purpose — inquiries require a legally permissible purpose; unauthorized inquiries must be removed",
  "§1681c(a)(4)": "7-year reporting limit — most derogatory information cannot be reported after 7 years from DOFD",
  "§1681c-2": "Block of identity theft information — CRA must block fraudulent tradelines within 4 business days",
  "§1681n/§1681o": "Civil liability — willful or negligent noncompliance exposes violating party to statutory damages of $100–$1,000 per violation, actual damages, punitive damages, and attorney's fees",
};

const FCRA_TYPE_REASON_MAP: Record<string, Record<string, string[]>> = {
  collection: {
    any: ["§1681c-2", "§1681e(b)", "§1681i", "§1681i(a)(5)(A)", "§1681s-2(b)", "§1681n/§1681o"],
    fraud: ["§1681c-2", "§1681e(b)", "§1681i", "§1681s-2(a)(6)", "§1681n/§1681o"],
    reaging: ["§1681c(a)(4)", "§1681c-2", "§1681e(b)", "§1681i", "§1681s-2(b)"],
    notmine: ["§1681e(b)", "§1681i", "§1681s-2(b)", "§1681c-2", "§1681n/§1681o"],
  },
  late_payment: {
    any: ["§1681e(b)", "§1681i", "§1681i(a)(5)(A)", "§1681s-2(b)", "§1681i(a)(7)"],
    fraud: ["§1681c-2", "§1681e(b)", "§1681i", "§1681s-2(b)"],
    reaging: ["§1681c(a)(4)", "§1681e(b)", "§1681i", "§1681s-2(b)"],
  },
  charge_off: {
    any: ["§1681e(b)", "§1681i", "§1681i(a)(5)(A)", "§1681s-2(b)", "§1681n/§1681o"],
    fraud: ["§1681c-2", "§1681e(b)", "§1681i", "§1681s-2(a)(6)", "§1681n/§1681o"],
    reaging: ["§1681c(a)(4)", "§1681e(b)", "§1681i", "§1681s-2(b)"],
  },
  inquiry: {
    any: ["§1681b", "§1681e(b)", "§1681i", "§1681n/§1681o"],
    fraud: ["§1681b", "§1681c-2", "§1681e(b)", "§1681n/§1681o"],
  },
  public_record: {
    any: ["§1681e(b)", "§1681i", "§1681c(a)(4)", "§1681s-2(b)", "§1681n/§1681o"],
    fraud: ["§1681c-2", "§1681e(b)", "§1681i", "§1681n/§1681o"],
  },
  other: {
    any: ["§1681e(b)", "§1681i", "§1681i(a)(5)(A)", "§1681s-2(b)", "§1681n/§1681o"],
  },
};

export function getFCRASections(accountType: string, disputeReason: string): string[] {
  const typeKey = accountType.toLowerCase().replace(/[^a-z_]/g, "_");
  const typeMap = FCRA_TYPE_REASON_MAP[typeKey] || FCRA_TYPE_REASON_MAP.other;
  const reasonLower = disputeReason.toLowerCase();

  let reasonKey = "any";
  if (reasonLower.includes("fraud") || reasonLower.includes("identity") || reasonLower.includes("theft")) {
    reasonKey = "fraud";
  } else if (reasonLower.includes("reag") || reasonLower.includes("7 year") || reasonLower.includes("seven year") || reasonLower.includes("dofd")) {
    reasonKey = "reaging";
  } else if (reasonLower.includes("not mine") || reasonLower.includes("unknown") || reasonLower.includes("never opened")) {
    reasonKey = "notmine";
  }

  const base = typeMap.any || [];
  const specific = typeMap[reasonKey] || [];
  return [...new Set([...base, ...specific])];
}

function buildFCRASectionBlock(sections: string[]): string {
  return sections
    .map((s) => {
      const def = FCRA_SECTION_DEFINITIONS[s] || "Applicable consumer protection statute";
      return `▶ FCRA ${s} — ${def}`;
    })
    .join("\n");
}

// ─── Letter Uniqueness System ──────────────────────────────────────────────────

type OpeningFn = (name: string, creditor: string, round: number, bureau: string) => string;

const OPENING_PARAGRAPHS: OpeningFn[] = [
  (name, creditor, round, bureau) =>
    `I, ${name}, submit this Round ${round} formal credit dispute to ${bureau} pursuant to the Fair Credit Reporting Act, 15 U.S.C. § 1681 et seq. I have identified material inaccuracies in information furnished by ${creditor} that are currently reflected on my credit file and that I am entitled to have investigated and corrected under federal law.`,
  (name, creditor, round, bureau) =>
    `This letter constitutes a Round ${round} formal dispute under FCRA § 1681i submitted by ${name} to ${bureau}. After a careful review of my credit file, I have identified reporting by ${creditor} that contains inaccuracies which, if not corrected, continue to cause unwarranted damage to my credit standing and financial opportunities.`,
  (name, creditor, round, bureau) =>
    `Pursuant to my rights under the Fair Credit Reporting Act (15 U.S.C. §§ 1681–1681x), I, ${name}, hereby formally dispute the accuracy of information reported by ${creditor} and currently appearing in my credit file maintained by ${bureau}. This is my Round ${round} dispute and demands immediate reinvestigation.`,
  (name, creditor, round, bureau) =>
    `I am ${name}, and I write to ${bureau} to exercise my statutory right to dispute inaccurate information on my credit report under the Fair Credit Reporting Act. The account(s) attributed to ${creditor} in my credit file contain errors that require immediate reinvestigation — this is my Round ${round} formal challenge pursuant to FCRA § 1681i(a).`,
  (name, creditor, round, bureau) =>
    `${name} hereby submits this Round ${round} written dispute to ${bureau} under the authority of the Fair Credit Reporting Act, 15 U.S.C. § 1681i. My review of my credit file reveals that ${creditor} has furnished information that does not accurately reflect the true status of my account(s), and I am formally demanding a thorough and reasonable reinvestigation.`,
  (name, creditor, round, bureau) =>
    `To the Consumer Dispute Department at ${bureau}: I, ${name}, am formally disputing account information furnished by ${creditor} that appears on my credit report. This Round ${round} dispute is submitted pursuant to FCRA § 1681i and demands that ${bureau} conduct a complete reinvestigation of the identified inaccuracies and provide written results within the statutory timeframe.`,
  (name, creditor, round, bureau) =>
    `Under the consumer protections afforded by the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681 et seq., I, ${name}, am filing this Round ${round} formal dispute with ${bureau} regarding inaccurate credit information attributed to ${creditor}. The items identified herein contain factual errors that have materially harmed my creditworthiness and must be corrected or deleted immediately.`,
  (name, creditor, round, bureau) =>
    `I write as ${name} to formally dispute — for the ${round === 1 ? "first" : round === 2 ? "second" : round === 3 ? "third" : round + "th"} time — inaccurate tradeline information reported by ${creditor} in my credit file held at ${bureau}. The FCRA, 15 U.S.C. § 1681i, mandates that ${bureau} investigate this dispute, and I demand full compliance within the 30-day statutory window.`,
  (name, creditor, _round, bureau) =>
    `This Round ${_round} dispute letter is submitted by ${name} to ${bureau} pursuant to rights established under the Fair Credit Reporting Act. ${creditor} has reported information to ${bureau} that is materially inaccurate, and this correspondence formally invokes my § 1681i reinvestigation rights and requests immediate corrective action.`,
];

type ClosingFn = (name: string, bureau: string) => string;

const CLOSING_PARAGRAPHS: ClosingFn[] = [
  (name, bureau) =>
    `Please send your written response and updated credit report to the address listed above. Do not telephone — all correspondence must be in writing. I expect ${bureau} to comply fully with all FCRA obligations within the 30-day reinvestigation period.\n\nRespectfully,\n\n\n${name}`,
  (name, bureau) =>
    `I expect a written response from ${bureau} within the statutory 30-day period confirming the results of your reinvestigation. If the disputed item(s) cannot be verified, they must be deleted promptly. All correspondence must be in writing.\n\nSincerely,\n\n\n${name}`,
  (name, bureau) =>
    `Kindly forward your investigation results in writing to the address above within 30 days as required by FCRA § 1681i. Telephonic responses will not be accepted. I look forward to ${bureau}'s prompt and lawful resolution of this matter.\n\nVery truly yours,\n\n\n${name}`,
  (name, bureau) =>
    `I anticipate ${bureau}'s full compliance with the Fair Credit Reporting Act. Please respond in writing to the address above within 30 days. Any information that cannot be verified must be deleted, and I request a free copy of my updated credit report reflecting any changes.\n\nThank you,\n\n\n${name}`,
  (name, bureau) =>
    `This dispute is submitted in good faith to ensure the accuracy of my credit file. I request ${bureau} to take all required actions within the statutory timeframe and to provide written confirmation of the investigation results. All communication must be in writing only.\n\nWith respect,\n\n\n${name}`,
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function selectOpening(params: { clientName: string; creditor: string; roundNumber: number; bureau: string }, seed: number): string {
  const idx = Math.floor(seededRandom(seed) * OPENING_PARAGRAPHS.length);
  return OPENING_PARAGRAPHS[idx](params.clientName, params.creditor, params.roundNumber, params.bureau);
}

function selectClosing(params: { clientName: string; bureau: string }, seed: number): string {
  const idx = Math.floor(seededRandom(seed + 999) * CLOSING_PARAGRAPHS.length);
  return CLOSING_PARAGRAPHS[idx](params.clientName, params.bureau);
}

const DEMAND_VARIANTS: Record<string, string[]> = {
  reinvestigate: [
    "Conduct a thorough and reasonable reinvestigation of the disputed account(s) identified herein, as required by FCRA § 1681i(a).",
    "Immediately initiate a complete reinvestigation of the disputed tradeline(s) listed in this letter pursuant to your obligations under FCRA § 1681i.",
    "Perform a full reinvestigation of the inaccurate information identified in this dispute, contacting the furnisher and verifying all disputed fields.",
  ],
  delete_unverified: [
    "Delete any disputed information that cannot be verified within the statutory 30-day reinvestigation period, as required by FCRA § 1681i(a)(5)(A).",
    "Promptly remove all information that the furnisher is unable to verify as accurate — per FCRA § 1681i(a)(5)(A), unverifiable data must be deleted without delay.",
    "If any disputed item cannot be substantiated by the furnisher within 30 days, delete it from my credit file and notify all affected parties immediately.",
  ],
  notify_furnisher: [
    "Forward all dispute documentation to the furnisher, including this letter, for their own investigation pursuant to FCRA § 1681i(a)(2).",
    "Provide the furnisher with all relevant dispute information and require them to investigate under FCRA § 1681s-2(b).",
    "Transmit this dispute, along with all supporting documentation, to the furnisher for reinvestigation as required by 15 U.S.C. § 1681i(a)(2).",
  ],
  written_results: [
    "Provide written notice of the results of your reinvestigation within 5 business days of its completion, including a free copy of my updated credit report.",
    "Send written confirmation of all actions taken and the results of the investigation to the address above within 5 business days of completion.",
    "Deliver a written summary of your reinvestigation results, including any changes made to my credit file, within 5 business days of completing your review.",
  ],
  method_of_verification: [
    "Provide the name, address, and telephone number of each person contacted during your investigation and the method of verification used, per FCRA § 1681i(a)(7).",
    "Disclose the specific method of verification employed and identify each source contacted, as required by FCRA § 1681i(a)(7).",
  ],
};

function buildRandomizedDemandBullets(creditor: string, letterType: LetterType, seed: number): string {
  const rng = (offset: number) => seededRandom(seed + offset);

  const pick = (arr: string[], offset: number) => arr[Math.floor(rng(offset) * arr.length)];

  const baseDemands = [
    pick(DEMAND_VARIANTS.reinvestigate, 0),
    pick(DEMAND_VARIANTS.notify_furnisher, 1),
    pick(DEMAND_VARIANTS.delete_unverified, 2),
    pick(DEMAND_VARIANTS.method_of_verification, 3),
    pick(DEMAND_VARIANTS.written_results, 4),
  ];

  if (letterType === "identity_theft") {
    baseDemands.unshift(
      `IMMEDIATELY BLOCK this account pursuant to FCRA § 605B within 4 business days of receipt of this letter. Notify ${creditor} that this account is flagged as identity theft and all collection activity must cease.`
    );
  } else if (letterType === "late_payment_metro2") {
    baseDemands.splice(
      1,
      0,
      `Request from ${creditor} the complete Metro 2® Payment History Profile (PHF) and verify each monthly Payment Rating code (Field 17A) against actual payment records. Apply Compliance Condition Code "XB" immediately.`
    );
  } else if (letterType === "closed_school") {
    baseDemands.unshift(
      `Flag this account for investigation under the Closed School Discharge provisions of 34 CFR § 685.214 and contact ${creditor} to confirm discharge status.`
    );
  }

  const shuffledIndices = baseDemands.map((_, i) => i).sort((a, b) => rng(a + 50) - rng(b + 50));
  const shuffled = shuffledIndices.map((i) => baseDemands[i]);

  return shuffled.map((d, i) => `${i + 1}. ${d}`).join("\n");
}

export type LetterType = "closed_school" | "late_payment_metro2" | "identity_theft" | "general";
export type DisputeAccountType = "collection" | "late_payment" | "charge_off" | "inquiry" | "public_record" | "other";
export type DisputeBureau = "EXPERIAN" | "EQUIFAX" | "TRANSUNION";

/**
 * Priority hierarchy for dispute item scoring (highest to lowest actionability):
 * 1. Illegal reinsertion (§1681i(a)(5)(B)) — highest legal violation, strong damages
 * 2. Identity theft / mixed file — fraud, §605B block available, 4-day removal
 * 3. Metro 2 data field violations — DA field, K4 payment pattern, ACCT_STATUS, DOFD re-aging
 * 4. Late payment re-aging — §1681c(a)(4) 7-year clock manipulation
 * 5. Collections / charge-offs — high credit score impact, debt validation leverage
 * 6. Hard inquiries — §1681b permissible purpose violations
 * 7. Standard derogatory accounts — baseline dispute leverage
 */
export const DISPUTE_PRIORITY = {
  ILLEGAL_REINSERTION: 95,
  IDENTITY_THEFT: 90,
  MIXED_FILE: 85,
  METRO2_VIOLATION: 80,
  LATE_REAGING: 75,
  CHARGE_OFF: 70,
  COLLECTION: 65,
  HARD_INQUIRY: 50,
  DEROGATORY: 45,
  STANDARD: 20,
} as const;

const VALID_BUREAUS: DisputeBureau[] = ["EXPERIAN", "EQUIFAX", "TRANSUNION"];
const VALID_ACCOUNT_TYPES: DisputeAccountType[] = ["collection", "late_payment", "charge_off", "inquiry", "public_record", "other"];
const VALID_LETTER_TYPES: LetterType[] = ["closed_school", "late_payment_metro2", "identity_theft", "general"];

export function resolveLetterType(issueType: string, provided?: string, description?: string): LetterType {
  if (provided && VALID_LETTER_TYPES.includes(provided as LetterType)) {
    return provided as LetterType;
  }
  const t = (issueType || "").toLowerCase();
  const d = (description || "").toLowerCase();

  // Explicit closed-school markers in type
  if (t.includes("closed_school") || t.includes("closed school")) return "closed_school";

  // Broader closed-school: student loan type + school-closure keywords in description
  const isStudentLoan = t.includes("student_loan") || t.includes("student loan") || t.includes("ffelp") || t.includes("direct loan");
  const hasClosedSchoolKeyword =
    d.includes("closed school") || d.includes("school closed") || d.includes("school closure") ||
    d.includes("closed institution") || d.includes("institution closed") || d.includes("discharge");
  if (isStudentLoan && hasClosedSchoolKeyword) return "closed_school";

  if (t.includes("late_payment") || t.includes("late payment")) return "late_payment_metro2";
  if (t.includes("identity") || t.includes("fraud")) return "identity_theft";
  return "general";
}

export function resolveBureau(input: string | undefined): DisputeBureau {
  const normalized = (input || "EXPERIAN").toUpperCase();
  if (VALID_BUREAUS.includes(normalized as DisputeBureau)) return normalized as DisputeBureau;
  return "EXPERIAN";
}

export function resolveAccountType(input: string | undefined): DisputeAccountType {
  const normalized = (input || "other").toLowerCase().replace(/[^a-z_]/g, "_");
  if (VALID_ACCOUNT_TYPES.includes(normalized as DisputeAccountType)) return normalized as DisputeAccountType;
  return "other";
}

export interface DisputeIQAccount {
  accountNumber: string;
  accountType?: string;
  dateOpened?: string;
  originalBalance?: string;
  currentBalance?: string;
  reportedStatus?: string;
  accountStatus?: string;
  paymentRating?: string;
  paymentHistoryProfile?: string;
  dateOfFirstDelinquency?: string;
  complianceConditionCode?: string;
  dateAccountInfoChanged?: string;
  k4Segment?: string;
}

export interface DisputeIQParams {
  clientName: string;
  clientAddress: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  clientDob?: string;
  clientSsnLast4?: string;
  clientPhone?: string;
  clientEmail?: string;
  creditor: string;
  accountNumber: string;
  accounts?: DisputeIQAccount[];
  accountType: DisputeAccountType;
  disputeReason: string;
  bureau: DisputeBureau;
  roundNumber: number;
  priorResponse?: string;
  clientState: string;
  letterType?: LetterType;
  policeReportNumber?: string;
  ftcReportNumber?: string;
}

const BUREAU_FULL_ADDRESSES: Record<string, { name: string; address: string }> = {
  EXPERIAN: {
    name: "Experian",
    address: "Experian National Consumer Assistance Center\nP.O. Box 4500\nAllen, TX 75013",
  },
  EQUIFAX: {
    name: "Equifax",
    address: "Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374",
  },
  TRANSUNION: {
    name: "TransUnion",
    address: "TransUnion Consumer Solutions\nP.O. Box 2000\nChester, PA 19016",
  },
};

const ALL_BUREAU_ADDRESSES = `Experian National Consumer Assistance Center, P.O. Box 4500, Allen, TX 75013
Equifax Information Services LLC, P.O. Box 740256, Atlanta, GA 30374
TransUnion Consumer Solutions, P.O. Box 2000, Chester, PA 19016`;

function buildLetterTypeSection(letterType: LetterType, creditor: string, accounts: DisputeIQAccount[]): {
  legalBasis: string;
  demands: string;
  enclosures: string;
  reLineExtra: string;
} {
  switch (letterType) {
    case "closed_school":
      return {
        legalBasis: `IV. LEGAL BASIS

This dispute is governed by the following federal statutes and regulations:

1. 34 CFR § 685.214 — Closed School Discharge: The borrower is entitled to a 100% discharge of Direct Loans taken out to attend a school that closed while the borrower was enrolled or within 120 days of withdrawal. This regulation requires the loan servicer/guarantor to discharge the outstanding balance and refund all amounts paid.

2. 20 U.S.C. § 1087(c) — Higher Education Act: Statutory authority for closed school discharge for FFEL and Direct Loans.

3. FCRA §§ 1681e(b), 1681i(a) — Accuracy and Reinvestigation Requirements: Any account that should have been discharged must be reported accurately. Continued negative reporting after discharge eligibility constitutes a violation.

4. FCRA § 1681i(a)(5)(A) — Deletion Requirement: If the creditor/servicer cannot verify the accuracy of the reported information (including that discharge was properly applied), the item must be deleted promptly.`,
        demands: `V. DEMANDS

I hereby demand that you take the following actions within 30 days of receipt of this letter, as required by law:

1. Immediately flag this account for investigation under the Closed School Discharge provisions of 34 CFR § 685.214.
2. Contact the loan servicer/guarantor and confirm whether a closed school discharge has been applied or whether one is pending.
3. Remove and delete any derogatory reporting related to this account from my credit file pending discharge confirmation.
4. If the servicer confirms discharge eligibility, permanently delete this tradeline in its entirety from my credit report.
5. Provide written confirmation of all actions taken, including the name and address of each source contacted during your investigation.
6. Forward a copy of your investigation results to me within 5 business days of completion.`,
        enclosures: `VII. ENCLOSURES

- Copy of Government-Issued Photo ID
- Copy of Proof of Current Address
- Documentation of school closure date (if available)
- Enrollment records or withdrawal documentation (if available)`,
        reLineExtra: "(Closed School Discharge — 34 CFR § 685.214)",
      };

    case "late_payment_metro2":
      return {
        legalBasis: `IV. LEGAL BASIS

This dispute is governed by the following federal statutes and industry reporting standards:

1. FCRA § 1681e(b) — Maximum Possible Accuracy: Credit reporting agencies must follow reasonable procedures to ensure maximum possible accuracy of consumer information. Inaccurate payment rating codes violate this section.

2. FCRA § 1681i(a) — Reinvestigation of Disputed Information: Upon receipt of a dispute, the bureau must conduct a reasonable reinvestigation within 30 days.

3. FCRA § 1681i(a)(5)(A) — Prompt Deletion: If information cannot be verified, it must be promptly deleted.

4. FCRA § 1681s-2 — Responsibilities of Furnishers: Furnishers are prohibited from reporting information they know or have reasonable cause to believe is inaccurate. A furnisher's failure to correct inaccurate payment history after being notified is a direct violation.

5. Metro 2® Credit Reporting Resource Guide (CRRG) — Payment Rating (Field 17A): Under the Metro 2® format, Payment Rating code "00" denotes current/on-time, while codes "01"–"05" denote 30–150 days late. Any Payment Rating code applied to my account must accurately reflect the actual payment history without deviation.

6. Metro 2® CRRG — Payment History Profile (PHF): The Payment History Profile field must accurately record each month's payment status. Any month showing a late code that does not correspond to a genuinely late payment constitutes a Metro 2 reporting error.

7. Metro 2® CRRG — Date of First Delinquency (DOFD): The DOFD must be reported accurately and cannot be re-aged. Re-aging or altering the DOFD to extend the reporting period beyond 7 years from the original delinquency is a violation of FCRA § 1681c.

8. Metro 2® CRRG — Compliance Condition Code XB: Code "XB" (Account information disputed by consumer) must be applied to this account during the dispute investigation period as required.`,
        demands: `V. DEMANDS

I hereby demand that you take the following actions within 30 days of receipt of this letter, as required by law:

1. Conduct a reasonable reinvestigation of the disputed late payment entry(ies) with the furnisher.
2. Request from the furnisher the complete Metro 2® Payment History Profile (PHF) for the disputed period and verify each month's Payment Rating code against actual payment records.
3. Verify the accuracy of the Date of First Delinquency (DOFD) and confirm it has not been re-aged.
4. Apply Metro 2® Compliance Condition Code "XB" to this account immediately to flag it as disputed.
5. If the furnisher cannot provide documentation substantiating the accuracy of the late payment entries, delete the derogatory payment history immediately.
6. If the late payment entries are verified as inaccurate or unverifiable, correct the Payment Rating codes to "00" (current) and update the Payment History Profile accordingly.
7. Provide written notice of the results of your investigation within 5 business days of completion.`,
        enclosures: `VII. ENCLOSURES

- Copy of Government-Issued Photo ID
- Copy of Proof of Current Address
- Bank statements or payment confirmations for the disputed period (if available)
- Any correspondence with the original creditor regarding payment (if available)`,
        reLineExtra: "(Metro 2® Payment Rating / PHF Inaccuracy Dispute)",
      };

    case "identity_theft":
      return {
        legalBasis: `IV. LEGAL BASIS

This dispute is governed by the following federal statutes specifically enacted to protect identity theft victims:

1. FCRA § 605B — Block of Information Resulting from Identity Theft: Upon receipt of proof of identity and an identity theft report, a consumer reporting agency must block the reporting of any information in a consumer's file that the consumer identifies as information that resulted from an alleged identity theft, not later than 4 business days after the date of receipt.

2. FCRA § 1681c-2 — Block of Information Resulting from Identity Theft: Provides additional protections and timelines for blocking fraudulent tradelines from identity theft victims' credit reports.

3. FCRA § 1681e(b) — Maximum Possible Accuracy: Continued reporting of a fraudulent account that the consumer did not open constitutes an inaccuracy that violates the bureau's duty to maintain accurate files.

4. FCRA § 1681i(a) — Reinvestigation: The bureau must investigate disputed information, and if fraudulent, must block and delete the account.

5. FCRA § 1681s-2(a)(6) — Furnisher Duty to Fraud Victims: Furnishers who receive identity theft reports must cease reporting the information and investigate the consumer's fraud claim.

6. 15 U.S.C. § 1681n / § 1681o — Civil Liability: Willful or negligent noncompliance with FCRA identity theft provisions exposes the bureau and furnisher to statutory damages of $100–$1,000 per violation, plus punitive damages and attorney's fees.`,
        demands: `V. DEMANDS

I hereby demand that you take the following actions within 4 business days of receipt of this letter and the enclosed identity theft documentation, as required by FCRA § 605B:

1. IMMEDIATELY BLOCK this account from my credit file pursuant to FCRA § 605B. This is not a standard dispute — this is an identity theft block request with the required documentation enclosed.
2. Notify the furnisher (${creditor}) that this account has been flagged as identity theft and that they must cease all collection activity and credit reporting related to this account.
3. Place a Fraud Alert on my credit file that will remain active for a minimum of one year.
4. Provide me with a copy of my credit report reflecting the removal of this fraudulent account within 5 business days.
5. Forward the identity theft documentation to the relevant furnisher so they may investigate and close the fraudulent account on their end.
6. Provide written confirmation of all blocks applied, including the effective date.`,
        enclosures: `VII. ENCLOSURES

- Copy of Government-Issued Photo ID
- Copy of Proof of Current Address
- FTC Identity Theft Report (IdentityTheft.gov complaint number enclosed)
- Local Police Report (if filed)
- Signed Identity Theft Affidavit`,
        reLineExtra: "(Identity Theft — FCRA § 605B Block Request)",
      };

    case "general":
    default:
      return {
        legalBasis: `IV. LEGAL BASIS

This dispute is governed by the following federal statutes:

1. FCRA § 1681e(b) — Maximum Possible Accuracy: Consumer reporting agencies must follow reasonable procedures to ensure maximum possible accuracy of consumer information.

2. FCRA § 1681i(a) — Reinvestigation of Disputed Information: Upon notification of a dispute, the bureau must conduct a reasonable reinvestigation within 30 days and provide the consumer with written results.

3. FCRA § 1681i(a)(5)(A) — Prompt Deletion: If disputed information cannot be verified within the statutory period, the bureau must promptly delete it.

4. FCRA § 1681s-2 — Responsibilities of Furnishers of Information: Furnishers are prohibited from reporting information they know or have reasonable cause to believe is inaccurate. They must conduct their own investigation upon notification of a dispute.

5. FCRA § 1681n / § 1681o — Civil Liability: Willful or negligent noncompliance with any FCRA provision exposes the violating party to statutory damages of $100–$1,000 per violation, plus punitive damages and attorney's fees.`,
        demands: `V. DEMANDS

I hereby demand that you take the following actions within 30 days of receipt of this letter, as required by federal law:

1. Conduct a thorough and reasonable reinvestigation of the disputed account(s) listed herein.
2. Forward all relevant dispute information, including this letter, to the furnisher (${creditor}) for their investigation pursuant to FCRA § 1681i(a)(2).
3. Provide me with the name, address, and telephone number of each person contacted during your investigation, and the method of verification used, as required by FCRA § 1681i(a)(7).
4. If the disputed information cannot be verified within the 30-day statutory period, immediately delete it from my credit file and notify all affected parties.
5. Provide written notice of the results of the reinvestigation within 5 business days of its completion, including a free copy of my updated credit report.
6. If information is verified as accurate, provide written explanation of the specific information relied upon during verification.`,
        enclosures: `VII. ENCLOSURES

- Copy of Government-Issued Photo ID
- Copy of Proof of Current Address
- Supporting documentation related to the dispute (if applicable)`,
        reLineExtra: "(FCRA § 1681i Dispute)",
      };
  }
}

function buildAccountTable(accounts: DisputeIQAccount[]): string {
  if (!accounts || accounts.length === 0) return "";
  const header = `| Loan/Account # | Date Opened | Orig Balance | Cur Balance | Reported Status |`;
  const divider = `|----------------|-------------|--------------|-------------|-----------------|`;
  const rows = accounts.map(
    (a) =>
      `| ${a.accountNumber || "—"} | ${a.dateOpened || "—"} | ${a.originalBalance || "—"} | ${a.currentBalance || "—"} | ${a.reportedStatus || "—"} |`
  );
  return [header, divider, ...rows].join("\n");
}

function buildRoundEscalationContext(roundNumber: number, letterType: LetterType): string {
  if (roundNumber === 1) return "";
  const escalations: Record<number, string> = {
    2: `This bureau was previously notified via a Round 1 dispute letter and failed to provide an adequate response or verification. Pursuant to FCRA § 1681i(a)(7), I hereby demand the method of verification used. Failure to respond appropriately will result in a formal complaint filed with the Consumer Financial Protection Bureau (CFPB).`,
    3: `This bureau has now received two prior dispute letters regarding the inaccurate account(s) listed herein. Both letters went unresolved or received inadequate responses. I am formally notifying you that a CFPB consumer complaint will be filed if this dispute is not resolved in accordance with FCRA requirements within the statutory 30-day period. Additionally, I am demanding proof of permissible purpose for the retention of this information per FCRA § 1681b.`,
    4: `This constitutes Round 4 of my dispute process. The continued failure to investigate and resolve this dispute constitutes potential willful noncompliance under FCRA § 1681n. I am formally demanding debt validation under FDCPA § 809(b) and furnisher documentation under FCRA § 1681s-2. You have 30 days to respond fully or face referral to legal counsel.`,
    5: `This is a FINAL DEMAND prior to legal action. Having exhausted all informal dispute channels through four prior rounds without adequate resolution, I am prepared to pursue litigation under FCRA §§ 1681n and 1681o for willful and negligent non-compliance. Statutory damages of $100–$1,000 per violation may be available, in addition to actual damages, punitive damages, and attorney's fees. This letter shall serve as Exhibit A in any future legal proceeding.`,
  };
  return escalations[roundNumber] || "";
}

/** Returns ▶-prefixed statute bullet lines for the legal basis section */
function buildStatuteBullets(letterType: LetterType): string {
  switch (letterType) {
    case "identity_theft":
      return [
        "▶ FCRA § 605B (15 U.S.C. § 1681c-2) — 4-business-day block of identity theft tradelines upon receipt of identity theft report and ID.",
        "▶ FCRA § 1681e(b) — Duty to maintain maximum possible accuracy; continued reporting of a fraudulent account violates this section.",
        "▶ FCRA § 1681i(a) — Reinvestigation of disputed information; bureau must investigate and, if unverifiable, delete.",
        "▶ FCRA § 1681s-2(a)(6) — Furnisher must cease reporting information identified as resulting from identity theft.",
        "▶ 15 U.S.C. §§ 1681n/1681o — Civil liability: $100–$1,000 per violation, actual damages, punitive damages, attorney's fees.",
      ].join("\n");
    case "late_payment_metro2":
      return [
        "▶ FCRA § 1681e(b) — Maximum possible accuracy: Payment Rating codes must accurately reflect actual payment history.",
        "▶ FCRA § 1681i(a) — Reinvestigation required within 30 days; unverifiable information must be deleted.",
        "▶ FCRA § 1681i(a)(5)(A) — Prompt deletion if furnisher cannot verify the accuracy of the disputed entry.",
        "▶ FCRA § 1681s-2(b) — Furnisher responsibility: must correct or delete inaccurate payment history after dispute notice.",
        "▶ Metro 2® CRRG — Payment Rating Field 17A: Code must reflect actual payment status (00=current; 01–05=30–150 days late).",
        "▶ Metro 2® CRRG — Payment History Profile (PHF): Each month must accurately reflect payment status, no re-aging.",
        "▶ Metro 2® CRRG — DOFD must not be altered to extend the 7-year reporting period (FCRA § 1681c(a)(4)).",
        "▶ Metro 2® CRRG — Compliance Condition Code XB must be applied during dispute investigation period.",
      ].join("\n");
    case "closed_school":
      return [
        "▶ 34 CFR § 685.214 — Closed School Discharge: 100% discharge of Direct Loans for students enrolled when school closed or within 120 days of withdrawal.",
        "▶ 20 U.S.C. § 1087(c) — Statutory authority for closed school discharge (FFEL and Direct Loans).",
        "▶ FCRA § 1681e(b) — Accuracy duty: discharged accounts must be reported accurately; continued negative reporting violates this section.",
        "▶ FCRA § 1681i(a)(5)(A) — If servicer cannot verify discharge was applied, item must be deleted.",
      ].join("\n");
    default:
      return [
        "▶ FCRA § 1681e(b) — Maximum possible accuracy requirement; the reported information is inaccurate.",
        "▶ FCRA § 1681i(a) — Reinvestigation of disputed information within 30 days of receipt.",
        "▶ FCRA § 1681i(a)(5)(A) — Information that cannot be verified must be promptly deleted.",
        "▶ FCRA § 1681s-2(b) — Furnisher must investigate disputes forwarded by credit bureaus and correct or delete inaccurate data.",
        "▶ 15 U.S.C. §§ 1681n/1681o — Civil liability for willful or negligent noncompliance: statutory damages, actual damages, attorney's fees.",
      ].join("\n");
  }
}

/** Returns numbered demand lines for the demands section */
function buildDemandBullets(letterType: LetterType, creditor: string): string {
  switch (letterType) {
    case "identity_theft":
      return [
        `1. IMMEDIATELY BLOCK this account pursuant to FCRA § 605B within 4 business days of receipt of this letter and enclosed identity theft report.`,
        `2. Notify ${creditor} that this account is flagged as identity theft and they must cease all collection activity and credit reporting.`,
        `3. Place a Fraud Alert on my credit file active for a minimum of one year.`,
        `4. Provide a copy of my updated credit report reflecting the removal within 5 business days.`,
        `5. Provide written confirmation of all blocks applied, including the effective date.`,
      ].join("\n");
    case "late_payment_metro2":
      return [
        `1. Conduct a reasonable reinvestigation of the disputed late payment entries with ${creditor}.`,
        `2. Request from ${creditor} the complete Metro 2® Payment History Profile (PHF) and verify each Payment Rating code against actual payment records.`,
        `3. Verify the Date of First Delinquency (DOFD) has not been re-aged beyond its original date.`,
        `4. Apply Metro 2® Compliance Condition Code "XB" to this account immediately to flag it as disputed.`,
        `5. If the late payment entries are unverifiable, delete the derogatory payment history and correct Payment Rating codes to "00."`,
        `6. Provide written notice of investigation results within 5 business days of completion.`,
      ].join("\n");
    case "closed_school":
      return [
        `1. Immediately flag this account for investigation under the Closed School Discharge provisions of 34 CFR § 685.214.`,
        `2. Contact ${creditor} and confirm whether a closed school discharge has been applied or is pending.`,
        `3. Remove any derogatory reporting pending discharge confirmation.`,
        `4. If servicer confirms discharge eligibility, permanently delete this tradeline from my credit report.`,
        `5. Provide written confirmation of all actions taken, including the name and contact of each source contacted.`,
      ].join("\n");
    default:
      return [
        `1. Conduct a full reinvestigation of the disputed information with ${creditor} pursuant to FCRA § 1681i(a).`,
        `2. If the information cannot be verified as accurate, delete it from my credit file within the statutory timeframe.`,
        `3. If any information is corrected, provide an updated credit report reflecting the correction within 5 business days.`,
        `4. Notify me in writing of the results of your investigation within 5 business days of completion.`,
        `5. If deletion results from this dispute, do not reinsert the item without written notice pursuant to FCRA § 1681i(a)(5)(B).`,
      ].join("\n");
  }
}

export async function generateDisputeIQLetter(params: DisputeIQParams): Promise<string> {
  const bureauInfo = BUREAU_FULL_ADDRESSES[params.bureau];
  const effectiveLetterType: LetterType = params.letterType || "general";

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  const accounts: DisputeIQAccount[] = params.accounts && params.accounts.length > 0
    ? params.accounts
    : [{ accountNumber: params.accountNumber }];

  // ── Uniqueness seed: client + creditor + round + full ms timestamp for per-generation uniqueness ──
  const generationNonce = Date.now();
  const seed = Array.from(
    `${params.clientName}${params.creditor}${params.roundNumber}${generationNonce}`
  ).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  // ── Metro 2 violation detection across all accounts ──
  const allMetro2Violations: Metro2Violation[] = accounts.flatMap((a) =>
    detectMetro2Violations({
      accountNumber: a.accountNumber,
      reportedStatus: a.reportedStatus,
      accountStatus: a.accountStatus,
      paymentRating: a.paymentRating,
      paymentHistoryProfile: a.paymentHistoryProfile,
      dateOfFirstDelinquency: a.dateOfFirstDelinquency,
      complianceConditionCode: a.complianceConditionCode,
      dateAccountInfoChanged: a.dateAccountInfoChanged,
      k4Segment: a.k4Segment,
    })
  );
  const metro2Block = formatMetro2ViolationsBlock(allMetro2Violations);

  // ── Unique opening + closing paragraphs ──
  const openingParagraph = selectOpening(
    { clientName: params.clientName, creditor: params.creditor, roundNumber: params.roundNumber, bureau: bureauInfo.name },
    seed
  );
  const closingParagraph = selectClosing({ clientName: params.clientName, bureau: bureauInfo.name }, seed);

  // ── Randomized demand bullets ──
  const randomizedDemands = buildRandomizedDemandBullets(params.creditor, effectiveLetterType, seed);

  const letterTypeSections = buildLetterTypeSection(effectiveLetterType, params.creditor, accounts);
  const escalationContext = buildRoundEscalationContext(params.roundNumber, effectiveLetterType);

  const accountSummary = accounts.length === 1
    ? `Account Number: ${accounts[0].accountNumber}`
    : `${accounts.length} Accounts (see table in Section II)`;

  const letterTypeLabel = {
    closed_school: "Closed School Discharge",
    late_payment_metro2: "Late Payment / Metro 2 Inaccuracy",
    identity_theft: "Identity Theft / FCRA § 605B Block",
    general: "FCRA Credit Dispute",
  }[effectiveLetterType];

  const stateSpecific: Record<string, string> = {
    CA: "Additionally, California Civil Code § 1785 (California Consumer Credit Reporting Agencies Act) affords California residents enhanced rights, including the right to receive free credit report copies and additional dispute protections.",
    TX: "Texas Finance Code Chapter 392 provides additional consumer protections for Texas residents in credit reporting matters.",
    NY: "New York General Business Law § 380 provides additional credit reporting protections for New York state residents.",
    FL: "The Florida Consumer Collection Practices Act (FCCPA) provides additional state-level consumer protections applicable to this dispute.",
    IL: "The Illinois Consumer Fraud and Deceptive Business Practices Act provides supplemental protections applicable to this matter.",
  };
  const stateLawNote = stateSpecific[params.clientState?.toUpperCase() || ""] || "";

  const prompt = `You are an expert consumer rights attorney and professional credit dispute specialist. Generate a complete, professional dispute packet letter in EXACT packet format below. Every section marker, bullet symbol, and line must appear exactly as shown. No bracketed placeholders may appear in the output — replace all with the real data provided.

DATA FOR THIS PACKET:
═══════════════════════════════════════════════════════════════════════
CLIENT: ${params.clientName}
ADDRESS: ${params.clientAddress.line1}, ${params.clientAddress.city}, ${params.clientAddress.state} ${params.clientAddress.zip}
${params.clientDob ? `DOB: ${params.clientDob}` : ""}${params.clientSsnLast4 ? `\nSSN (Last 4): ***-**-${params.clientSsnLast4}` : ""}${params.clientPhone ? `\nPhone: ${params.clientPhone}` : ""}${params.clientEmail ? `\nEmail: ${params.clientEmail}` : ""}
DATE: ${formattedDate}
BUREAU: ${bureauInfo.name.toUpperCase()} | LETTER TYPE: ${letterTypeLabel} — Round ${params.roundNumber} of 5
CREDITOR/FURNISHER: ${params.creditor}
${accountSummary}
DISPUTE REASON: ${params.disputeReason}
${params.policeReportNumber ? `POLICE REPORT #: ${params.policeReportNumber}` : ""}
${params.ftcReportNumber ? `FTC IDENTITY THEFT REPORT #: ${params.ftcReportNumber}` : ""}
${params.priorResponse ? `PRIOR RESPONSE: ${params.priorResponse}` : ""}
${escalationContext ? `ESCALATION NOTE: ${escalationContext}` : ""}
${stateLawNote ? `STATE LAW: ${stateLawNote}` : ""}
${metro2Block ? `\nMETRO 2 VIOLATIONS:\n${metro2Block}` : ""}
═══════════════════════════════════════════════════════════════════════

EXACT OUTPUT FORMAT — reproduce character-for-character including ═, ─, ▶ symbols:

${params.clientName.toUpperCase()}
${params.clientAddress.line1}
${params.clientAddress.city}, ${params.clientAddress.state} ${params.clientAddress.zip}
${params.clientDob ? `Date of Birth: ${params.clientDob}` : ""}
${params.clientSsnLast4 ? `SSN (Last 4): ***-**-${params.clientSsnLast4}` : ""}
${params.clientPhone ? `Phone: ${params.clientPhone}` : ""}

${formattedDate}

Sent via Certified Mail — Return Receipt Requested

${bureauInfo.address}
Consumer Dispute Department

─────────────────────────────────────────────────────────────────────
RE: FORMAL CREDIT DISPUTE — ${letterTypeLabel.toUpperCase()} ${letterTypeSections.reLineExtra}
    Furnisher/Creditor: ${params.creditor}
    ${accountSummary}${params.policeReportNumber ? `\n    Police Report #: ${params.policeReportNumber}` : ""}${params.ftcReportNumber ? `\n    FTC Report #: ${params.ftcReportNumber}` : ""}
─────────────────────────────────────────────────────────────────────

PACKAGE CONTENTS:
─────────────────────────────────────────────────────────────────────
  1. Dispute Cover Letter (this document)
  2. Copy of Government-Issued Photo ID
  3. Proof of Address${effectiveLetterType === "identity_theft" ? `\n  4. FTC Identity Theft Report${params.ftcReportNumber ? ` (Complaint #: ${params.ftcReportNumber})` : ""}\n  5. Signed Identity Theft Affidavit${params.policeReportNumber ? `\n  6. Local Police Report (#: ${params.policeReportNumber})` : ""}` : effectiveLetterType === "closed_school" ? "\n  4. Documentation of School Closure Date" : ""}
─────────────────────────────────────────────────────────────────────

To Whom It May Concern:

${openingParagraph}

DISPUTED ITEMS (${accounts.length} total):
═══════════════════════════════════════════════════════════════════════
${accounts.map((a, i) => {
  const acctViolations = detectMetro2Violations({
    accountNumber: a.accountNumber,
    reportedStatus: a.reportedStatus,
    accountStatus: a.accountStatus,
    paymentRating: a.paymentRating,
    paymentHistoryProfile: a.paymentHistoryProfile,
    dateOfFirstDelinquency: a.dateOfFirstDelinquency,
    complianceConditionCode: a.complianceConditionCode,
    dateAccountInfoChanged: a.dateAccountInfoChanged,
    k4Segment: a.k4Segment,
  });
  const acctAccountType = resolveAccountType(a.accountType || params.accountType);
  const acctFcraSections = getFCRASections(acctAccountType, params.disputeReason);
  const acctFcraBullets = buildFCRASectionBlock(acctFcraSections);
  return `
ITEM ${i + 1}: ${params.creditor}
Account #: ${a.accountNumber || "See enclosed documentation"}
${a.reportedStatus ? `Status: ${a.reportedStatus}` : ""}${a.currentBalance ? `\nBalance: ${a.currentBalance}` : ""}${a.dateOpened ? `\nOpened: ${a.dateOpened}` : ""}

INACCURACY: [Write 1–2 sentences describing the specific inaccuracy for this account based on the dispute reason: "${params.disputeReason}". Be concrete — name what field is wrong and why.]
${acctViolations.length > 0 ? `\nMETRO 2® FIELD VIOLATIONS:\n${formatMetro2ViolationsBlock(acctViolations)}` : ""}

APPLICABLE FCRA SECTIONS:
${acctFcraBullets}

DEMANDS:
${randomizedDemands}

═══════════════════════════════════════════════════════════════════════`;
}).join("\n")}

LEGAL NOTICE:
─────────────────────────────────────────────────────────────────────
Pursuant to the FCRA, 15 U.S.C. § 1681i, you must complete your reinvestigation and provide written results within 30 days of receipt of this letter (or 45 days if the consumer furnishes additional information during the 30-day period). Any information that cannot be verified must be deleted. Failure to comply exposes your organization to civil liability under 15 U.S.C. §§ 1681n and 1681o, including actual damages, statutory damages of $100–$1,000 per violation, punitive damages, and attorney's fees.${escalationContext ? `\n\n${escalationContext}` : ""}${stateLawNote ? `\n\n${stateLawNote}` : ""}

${closingParagraph}
${params.clientPhone || ""}
${formattedDate}

Enclosures:
  1. Dispute Cover Letter (this document)
  2. Copy of Government-Issued Photo ID
  3. Proof of Address${effectiveLetterType === "identity_theft" ? "\n  4. FTC Identity Theft Report\n  5. Signed Identity Theft Affidavit" : effectiveLetterType === "closed_school" ? "\n  4. Documentation of School Closure Date" : ""}

INSTRUCTIONS: Generate the complete packet now. Reproduce ALL section markers (═, ─, ▶) exactly. The opening paragraph has already been written above — use it verbatim. The demands section has already been pre-generated — use it verbatim. Replace ONLY the [bracketed instruction lines] with real personalized prose. Do not add commentary or instructions outside the letter.`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 3500,
    messages: [{ role: "user", content: prompt }],
  });

  const letter =
    response.content[0].type === "text" ? response.content[0].text : "";

  return letter;
}
