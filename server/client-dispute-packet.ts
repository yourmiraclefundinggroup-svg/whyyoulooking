/**
 * Client-facing AI-powered dispute packet generator.
 * Separate from the admin version — uses the violation analysis engine output
 * to write unique, factually-grounded per-account dispute descriptions.
 */

import OpenAI from "openai";
import type { AnalyzedTradeline } from "./violation-analysis";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ConsumerInfo {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth?: string;
  ssnLast4?: string;
  stateIdNumber?: string;
  isIdentityTheft?: boolean;
  ftcReportNumber?: string;
}

export interface ClientPacketOptions {
  consumer: ConsumerInfo;
  bureau: "EXPERIAN" | "EQUIFAX" | "TRANSUNION";
  selectedAccounts: AnalyzedTradeline[];
  enclosureNames?: string[];   // e.g. ["Government ID", "SSN Card Copy"]
  letterType?: "round1" | "validation";
}

export interface GeneratedPacket {
  bureau: string;
  letterContent: string;
  accountCount: number;
}

const BUREAU_ADDRESSES: Record<string, string[]> = {
  EXPERIAN: [
    "Experian Information Solutions, Inc.",
    "Dispute Department",
    "P.O. Box 4500",
    "Allen, TX 75013",
  ],
  EQUIFAX: [
    "Equifax Information Services, LLC",
    "P.O. Box 740256",
    "Atlanta, GA 30374-0256",
  ],
  TRANSUNION: [
    "TransUnion LLC",
    "Consumer Dispute Center",
    "P.O. Box 2000",
    "Chester, PA 19016",
  ],
};

function bureauAddress(bureau: string): string {
  return (BUREAU_ADDRESSES[bureau] || BUREAU_ADDRESSES["EXPERIAN"]).join("\n");
}

/**
 * Ask OpenAI to write a unique, specific Ground 2 (Metro 2) and Ground 3 (FCRA)
 * violation description for one account, using the actual detected violations.
 */
async function writeAccountViolationParagraph(
  account: AnalyzedTradeline,
  isIdentityTheft: boolean
): Promise<{ ground2: string; ground3: string; demand: string }> {
  const metro2Violations = account.violations
    .filter((v) => v.category === "metro2")
    .map((v) => `${v.label} (${v.statute || "Metro 2"})`);
  const fcraViolations = account.violations
    .filter((v) => v.category === "fcra")
    .map((v) => `${v.label} — ${v.statute || ""}`);

  const accountSummary = [
    `Creditor: ${account.creditor}`,
    `Account Number: ${account.accountNumber}`,
    `Account Type: ${account.accountType}`,
    `Status: ${account.status}`,
    `Balance: ${account.balance}`,
    account.dateOfFirstDelinquency ? `DOFD: ${account.dateOfFirstDelinquency}` : null,
    account.latePayments?.days30 ? `Late 30-day: ${account.latePayments.days30}` : null,
    account.latePayments?.days60 ? `Late 60-day: ${account.latePayments.days60}` : null,
    account.latePayments?.days90 ? `Late 90-day: ${account.latePayments.days90}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const prompt = `You are drafting a formal credit dispute letter on behalf of a consumer disputing a credit bureau entry.

Account facts: ${accountSummary}
Detected Metro 2 violations: ${metro2Violations.length ? metro2Violations.join("; ") : "none detected"}
Detected FCRA violations: ${fcraViolations.length ? fcraViolations.join("; ") : "none detected"}
Identity theft case: ${isIdentityTheft ? "yes" : "no"}

Write THREE short paragraphs (1-3 sentences each, formal legal tone):
1. "ground2" — Metro 2 compliance violation description specific to this account's detected violations. Cite the actual field names and what was found. If none, write "No Metro 2 violations were specifically identified for this account; however, the reporting must comply with the Metro 2 format at all times."
2. "ground3" — FCRA statutory violation description specific to this account. Reference the actual statutes detected. Be factual and specific to the creditor and account type.
3. "demand" — A specific numbered demand paragraph for this creditor to: (a) conduct reinvestigation, (b) provide verification records, (c) remove/correct if unverifiable within 30 days per § 1681i. Make it specific to this account's issues.

Return JSON: { "ground2": "...", "ground3": "...", "demand": "..." }`;

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });
    const parsed = JSON.parse(resp.choices[0]?.message?.content || "{}");
    return {
      ground2: parsed.ground2 || "Metro 2 data reporting violations are present for this account.",
      ground3: parsed.ground3 || "This account violates applicable FCRA statutes.",
      demand: parsed.demand || "Demand: Conduct a complete reinvestigation and delete if unverifiable within 30 days.",
    };
  } catch {
    return {
      ground2: metro2Violations.length
        ? `This account contains the following Metro 2 data reporting violations: ${metro2Violations.join("; ")}.`
        : "All Metro 2 fields must be accurately reported per the Consumer Data Industry Association standard.",
      ground3: fcraViolations.length
        ? `This account violates the following FCRA statutes: ${fcraViolations.join("; ")}.`
        : "This account must be accurately reported per 15 U.S.C. § 1681e(b) and § 1681i.",
      demand: `Demand: Conduct a complete reinvestigation of all data reported for this account. Provide verification records including the original signed agreement. Delete this account if accuracy cannot be fully verified within 30 days per § 1681i(a)(1).`,
    };
  }
}

/**
 * Generate a complete, formatted client dispute packet for one bureau.
 * Uses OpenAI per-account to write unique, factually-grounded descriptions.
 */
export async function generateClientDisputePacket(
  options: ClientPacketOptions
): Promise<GeneratedPacket> {
  const {
    consumer,
    bureau,
    selectedAccounts,
    enclosureNames = [],
    letterType = "round1",
  } = options;

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clientAddr = [
    consumer.fullName,
    consumer.addressLine1,
    consumer.addressLine2 || "",
    [consumer.city, consumer.state, consumer.zipCode].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join("\n");

  const baseEnclosures = [
    "Copy of Government-Issued Photo ID",
    "Proof of Social Security Number",
    "Signed ScoreShift Authorization Letter",
    ...enclosureNames,
  ];
  if (consumer.isIdentityTheft) {
    if (consumer.ftcReportNumber) {
      baseEnclosures.push(
        `FTC Identity Theft Report (Complaint #: ${consumer.ftcReportNumber})`
      );
    } else {
      baseEnclosures.push("FTC Identity Theft Report (IdentityTheft.gov)");
    }
  }

  const lines: string[] = [];

  // ── Header ─────────────────────────────────────────────────────────────────
  lines.push(dateStr);
  lines.push("");
  lines.push("Sent via USPS Certified Mail — Return Receipt Requested");
  lines.push("");
  lines.push(clientAddr);
  lines.push("");
  lines.push(bureauAddress(bureau));
  lines.push("");
  lines.push("─".repeat(72));
  lines.push(
    letterType === "validation"
      ? "RE: FORMAL DEBT VALIDATION AND VERIFICATION DEMAND"
      : "RE: FORMAL CREDIT REPORT DISPUTE — ROUND 1"
  );
  lines.push("─".repeat(72));
  lines.push("");

  // Consumer ID block
  lines.push("CONSUMER IDENTIFICATION:");
  lines.push(`  Full Name: ${consumer.fullName}`);
  if (consumer.ssnLast4) lines.push(`  SSN (Last 4): ***-**-${consumer.ssnLast4}`);
  if (consumer.dateOfBirth) lines.push(`  Date of Birth: ${consumer.dateOfBirth}`);
  if (consumer.stateIdNumber) lines.push(`  State ID Number: ${consumer.stateIdNumber}`);
  lines.push("");

  lines.push("To Whom It May Concern:");
  lines.push("");
  if (letterType === "validation") {
    lines.push(
      "Pursuant to 15 U.S.C. § 1692g and the Fair Credit Reporting Act, I hereby demand full validation and verification of the following items appearing on my credit report. Unverified information must be deleted within 30 days of receipt of this letter."
    );
  } else {
    lines.push(
      "I am writing to formally dispute inaccurate, incomplete, or unverifiable information currently appearing on my credit file maintained by your bureau. Pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. §§ 1681–1681x, you are required to conduct a reasonable reinvestigation of all disputed items and delete any information that cannot be fully verified within the statutory 30-day period."
    );
  }
  lines.push("");

  // ── Section I — Identity Theft (conditional) ────────────────────────────────
  if (consumer.isIdentityTheft) {
    lines.push("═".repeat(72));
    lines.push("SECTION I — IDENTITY THEFT DECLARATION");
    lines.push("═".repeat(72));
    lines.push("");
    lines.push(
      "I am a victim of identity theft. The accounts listed in Section II were opened fraudulently without my knowledge or authorization. Pursuant to 15 U.S.C. § 1681c-2 (FCRA § 605B), I am requesting that you block the reporting of all information I have identified as resulting from identity theft within 4 business days of receiving this notice."
    );
    lines.push("");
    lines.push("Supporting documentation enclosed:");
    lines.push("  • FTC Identity Theft Report" + (consumer.ftcReportNumber ? ` (Complaint #: ${consumer.ftcReportNumber})` : " (filed at IdentityTheft.gov)"));
    lines.push("  • Government-issued photo identification");
    lines.push("  • Proof of address");
    lines.push("");
    lines.push(
      "Pursuant to § 1681c-2(a), this block must be placed on each of the accounts listed below within 4 business days. Failure to comply may subject your bureau to civil liability under 15 U.S.C. § 1681n (willful noncompliance) or § 1681o (negligent noncompliance)."
    );
    lines.push("");
  }

  // ── Package Contents ────────────────────────────────────────────────────────
  lines.push("PACKAGE CONTENTS:");
  lines.push("─".repeat(72));
  lines.push("  1. This dispute cover letter");
  baseEnclosures.forEach((e, i) => lines.push(`  ${i + 2}. ${e}`));
  lines.push("─".repeat(72));
  lines.push("");

  // ── Section II — Disputed Accounts ─────────────────────────────────────────
  lines.push(
    `${ consumer.isIdentityTheft ? "SECTION II — " : ""}DISPUTED ACCOUNTS (${selectedAccounts.length} total):`
  );
  lines.push("═".repeat(72));
  lines.push("");

  // Generate per-account descriptions in parallel (batch OpenAI calls)
  const accountDescriptions = await Promise.all(
    selectedAccounts.map((acct) =>
      writeAccountViolationParagraph(acct, consumer.isIdentityTheft || false)
    )
  );

  selectedAccounts.forEach((acct, idx) => {
    const desc = accountDescriptions[idx];
    const metro2Violations = acct.violations.filter((v) => v.category === "metro2");
    const fcraViolations = acct.violations.filter((v) => v.category === "fcra");
    const lateTotal =
      (acct.latePayments?.days30 || 0) +
      (acct.latePayments?.days60 || 0) +
      (acct.latePayments?.days90 || 0);

    lines.push(`DISPUTE #${idx + 1}: ${acct.creditor.toUpperCase()}`);
    lines.push("─".repeat(60));
    lines.push("");

    // Account Details
    lines.push("  Account Details:");
    lines.push(`    Creditor:       ${acct.creditor}`);
    lines.push(`    Account Number: ••••${acct.accountNumber.slice(-4)}`);
    lines.push(`    Account Type:   ${acct.accountType || "Unknown"}`);
    lines.push(`    Status:         ${acct.status || "Unknown"}`);
    if (acct.balance && acct.balance !== "0") {
      lines.push(`    Balance:        $${parseFloat(acct.balance).toLocaleString()}`);
    }
    if (acct.dateOfFirstDelinquency) {
      lines.push(`    DOFD:           ${acct.dateOfFirstDelinquency}`);
    }
    if (lateTotal > 0) {
      const lateParts = [];
      if (acct.latePayments?.days30) lateParts.push(`${acct.latePayments.days30}×30-day`);
      if (acct.latePayments?.days60) lateParts.push(`${acct.latePayments.days60}×60-day`);
      if (acct.latePayments?.days90) lateParts.push(`${acct.latePayments.days90}×90-day`);
      lines.push(`    Late Payments:  ${lateParts.join(", ")}`);
    }
    if (acct.bureau || (acct.bureaus && acct.bureaus.length)) {
      const bureauList = acct.bureaus?.join(", ") || acct.bureau || bureau;
      lines.push(`    Reporting Bureau: ${bureauList}`);
    }
    lines.push("");

    // Ground 1 — Identity Theft (conditional)
    if (consumer.isIdentityTheft) {
      lines.push("  Ground 1 — Identity Theft:");
      lines.push(
        `    This account was opened and/or used without my knowledge or authorization. I did not establish any credit relationship with ${acct.creditor}. This entry must be blocked pursuant to 15 U.S.C. § 1681c-2 within 4 business days of receipt of this letter, along with all associated inquiries and collection entries.`
      );
      lines.push("");
    }

    // Ground 2 — Metro 2 Violations
    const groundNum = consumer.isIdentityTheft ? 2 : 1;
    lines.push(`  Ground ${groundNum} — Metro 2 Data Reporting Violations:`);
    if (metro2Violations.length > 0) {
      metro2Violations.forEach((v) => {
        lines.push(`    ▶ ${v.label} (${v.statute || "Metro 2"})`);
      });
      lines.push("");
      lines.push(`    ${desc.ground2}`);
    } else {
      lines.push(`    ${desc.ground2}`);
    }
    lines.push("");

    // Ground 3 — FCRA Statutes
    lines.push(`  Ground ${groundNum + 1} — Applicable FCRA Statutes:`);
    if (fcraViolations.length > 0) {
      fcraViolations.forEach((v) => {
        lines.push(`    ▶ ${v.statute || v.label}`);
      });
      lines.push("");
      lines.push(`    ${desc.ground3}`);
    } else {
      lines.push(`    ${desc.ground3}`);
    }
    lines.push("");

    // Demand
    lines.push("  DEMAND:");
    lines.push(`    ${desc.demand}`);
    lines.push("");
    lines.push("═".repeat(72));
    lines.push("");
  });

  // ── Legal Notice ──────────────────────────────────────────────────────────
  lines.push("LEGAL NOTICE:");
  lines.push("─".repeat(72));
  lines.push(
    "Pursuant to 15 U.S.C. § 1681i, you must complete your reinvestigation and provide written results within 30 days of receipt of this letter (or 45 days if additional information is submitted). Any information that cannot be verified must be promptly deleted. Failure to comply exposes your organization to civil liability under 15 U.S.C. §§ 1681n and 1681o, including actual damages, statutory damages of $100–$1,000 per willful violation, punitive damages, and attorney's fees."
  );
  lines.push("");
  lines.push(
    "All correspondence must be in writing. Do not telephone. Send your written response and updated credit report to the consumer address listed above."
  );
  lines.push("");

  // ── Signature ─────────────────────────────────────────────────────────────
  lines.push("Sincerely,");
  lines.push("");
  lines.push("");
  lines.push(consumer.fullName);
  lines.push(dateStr);
  lines.push("");
  lines.push("Enclosures:");
  lines.push("  1. This dispute cover letter");
  baseEnclosures.forEach((e, i) => lines.push(`  ${i + 2}. ${e}`));
  lines.push("");
  lines.push("─".repeat(72));
  lines.push(
    "CONFIDENTIAL | Send via USPS Certified Mail | ScoreShift Credit Services"
  );
  lines.push("─".repeat(72));

  return {
    bureau,
    letterContent: lines.join("\n"),
    accountCount: selectedAccounts.length,
  };
}
