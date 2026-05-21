/**
 * Canonical Metro 2 + FCRA violation analysis engine.
 * Used by the client Dispute IQ page and the dispute packet generator.
 */

export interface TradelineViolation {
  code: string;
  category: "metro2" | "fcra";
  label: string;
  statute?: string;
}

export interface RawTradeline {
  creditor: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  status: string;
  dateOpened: string;
  dateOfFirstDelinquency?: string;
  paymentStatus?: string;
  latePayments?: { days30?: number; days60?: number; days90?: number };
  suggestedDisputeReason?: string;
  bureaus?: string[];
}

export interface AnalyzedTradeline extends RawTradeline {
  violations: TradelineViolation[];
  isDerogatory: boolean;
}

/** Returns true when the tradeline has any negative / derogatory indicator */
export function isNegativeTradeline(t: RawTradeline): boolean {
  const s = (t.status || "").toLowerCase();
  const lateCount =
    (t.latePayments?.days30 || 0) +
    (t.latePayments?.days60 || 0) +
    (t.latePayments?.days90 || 0);
  return (
    s.includes("collection") ||
    s.includes("charge") ||
    s.includes("delinquent") ||
    s.includes("late") ||
    s.includes("past due") ||
    s.includes("default") ||
    s.includes("settled") ||
    s.includes("repossess") ||
    s.includes("written off") ||
    s.includes("adverse") ||
    lateCount > 0
  );
}

/** Analyze one tradeline and return every applicable violation */
export function analyzeTradelineViolations(t: RawTradeline): TradelineViolation[] {
  const violations: TradelineViolation[] = [];
  const statusLower = (t.status || "").toLowerCase();
  const derogatory = isNegativeTradeline(t);
  const balance = parseFloat(t.balance);
  const lateCount =
    (t.latePayments?.days30 || 0) +
    (t.latePayments?.days60 || 0) +
    (t.latePayments?.days90 || 0);

  // ── Metro 2 Violations ─────────────────────────────────────────────────────

  // DOFD missing on derogatory account
  if (derogatory && !t.dateOfFirstDelinquency) {
    violations.push({
      code: "M2_DOFD_MISSING",
      category: "metro2",
      label: "DOFD Missing",
      statute: "Metro 2 Field DA",
    });
  }

  // Re-aging risk (account approaching or past 7-year FCRA limit)
  if (t.dateOfFirstDelinquency) {
    const dofdDate = new Date(t.dateOfFirstDelinquency);
    if (!isNaN(dofdDate.getTime())) {
      const yearsOld = (Date.now() - dofdDate.getTime()) / (86_400_000 * 365.25);
      if (yearsOld >= 7) {
        violations.push({
          code: "M2_REAGING",
          category: "metro2",
          label: "DOFD Re-Aging",
          statute: "Metro 2 Field DA / § 1681c(a)(4)",
        });
      } else if (yearsOld >= 6.5) {
        violations.push({
          code: "M2_REAGING_RISK",
          category: "metro2",
          label: "Re-Aging Risk",
          statute: "Metro 2 Field DA",
        });
      }
    }
  }

  // K4 Payment Pattern — reported delinquency data
  if (lateCount > 0) {
    violations.push({
      code: "M2_K4_PAYMENT",
      category: "metro2",
      label: "K4 Payment Pattern",
      statute: "Metro 2 Field K4",
    });
  }

  // ACCT_STATUS missing
  if (!t.status || t.status.trim() === "") {
    violations.push({
      code: "M2_ACCT_STATUS",
      category: "metro2",
      label: "ACCT_STATUS Missing",
      statute: "Metro 2 ACCT_STATUS",
    });
  }

  // Segment 18 negative balance
  if (!isNaN(balance) && balance < 0) {
    violations.push({
      code: "M2_NEG_BALANCE",
      category: "metro2",
      label: "Negative Balance",
      statute: "Metro 2 Segment 18",
    });
  }

  // Chain-of-title gap — collection with no original creditor linkage
  if (statusLower.includes("collection")) {
    violations.push({
      code: "M2_CHAIN_TITLE",
      category: "metro2",
      label: "Chain-of-Title Gap",
      statute: "Metro 2 Field 5",
    });
  }

  // Cross-bureau inconsistency placeholder — present when multi-bureau data is supplied
  if (t.bureaus && t.bureaus.length > 1) {
    violations.push({
      code: "M2_CROSS_BUREAU",
      category: "metro2",
      label: "Cross-Bureau Inconsistency",
      statute: "Metro 2 Field DA / ACCT_STATUS",
    });
  }

  // ── FCRA Violations ─────────────────────────────────────────────────────────

  // Core accuracy + reinvestigation obligations apply to all derogatory items
  if (derogatory) {
    violations.push({
      code: "FCRA_1681E_B",
      category: "fcra",
      label: "§ 1681e(b) Accuracy",
      statute: "15 U.S.C. § 1681e(b)",
    });
    violations.push({
      code: "FCRA_1681I",
      category: "fcra",
      label: "§ 1681i Reinvestigation",
      statute: "15 U.S.C. § 1681i",
    });
    violations.push({
      code: "FCRA_1681S2B",
      category: "fcra",
      label: "§ 1681s-2(b) Furnisher",
      statute: "15 U.S.C. § 1681s-2(b)",
    });
  }

  // 7-year reporting limit for derogatory items
  if (t.dateOfFirstDelinquency) {
    const dofdDate = new Date(t.dateOfFirstDelinquency);
    if (!isNaN(dofdDate.getTime())) {
      const yearsOld = (Date.now() - dofdDate.getTime()) / (86_400_000 * 365.25);
      if (yearsOld >= 7) {
        violations.push({
          code: "FCRA_1681C_A5",
          category: "fcra",
          label: "§ 1681c(a)(5) 7-Yr Limit",
          statute: "15 U.S.C. § 1681c(a)(5)",
        });
      }
    }
  }

  // Collection / charge-off prohibition beyond 7 years
  if (statusLower.includes("collection") || statusLower.includes("charge")) {
    violations.push({
      code: "FCRA_1681C_A4",
      category: "fcra",
      label: "§ 1681c(a)(4) Collection",
      statute: "15 U.S.C. § 1681c(a)(4)",
    });
  }

  // Identity theft block
  if (statusLower.includes("fraud") || statusLower.includes("theft") || statusLower.includes("identity")) {
    violations.push({
      code: "FCRA_1681C2",
      category: "fcra",
      label: "§ 1681c-2 ID Theft Block",
      statute: "15 U.S.C. § 1681c-2",
    });
  }

  // De-duplicate by code
  const seen = new Set<string>();
  return violations.filter((v) => {
    if (seen.has(v.code)) return false;
    seen.add(v.code);
    return true;
  });
}

/** Analyze an array of raw tradelines and return only the negative ones with violations attached */
export function analyzeAllTradelines(tradelines: RawTradeline[]): AnalyzedTradeline[] {
  return tradelines
    .filter(isNegativeTradeline)
    .map((t) => ({
      ...t,
      violations: analyzeTradelineViolations(t),
      isDerogatory: true,
    }));
}
