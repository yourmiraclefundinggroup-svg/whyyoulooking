import type { User, CreditReportAccount, CreditReportCollection, CreditReportInquiry, CreditReportPublicRecord } from "@shared/schema";

export type PacketItemType = "account" | "inquiry" | "collection" | "public_record";

export interface PacketItem {
  type: PacketItemType;
  creditorName: string;
  accountNumber?: string;
  balance?: number;
  status?: string;
  dateOpened?: string;
  dateReported?: string;
  paymentStatus?: string;
  latePayments?: { days30?: number; days60?: number; days90?: number };
  derogatoryFlags?: string[];
  remarks?: string;
  inquiryDate?: string;
  originalCreditor?: string;
  amount?: number;
}

export interface PacketOptions {
  client: User;
  bureau: "EXPERIAN" | "EQUIFAX" | "TRANSUNION";
  letterType: "round1" | "round2" | "validation" | "goodwill" | "inquiry" | "fraud";
  items: PacketItem[];
  enclosures?: string[];
  adminName?: string;
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

function fcraCitations(item: PacketItem): string[] {
  const citations: string[] = [];

  if (item.type === "collection" || item.status?.toLowerCase().includes("collection")) {
    citations.push("15 U.S.C. § 1681e(b) — Accuracy of consumer reports");
    citations.push("15 U.S.C. § 1681i — Procedure in case of disputed accuracy");
    citations.push("15 U.S.C. § 1681c(a)(4) — Prohibited information (accounts placed for collection)");
    citations.push("15 U.S.C. § 1681s-2(b) — Duties of furnishers of information upon notice of dispute");
  } else if (item.type === "inquiry") {
    citations.push("15 U.S.C. § 1681b(a) — Permissible purposes of consumer reports");
    citations.push("15 U.S.C. § 1681n — Civil liability for willful noncompliance");
    citations.push("15 U.S.C. § 1681o — Civil liability for negligent noncompliance");
  } else if (item.type === "public_record") {
    citations.push("15 U.S.C. § 1681e(b) — Accuracy of consumer reports");
    citations.push("15 U.S.C. § 1681i — Procedure in case of disputed accuracy");
    citations.push("15 U.S.C. § 1681c(a)(5) — Adverse items of information (7-year limit)");
  } else {
    // account — check for late payments, charge-offs, etc.
    if (item.latePayments && (item.latePayments.days30 || item.latePayments.days60 || item.latePayments.days90)) {
      citations.push("15 U.S.C. § 1681s-2(b) — Duties of furnishers upon notice of dispute");
      citations.push("15 U.S.C. § 1681i(a) — Reinvestigation of disputed information");
    }
    if (item.status?.toLowerCase().includes("charge") || item.status?.toLowerCase().includes("off")) {
      citations.push("15 U.S.C. § 1681e(b) — Accuracy of consumer reports");
      citations.push("15 U.S.C. § 1681c(a)(4) — Prohibited reporting of charged-off accounts beyond 7 years");
    }
    citations.push("15 U.S.C. § 1681i — Procedure in case of disputed accuracy");
    if (!citations.some(c => c.includes("1681e"))) {
      citations.push("15 U.S.C. § 1681e(b) — Accuracy of consumer reports");
    }
  }
  return citations;
}

function metro2Violations(item: PacketItem): string[] {
  const violations: string[] = [];

  if (item.type === "account" || item.type === "collection") {
    if (!item.dateReported) violations.push("Field DA (Date of First Delinquency): Missing or not reported per Metro 2 standard");
    if (item.latePayments) {
      if (item.latePayments.days30 || item.latePayments.days60 || item.latePayments.days90) {
        violations.push("Field K4 (Payment Pattern): Reported delinquency data may be inconsistent with furnisher records");
      }
    }
    if (item.balance !== undefined && item.balance < 0) {
      violations.push("Segment 18 (Current Balance): Negative balance reported — data integrity violation");
    }
    if (!item.status) {
      violations.push("ACCT_STATUS: Account status code missing or indeterminate — violates Metro 2 data accuracy standards");
    }
    if (item.remarks) {
      violations.push("Portfolio Type & ECOA Code: Remarks field may contain conflicting or unverifiable data");
    }
  }

  if (item.type === "inquiry") {
    violations.push("Inquiry Segment: Creditor must maintain documentation of permissible purpose under Metro 2 compliance rules");
  }

  return violations;
}

function formatCurrency(cents?: number): string {
  if (cents === undefined || cents === null) return "N/A";
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function itemDemands(item: PacketItem, index: number): string[] {
  const num = (n: number) => `${index + 1}.${n}`;
  const demands: string[] = [];

  if (item.type === "inquiry") {
    demands.push(`${num(1)} Provide documentation proving permissible purpose for this inquiry.`);
    demands.push(`${num(2)} Remove this inquiry from my credit file if permissible purpose cannot be verified.`);
    demands.push(`${num(3)} Identify the specific FCRA-permissible purpose code used to authorize this inquiry.`);
  } else if (item.type === "collection") {
    demands.push(`${num(1)} Provide full verification of this debt, including the original signed agreement.`);
    demands.push(`${num(2)} Provide the date of first delinquency on the original account.`);
    demands.push(`${num(3)} Confirm the collection agency is licensed to collect in my state.`);
    demands.push(`${num(4)} Delete this tradeline if verification cannot be completed within 30 days per § 1681i.`);
  } else if (item.type === "public_record") {
    demands.push(`${num(1)} Provide certified documentation from the court confirming this record's accuracy and current status.`);
    demands.push(`${num(2)} Verify the reporting period does not exceed statutory limits under § 1681c.`);
    demands.push(`${num(3)} Remove this item if it cannot be verified with primary source documentation.`);
  } else {
    demands.push(`${num(1)} Conduct a thorough reinvestigation of all reported data for this account.`);
    demands.push(`${num(2)} Provide the name, address, and telephone number of the original creditor.`);
    demands.push(`${num(3)} Provide the complete payment history showing the basis for any negative data.`);
    if (item.latePayments) {
      demands.push(`${num(4)} Remove or correct any inaccurately reported late payment history.`);
    }
    demands.push(`${num(demands.length + 1)} Delete this account if accuracy cannot be fully verified within 30 days per § 1681i(a)(1).`);
  }

  return demands;
}

function bureauAddress(bureau: string): string {
  return (BUREAU_ADDRESSES[bureau] || BUREAU_ADDRESSES["EXPERIAN"]).join("\n");
}

function letterTypeContext(type: string): { title: string; intro: string } {
  switch (type) {
    case "round2":
      return {
        title: "ROUND 2 DISPUTE — METHOD OF VERIFICATION DEMAND",
        intro: "I am writing to formally demand the method of verification used to re-investigate my previously disputed items. Pursuant to 15 U.S.C. § 1681i(a)(7), you are required to provide me with the method of verification used for each item I disputed. Your previous response was inadequate. I am escalating this dispute and repeating my demand for deletion or correction.",
      };
    case "validation":
      return {
        title: "DEBT VALIDATION AND VERIFICATION DEMAND",
        intro: "Pursuant to 15 U.S.C. § 1692g and the Fair Credit Reporting Act, I hereby demand full validation and verification of the following items appearing on my credit report. Unverified information must be deleted within 30 days of receipt of this letter.",
      };
    case "goodwill":
      return {
        title: "GOODWILL ADJUSTMENT REQUEST",
        intro: "I am writing to respectfully request a goodwill adjustment to remove negative information from my credit file. I have been a responsible consumer and any negative reporting was due to circumstances beyond my control. I respectfully request your consideration in removing this information.",
      };
    case "inquiry":
      return {
        title: "UNAUTHORIZED INQUIRY REMOVAL REQUEST",
        intro: "I am writing to dispute unauthorized hard inquiries appearing on my credit file. Each inquiry listed below was made without my knowledge or written consent. Pursuant to 15 U.S.C. § 1681b, credit inquiries must have permissible purpose. I demand immediate removal of all unauthorized inquiries.",
      };
    case "fraud":
      return {
        title: "IDENTITY THEFT DISPUTE — FRAUD REMOVAL REQUEST",
        intro: "I am writing to dispute fraudulent accounts and inquiries resulting from identity theft. Pursuant to 15 U.S.C. § 1681c-2, you are required to block the reporting of information I identify as resulting from identity theft within 4 business days of receiving this notice. Enclosed is a copy of my FTC Identity Theft Report.",
      };
    default:
      return {
        title: "FORMAL CREDIT REPORT DISPUTE — ROUND 1",
        intro: "I am writing to formally dispute inaccurate, incomplete, or unverifiable information appearing on my credit report. Pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. §§ 1681–1681x, you are required to conduct a reasonable reinvestigation of all disputed items and delete any information that cannot be fully verified.",
      };
  }
}

export function generateProfessionalDisputePacket(options: PacketOptions): string {
  const { client, bureau, letterType, items, enclosures = [], adminName } = options;
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const ctx = letterTypeContext(letterType);

  const clientAddr = [
    `${client.firstName} ${client.lastName}`,
    client.addressLine1 || "",
    client.addressLine2 || "",
    [client.city, client.state, client.zipCode].filter(Boolean).join(", "),
  ].filter(Boolean).join("\n");

  const ssn = client.ssnLast4 ? `SSN (Last 4): ***-**-${client.ssnLast4}` : "";
  const dob = client.dateOfBirth ? `Date of Birth: ${client.dateOfBirth}` : "";

  const lines: string[] = [];

  // ── Header ──────────────────────────────────────────────────────────
  lines.push(dateStr);
  lines.push("");
  lines.push(clientAddr);
  lines.push("");
  lines.push(bureauAddress(bureau));
  lines.push("");
  lines.push("─".repeat(72));
  lines.push(`RE: FORMAL CREDIT DISPUTE — ${ctx.title}`);
  lines.push("─".repeat(72));
  lines.push("");

  // Identity verification
  if (ssn || dob) {
    lines.push("CONSUMER IDENTIFICATION:");
    if (ssn) lines.push(`  ${ssn}`);
    if (dob) lines.push(`  ${dob}`);
    lines.push("");
  }

  lines.push("To Whom It May Concern:");
  lines.push("");
  lines.push(ctx.intro);
  lines.push("");

  // ── Contents Table ──────────────────────────────────────────────────
  lines.push("PACKAGE CONTENTS:");
  lines.push("─".repeat(72));
  const packageContents = [
    "1. Dispute Cover Letter (this document)",
    "2. Copy of Government-Issued Photo ID",
    "3. Proof of Address",
    ...enclosures.map((e, i) => `${i + 4}. ${e}`),
  ];
  packageContents.forEach(item => lines.push(`  ${item}`));
  lines.push("─".repeat(72));
  lines.push("");

  // ── Per-item disputes ───────────────────────────────────────────────
  lines.push(`DISPUTED ITEMS (${items.length} total):`);
  lines.push("═".repeat(72));
  lines.push("");

  items.forEach((item, idx) => {
    lines.push(`DISPUTE #${idx + 1}: ${item.creditorName.toUpperCase()}`);
    lines.push("─".repeat(60));

    // Account details
    lines.push("Account Details:");
    if (item.accountNumber) lines.push(`  Account Number: ${item.accountNumber}`);
    if (item.dateOpened) lines.push(`  Date Opened: ${item.dateOpened}`);
    if (item.dateReported) lines.push(`  Date Reported: ${item.dateReported}`);
    if (item.balance !== undefined) lines.push(`  Balance: ${formatCurrency(item.balance)}`);
    if (item.status) lines.push(`  Status: ${item.status}`);
    if (item.paymentStatus) lines.push(`  Payment Status: ${item.paymentStatus}`);
    if (item.remarks) lines.push(`  Remarks: ${item.remarks}`);
    if (item.latePayments) {
      const lp = item.latePayments;
      const parts = [];
      if (lp.days30) parts.push(`30-day: ${lp.days30}`);
      if (lp.days60) parts.push(`60-day: ${lp.days60}`);
      if (lp.days90) parts.push(`90-day: ${lp.days90}`);
      if (parts.length) lines.push(`  Late Payments: ${parts.join(" | ")}`);
    }
    if (item.derogatoryFlags?.length) {
      lines.push(`  Derogatory Flags: ${item.derogatoryFlags.join(", ")}`);
    }
    lines.push("");

    // FCRA citations
    const citations = fcraCitations(item);
    if (citations.length) {
      lines.push("Applicable FCRA Statutes:");
      citations.forEach(c => lines.push(`  • ${c}`));
      lines.push("");
    }

    // Metro 2 violations
    const m2 = metro2Violations(item);
    if (m2.length) {
      lines.push("Metro 2 Data Reporting Violations:");
      m2.forEach(v => lines.push(`  ⚠ ${v}`));
      lines.push("");
    }

    // Demands
    const demands = itemDemands(item, idx);
    lines.push("Specific Demands:");
    demands.forEach(d => lines.push(`  ${d}`));
    lines.push("");
    lines.push("═".repeat(72));
    lines.push("");
  });

  // ── Legal Notice ────────────────────────────────────────────────────
  lines.push("LEGAL NOTICE:");
  lines.push("─".repeat(72));
  lines.push(
    "Pursuant to the FCRA, 15 U.S.C. § 1681i, you must complete your reinvestigation and provide written results within 30 days of receipt of this letter (or 45 days if the consumer furnishes additional information during the 30-day period). Any information that cannot be verified must be deleted. Failure to comply exposes your organization to civil liability under 15 U.S.C. §§ 1681n and 1681o, including actual damages, statutory damages of $100–$1,000 per violation, punitive damages, and attorney's fees."
  );
  lines.push("");
  lines.push(
    "Please send your written response and updated credit report to the address listed above. Do not telephone. All correspondence must be in writing."
  );
  lines.push("");

  // ── Signature ───────────────────────────────────────────────────────
  lines.push("Sincerely,");
  lines.push("");
  lines.push("");
  lines.push(`${client.firstName} ${client.lastName}`);
  if (client.phone) lines.push(client.phone);
  lines.push(dateStr);
  lines.push("");
  lines.push("Enclosures:");
  packageContents.forEach(pc => lines.push(`  ${pc}`));

  return lines.join("\n");
}
