/**
 * ScoreShift Concierge Smart Contract — Package definitions + contract text generator.
 */

// ── Package definitions ────────────────────────────────────────────────────────

export type ConciergePackageType = "fast-track" | "rush" | "elite";
export type PaymentOption = "full" | "flexible";

export interface PaymentInstallment {
  label: string;
  amountCents: number;
  dueDate: string; // ISO date string
  paid: boolean;
}

export interface ConciergePackage {
  type: ConciergePackageType;
  name: string;
  tagline: string;
  totalPriceCents: number;
  momentumMonths: number;
  features: string[];
  includesTradeline: boolean;
  fullPayInstallments: (baseDate: Date) => PaymentInstallment[];
  flexPayInstallments: (baseDate: Date) => PaymentInstallment[];
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export const CONCIERGE_PACKAGES: Record<ConciergePackageType, ConciergePackage> = {
  "fast-track": {
    type: "fast-track",
    name: "Fast-Track",
    tagline: "Professional credit repair handled by our team",
    totalPriceCents: 80000,
    momentumMonths: 3,
    includesTradeline: false,
    features: [
      "3-bureau credit analysis and dispute strategy",
      "Professional dispute letter drafting and submission",
      "FCRA and Metro 2 violation identification",
      "Monthly progress reports",
      "Dedicated account specialist",
      "3 months of Momentum plan included after completion",
    ],
    fullPayInstallments: (base) => [
      { label: "Payment in full", amountCents: 80000, dueDate: addDays(base, 0), paid: false },
    ],
    flexPayInstallments: (base) => [
      { label: "First payment — due today", amountCents: 40000, dueDate: addDays(base, 0), paid: false },
      { label: "Second payment — due in 2 weeks", amountCents: 20000, dueDate: addDays(base, 14), paid: false },
      { label: "Third payment — due in 4 weeks", amountCents: 20000, dueDate: addDays(base, 28), paid: false },
    ],
  },

  "rush": {
    type: "rush",
    name: "Fast-Track Rush",
    tagline: "Accelerated service with priority processing",
    totalPriceCents: 150000,
    momentumMonths: 6,
    includesTradeline: false,
    features: [
      "All Fast-Track features",
      "Priority dispute processing",
      "Rapid bureau escalation when needed",
      "Bi-weekly specialist check-ins",
      "6 months of Momentum plan included after completion",
    ],
    fullPayInstallments: (base) => [
      { label: "Payment in full", amountCents: 150000, dueDate: addDays(base, 0), paid: false },
    ],
    flexPayInstallments: (base) => [
      { label: "First payment — due today", amountCents: 75000, dueDate: addDays(base, 0), paid: false },
      { label: "Second payment — due in 2 weeks", amountCents: 37500, dueDate: addDays(base, 14), paid: false },
      { label: "Third payment — due in 4 weeks", amountCents: 37500, dueDate: addDays(base, 28), paid: false },
    ],
  },

  "elite": {
    type: "elite",
    name: "Fast-Track Elite",
    tagline: "Our most comprehensive managed credit solution",
    totalPriceCents: 250000,
    momentumMonths: 12,
    includesTradeline: true,
    features: [
      "All Fast-Track Rush features",
      "Premium Tradeline Network Access",
      "One Authorized User Tradeline included",
      "Credit score simulation and roadmap",
      "Funding readiness coaching",
      "12 months of Momentum plan included after completion",
    ],
    fullPayInstallments: (base) => [
      { label: "Payment in full", amountCents: 250000, dueDate: addDays(base, 0), paid: false },
    ],
    flexPayInstallments: (base) => [
      { label: "First payment — due today", amountCents: 125000, dueDate: addDays(base, 0), paid: false },
      { label: "Second payment — due in 2 weeks", amountCents: 62500, dueDate: addDays(base, 14), paid: false },
      { label: "Third payment — due in 4 weeks", amountCents: 62500, dueDate: addDays(base, 28), paid: false },
    ],
  },
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function formatDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

// ── Contract text generator ────────────────────────────────────────────────────

export interface ContractInput {
  package: ConciergePackage;
  paymentOption: PaymentOption;
  paymentSchedule: PaymentInstallment[];
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientAddress?: string | null;
  clientCity?: string | null;
  clientState?: string | null;
  clientZip?: string | null;
  contractDate: string; // ISO date
}

export function generateContractText(input: ContractInput): string {
  const {
    package: pkg,
    paymentOption,
    paymentSchedule,
    clientFirstName,
    clientLastName,
    clientEmail,
    clientAddress,
    clientCity,
    clientState,
    clientZip,
    contractDate,
  } = input;

  const fullName = `${clientFirstName} ${clientLastName}`;
  const addressLine = [clientAddress, clientCity, clientState, clientZip]
    .filter(Boolean).join(", ") || "On file with ScoreShift";

  const paymentRows = paymentSchedule.map(
    (p, i) => `  ${i + 1}. ${p.label}: ${formatCents(p.amountCents)} (due ${formatDate(p.dueDate)})`
  ).join("\n");

  const tradelineSection = pkg.includesTradeline
    ? `
SECTION 5 — PREMIUM TRADELINE SERVICES

5.1  As part of the Fast-Track Elite package, ScoreShift will provide access to its
     Premium Tradeline Network ("Tradeline Services").

5.2  Client will receive one (1) Authorized User Tradeline placement on a seasoned
     credit account, which may be reflected on Client's credit reports within 30 to
     60 days of placement, subject to bureau reporting schedules.

5.3  ScoreShift makes no guarantee that tradeline placement will result in a specific
     score increase. Results vary based on Client's individual credit profile.

5.4  Client authorizes ScoreShift to provide Client's name and address to the
     tradeline account holder for the purpose of this placement.
`
    : "";

  return `
════════════════════════════════════════════════════════════════════════════════
                    SCORESHIFT CONCIERGE SERVICE AGREEMENT
════════════════════════════════════════════════════════════════════════════════

AGREEMENT DATE:   ${formatDate(contractDate)}
PACKAGE:          ${pkg.name}
TOTAL FEE:        ${formatCents(pkg.totalPriceCents)}
PAYMENT OPTION:   ${paymentOption === "full" ? "Payment in Full" : "Flexible Pay (3 installments)"}

CLIENT INFORMATION
──────────────────────────────────────────────────────────────────────────────
Name:             ${fullName}
Email:            ${clientEmail}
Address:          ${addressLine}


SECTION 1 — PARTIES AND PURPOSE

1.1  This Concierge Service Agreement ("Agreement") is entered into as of the
     Agreement Date above between ScoreShift, LLC ("ScoreShift" or "Company")
     and the individual identified above ("Client").

1.2  ScoreShift is a credit repair organization as defined under the Credit Repair
     Organizations Act (CROA), 15 U.S.C. § 1679 et seq.

1.3  The purpose of this Agreement is to engage ScoreShift to provide managed
     credit repair services as described herein.


SECTION 2 — SERVICES TO BE PROVIDED

2.1  ScoreShift agrees to provide the following services under the ${pkg.name} program:

${pkg.features.map(f => `     • ${f}`).join("\n")}

2.2  Services will commence within three (3) business days following receipt of
     (a) Client's signed Agreement and (b) Client's initial payment.

2.3  ScoreShift will communicate progress updates through the ScoreShift platform,
     accessible via the Client's Concierge Dashboard.

2.4  Dispute letters will be submitted on Client's behalf to Equifax, Experian,
     and TransUnion, as appropriate, via certified mail.
${tradelineSection}

SECTION ${pkg.includesTradeline ? "6" : "5"} — DISPUTE IQ AND PLATFORM ACCESS

${pkg.includesTradeline ? "6" : "5"}.1  During the active Concierge service period, Client's Dispute IQ, Smart
     Letters, and related DIY tools will be locked in read-only mode.

${pkg.includesTradeline ? "6" : "5"}.2  The ScoreShift team manages all dispute activity during active service.
     Client may not submit disputes independently while this Agreement is active.

${pkg.includesTradeline ? "6" : "5"}.3  Client retains full access to the Concierge Dashboard to monitor progress,
     view case activity, track milestones, and access status updates.


SECTION ${pkg.includesTradeline ? "7" : "6"} — FEES AND PAYMENT SCHEDULE

${pkg.includesTradeline ? "7" : "6"}.1  Client agrees to pay the total service fee of ${formatCents(pkg.totalPriceCents)}.

${pkg.includesTradeline ? "7" : "6"}.2  Payment schedule:

${paymentRows}

${pkg.includesTradeline ? "7" : "6"}.3  Failure to remit scheduled payments may result in suspension of services.
     ScoreShift will provide written notice prior to any service suspension.

${pkg.includesTradeline ? "7" : "6"}.4  All payments are non-refundable once services have commenced, except as
     required by applicable law.


SECTION ${pkg.includesTradeline ? "8" : "7"} — MOMENTUM PLAN UPON COMPLETION

${pkg.includesTradeline ? "8" : "7"}.1  Upon successful completion of Concierge services, ScoreShift will
     automatically activate ${pkg.momentumMonths} month${pkg.momentumMonths !== 1 ? "s" : ""} of the Momentum self-service plan at
     no additional charge.

${pkg.includesTradeline ? "8" : "7"}.2  Upon activation of the Momentum plan:
     • Dispute IQ unlocks
     • Smart Letters unlock
     • All Momentum-tier platform tools become available
     • Client transitions to the self-service experience

${pkg.includesTradeline ? "8" : "7"}.3  Client's account will continue under the same login credentials. No new
     account creation is required.


SECTION ${pkg.includesTradeline ? "9" : "8"} — CLIENT RESPONSIBILITIES

${pkg.includesTradeline ? "9" : "8"}.1  Client agrees to:
     (a) Provide accurate and complete personal information;
     (b) Upload requested identification and documentation promptly;
     (c) Respond to ScoreShift communications within five (5) business days;
     (d) Continue making on-time payments to existing creditors;
     (e) Avoid opening new credit accounts without consulting ScoreShift during
         the active service period;
     (f) Notify ScoreShift immediately of any direct creditor or bureau communications.

${pkg.includesTradeline ? "9" : "8"}.2  Client authorizes ScoreShift to:
     (a) Review Client's credit reports from all three major bureaus;
     (b) Contact credit bureaus on Client's behalf;
     (c) Submit written disputes and correspondence as Client's authorized agent;
     (d) Access and use Client's personal data solely for the purpose of credit repair.


SECTION ${pkg.includesTradeline ? "10" : "9"} — NO GUARANTEE DISCLAIMER

${pkg.includesTradeline ? "10" : "9"}.1  CREDIT REPAIR RESULTS CANNOT BE GUARANTEED. ScoreShift makes no
     representation or warranty that any specific credit score improvement will
     result from services rendered under this Agreement.

${pkg.includesTradeline ? "10" : "9"}.2  Under the Credit Repair Organizations Act (15 U.S.C. § 1679c), ScoreShift
     discloses that: (a) you have a right to dispute inaccurate information in
     your credit report; (b) credit repair organizations cannot remove accurate,
     timely information; (c) you may review your credit report for free.

${pkg.includesTradeline ? "10" : "9"}.3  ScoreShift cannot and will not (i) remove accurate negative information
     before its legal expiration date; (ii) create a new credit identity; or
     (iii) advise you to misrepresent your identity or credit history.


SECTION ${pkg.includesTradeline ? "11" : "10"} — TERM AND TERMINATION

${pkg.includesTradeline ? "11" : "10"}.1  This Agreement commences on the date of execution and continues until
     Concierge services are completed or the Agreement is otherwise terminated.

${pkg.includesTradeline ? "11" : "10"}.2  Client may cancel within three (3) business days of signing without
     obligation under CROA. After three days, cancellation is subject to
     Section ${pkg.includesTradeline ? "7" : "6"}.4 (payment terms) of this Agreement.

${pkg.includesTradeline ? "11" : "10"}.3  ScoreShift may terminate this Agreement if Client fails to cooperate,
     provides false information, or misses two (2) or more scheduled payments.


SECTION ${pkg.includesTradeline ? "12" : "11"} — ELECTRONIC SIGNATURE CONSENT

${pkg.includesTradeline ? "12" : "11"}.1  By signing below, Client consents to the use of electronic signatures
     pursuant to the Electronic Signatures in Global and National Commerce Act
     (E-SIGN Act), 15 U.S.C. § 7001 et seq.

${pkg.includesTradeline ? "12" : "11"}.2  Client agrees that the electronic signature applied herein carries the same
     legal weight as a handwritten signature and constitutes a valid, binding
     agreement.

${pkg.includesTradeline ? "12" : "11"}.3  Client may request a physical copy of this signed Agreement at any time
     by contacting support@scoreshift.io.


SECTION ${pkg.includesTradeline ? "13" : "12"} — GENERAL PROVISIONS

${pkg.includesTradeline ? "13" : "12"}.1  Governing Law. This Agreement is governed by the laws of the state in which
     ScoreShift is organized, without regard to conflicts of law principles.

${pkg.includesTradeline ? "13" : "12"}.2  Entire Agreement. This Agreement constitutes the entire agreement between the
     parties and supersedes all prior negotiations, representations, or agreements.

${pkg.includesTradeline ? "13" : "12"}.3  Severability. If any provision is found invalid, the remaining provisions
     shall remain in full force and effect.

${pkg.includesTradeline ? "13" : "12"}.4  Modifications. No modification of this Agreement is valid unless made in
     writing and signed by both parties.

${pkg.includesTradeline ? "13" : "12"}.5  Contact. ScoreShift, LLC | support@scoreshift.io


════════════════════════════════════════════════════════════════════════════════
                              SIGNATURE BLOCK
════════════════════════════════════════════════════════════════════════════════

CLIENT SIGNATURE
──────────────────────────────────────────────────────────────────────────────
By signing below, Client acknowledges having read, understood, and agreed to
all terms and conditions set forth in this Agreement.

Printed Name:  _______________________________________________

Signature:     _______________________________________________

Date:          _______________________________________________

Email:         ${clientEmail}


SCORESHIFT CONCIERGE
──────────────────────────────────────────────────────────────────────────────
Authorized Representative:  ScoreShift, LLC

Signature:     _______________________________________________

Date:          _______________________________________________

════════════════════════════════════════════════════════════════════════════════
                             [END OF AGREEMENT]
════════════════════════════════════════════════════════════════════════════════
`.trim();
}
