import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  dateOpened?: string;
  originalBalance?: string;
  currentBalance?: string;
  reportedStatus?: string;
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

  const clientNameAllCaps = params.clientName.toUpperCase();
  const addressLine = `${params.clientAddress.line1}, ${params.clientAddress.city}, ${params.clientAddress.state} ${params.clientAddress.zip}`;

  const headerLines = [
    clientNameAllCaps,
    params.clientAddress.line1,
    `${params.clientAddress.city}, ${params.clientAddress.state} ${params.clientAddress.zip}`,
    ...(params.clientDob ? [`Date of Birth: ${params.clientDob}`] : []),
    ...(params.clientSsnLast4 ? [`SSN (Last 4): XXX-XX-${params.clientSsnLast4}`] : []),
    ...(params.clientPhone ? [`Phone: ${params.clientPhone}`] : []),
    ...(params.clientEmail ? [`Email: ${params.clientEmail}`] : []),
  ];

  const accounts: DisputeIQAccount[] = params.accounts && params.accounts.length > 0
    ? params.accounts
    : [{ accountNumber: params.accountNumber }];

  const accountTable = accounts.length > 1 ? buildAccountTable(accounts) : "";
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

  // Build statute bullet blocks for legal basis section
  const legalBasisBullets = buildStatuteBullets(effectiveLetterType);
  const demandsBullets = buildDemandBullets(effectiveLetterType, params.creditor);

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

[Write 2–3 sentences of personalized introduction. State who the consumer is, that they are writing to dispute inaccurate information under FCRA § 1681i, reference the letter round, and the creditor/account at issue. Do NOT use placeholder language.]

DISPUTED ITEMS (${accounts.length} total):
═══════════════════════════════════════════════════════════════════════
${accounts.map((a, i) => `
ITEM ${i + 1}: ${params.creditor}
Account #: ${a.accountNumber || "See enclosed documentation"}
${a.reportedStatus ? `Status: ${a.reportedStatus}` : ""}${a.currentBalance ? `\nBalance: ${a.currentBalance}` : ""}${a.dateOpened ? `\nOpened: ${a.dateOpened}` : ""}

INACCURACY: [Write 1–2 sentences describing the specific inaccuracy for this account based on the dispute reason: "${params.disputeReason}". Be concrete — name what field is wrong and why.]

LEGAL BASIS:
${legalBasisBullets}

DEMANDS:
${demandsBullets}

═══════════════════════════════════════════════════════════════════════`).join("\n")}

LEGAL NOTICE:
─────────────────────────────────────────────────────────────────────
Pursuant to the FCRA, 15 U.S.C. § 1681i, you must complete your reinvestigation and provide written results within 30 days of receipt of this letter (or 45 days if the consumer furnishes additional information during the 30-day period). Any information that cannot be verified must be deleted. Failure to comply exposes your organization to civil liability under 15 U.S.C. §§ 1681n and 1681o, including actual damages, statutory damages of $100–$1,000 per violation, punitive damages, and attorney's fees.${escalationContext ? `\n\n${escalationContext}` : ""}${stateLawNote ? `\n\n${stateLawNote}` : ""}

Please send your written response and updated credit report to the address listed above. Do not telephone. All correspondence must be in writing.

Sincerely,



${params.clientName}
${params.clientPhone || ""}
${formattedDate}

Enclosures:
  1. Dispute Cover Letter (this document)
  2. Copy of Government-Issued Photo ID
  3. Proof of Address${effectiveLetterType === "identity_theft" ? "\n  4. FTC Identity Theft Report\n  5. Signed Identity Theft Affidavit" : effectiveLetterType === "closed_school" ? "\n  4. Documentation of School Closure Date" : ""}

Generate the complete packet now. Reproduce ALL section markers (═, ─, ▶) exactly. Replace ONLY the bracketed instruction lines with real personalized prose. Do not add commentary or instructions.`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const letter =
    response.content[0].type === "text" ? response.content[0].text : "";

  return letter;
}
