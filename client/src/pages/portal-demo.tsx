import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/hooks/use-user-context";
import { ArrayTokenContext } from "@/hooks/use-array-token";
import ClientPortal from "@/pages/client-portal";
import type { User } from "@shared/schema";
import type { ScoreShiftProfile } from "@/hooks/use-score-shift-profile";

const DEMO_USER: User = {
  id: 999,
  firstName: "Jordan",
  lastName: "K.",
  email: "jordan.demo@scoreshift.io",
  phone: "(602) 555-0147",
  addressLine1: "742 Evergreen Terrace",
  addressLine2: null,
  city: "Phoenix",
  state: "AZ",
  zipCode: "85001",
  smsOptIn: false,
  dateOfBirth: "1990-03-15",
  ssnLast4: "7890",
  password: "",
  accessLevel: "CLIENT_VIEWER",
  isTestUser: false,
  testingNotes: null,
  passwordResetRequired: false,
  studentLoansEnrolled: false,
  monthlyStudentLoanPayment: null,
  employmentInfo: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: "ACTIVE",
  subscriptionPlan: "PROFESSIONAL",
  subscriptionStartDate: new Date("2025-02-12"),
  subscriptionEndDate: null,
  billingCycle: "monthly",
  caseType: "STANDARD",
  idPhotoPath: null,
  policeReportNumber: null,
  ftcReportNumber: null,
  policeReportPath: null,
  ftcReportPath: null,
  croaDisclosureAccepted: true,
  croaDisclosureTimestamp: new Date("2025-02-12"),
  aiConsentAccepted: true,
  aiConsentTimestamp: new Date("2025-02-12"),
  payPerDeleteRate: "99.00",
  subscriptionTier: "pro",
  accountType: "MANAGED_CLIENT",
  programType: "premium_managed",
  createdAt: new Date("2025-02-12"),
};

const DEMO_PROFILE: ScoreShiftProfile = {
  scores: { experian: 712, equifax: 705, transunion: 718, vantage: null },
  tradelines: [
    {
      creditor: "CHASE BANK",
      accountNumber: "****4821",
      accountType: "Credit Card",
      balance: "$2,140",
      creditLimit: 5000,
      status: "Open",
      dateOpened: "2021-06-01",
      latePayments: { days30: 0, days60: 0, days90: 0 },
      isDerogatory: false,
      violations: [],
    },
    {
      creditor: "WELLS FARGO",
      accountNumber: "****7714",
      accountType: "Auto Loan",
      balance: "$14,820",
      status: "Open",
      dateOpened: "2023-01-15",
      latePayments: { days30: 1, days60: 0, days90: 0 },
      isDerogatory: false,
      violations: [],
    },
  ],
  negativeTradelines: [
    {
      creditor: "MIDLAND FUNDING LLC",
      accountNumber: "****9903",
      accountType: "Collection",
      balance: "$847",
      status: "Collection",
      dateOpened: "2022-09-01",
      dateOfFirstDelinquency: "2022-07-15",
      latePayments: { days30: 2, days60: 1, days90: 0 },
      isDerogatory: true,
      violations: [
        { code: "FCRA_1681e", label: "Inaccurate reporting", statute: "§1681e(b)", category: "accuracy", creditor: "MIDLAND FUNDING LLC", bureau: "Experian" },
      ],
    },
    {
      creditor: "PORTFOLIO RECOVERY",
      accountNumber: "****2281",
      accountType: "Collection",
      balance: "$312",
      status: "Collection",
      dateOpened: "2023-02-01",
      dateOfFirstDelinquency: "2022-12-01",
      latePayments: { days30: 0, days60: 0, days90: 0 },
      isDerogatory: true,
      violations: [],
    },
  ],
  collections: [
    {
      creditor: "MIDLAND FUNDING LLC",
      accountNumber: "****9903",
      accountType: "Collection",
      balance: "$847",
      status: "Collection",
      dateOpened: "2022-09-01",
      latePayments: { days30: 2, days60: 1, days90: 0 },
      isDerogatory: true,
      violations: [],
    },
  ],
  chargeOffs: [],
  publicRecords: [],
  inquiries: [
    { creditor: "CAPITAL ONE", inquiryDate: "2024-11-03", inquiryType: "Hard", suggestedDisputeReason: "No permissible purpose" },
    { creditor: "ALLY FINANCIAL", inquiryDate: "2024-10-18", inquiryType: "Hard" },
  ],
  utilization: {
    overallPercent: 43,
    byAccount: [
      { creditor: "CHASE BANK", balance: 2140, limit: 5000, utilizationPct: 43 },
    ],
  },
  alerts: [
    { type: "derogatory", message: "2 collection accounts negatively impacting your score", severity: "high" },
    { type: "utilization", message: "Credit utilization at 43% — aim for under 30%", severity: "medium" },
  ],
  disputes: [
    {
      id: 1,
      issueId: 10,
      bureau: "Experian",
      status: "in_progress",
      dateSent: "2025-04-02",
      dateDelivered: "2025-04-06",
      expectedResponse: "2025-05-06",
      letterContent: null,
      trackingNumber: "9214890100000000000001",
      creditor: "MIDLAND FUNDING LLC",
      issueType: "collection",
      issueTitle: "Collection Account",
      outcome: null,
    },
    {
      id: 2,
      issueId: 11,
      bureau: "Equifax",
      status: "in_progress",
      dateSent: "2025-04-10",
      dateDelivered: "2025-04-14",
      expectedResponse: "2025-05-14",
      letterContent: null,
      trackingNumber: "9214890100000000000002",
      creditor: "CITI BANK",
      issueType: "late_payment",
      issueTitle: "Late Payment — 30 days",
      outcome: null,
    },
    {
      id: 3,
      issueId: 12,
      bureau: "TransUnion",
      status: "completed",
      dateSent: "2025-03-01",
      dateDelivered: "2025-03-05",
      expectedResponse: "2025-04-05",
      letterContent: null,
      trackingNumber: "9214890100000000000003",
      creditor: "CITI BANK",
      issueType: "collection",
      issueTitle: "Collection Account",
      outcome: "removed",
    },
    {
      id: 4,
      issueId: 13,
      bureau: "Experian",
      status: "completed",
      dateSent: "2025-02-20",
      dateDelivered: "2025-02-24",
      expectedResponse: "2025-03-24",
      letterContent: null,
      trackingNumber: "9214890100000000000004",
      creditor: "PORTFOLIO RECOVERY",
      issueType: "collection",
      issueTitle: "Collection Account",
      outcome: "removed",
    },
  ],
  violations: [
    { code: "FCRA_1681e", label: "Inaccurate collection reporting", statute: "§1681e(b)", category: "accuracy", creditor: "MIDLAND FUNDING LLC", bureau: "Experian" },
  ],
  scoreSimulator: {
    factors: [
      { label: "Payment History", impact: "high", weight: 35 },
      { label: "Credit Utilization", impact: "high", weight: 30 },
      { label: "Credit Age", impact: "medium", weight: 15 },
      { label: "Credit Mix", impact: "low", weight: 10 },
      { label: "New Credit", impact: "low", weight: 10 },
    ],
    projectedGains: [
      { action: "Remove MIDLAND FUNDING LLC collection", estimatedPts: 22 },
      { action: "Lower utilization on Chase to 10%", estimatedPts: 18 },
      { action: "Remove PORTFOLIO RECOVERY collection", estimatedPts: 15 },
      { action: "Add authorized user tradeline", estimatedPts: 11 },
    ],
  },
  planSuggestions: [
    {
      id: "ps-1",
      type: "dispute",
      priority: "high",
      title: "Dispute MIDLAND FUNDING LLC",
      detail: "Collection · Est. +18 pts · Ready to generate",
      bureau: "Experian",
      creditor: "MIDLAND FUNDING LLC",
      status: "in_progress",
      disputeId: 1,
    },
    {
      id: "ps-2",
      type: "paydown",
      priority: "medium",
      title: "Lower utilization on Amex",
      detail: "Pay down $800 · Est. +18 pts",
      status: "open",
    },
    {
      id: "ps-3",
      type: "dispute",
      priority: "medium",
      title: "Remove PORTFOLIO RECOVERY",
      detail: "Collection · Est. +15 pts",
      bureau: "TransUnion",
      creditor: "PORTFOLIO RECOVERY",
      status: "open",
    },
    {
      id: "ps-4",
      type: "inquiry-dispute",
      priority: "low",
      title: "Dispute CAPITAL ONE hard inquiry",
      detail: "No permissible purpose · Est. +8 pts",
      bureau: "Experian",
      creditor: "CAPITAL ONE",
      status: "open",
    },
  ],
  studentLoans: { connected: false },
  subscriptions: {
    connected: false,
    monthlySpend: null,
    annualSpend: null,
    potentialSavings: null,
    subscriptionsFound: null,
  },
  meta: {
    source: "pdf_upload",
    fetchedAt: new Date().toISOString(),
    reportDate: "2025-04-01",
    isLive: false,
  },
};

const DEMO_PACKAGE = {
  id: 1,
  userId: 999,
  packageName: "Credit Repair Pro",
  totalInvestment: "1200.00",
  amountPaid: "600.00",
  paymentPlanType: "monthly",
  caseStatus: "active",
  casesSummary: "4 disputes in progress · Specialist: Sarah K.",
  assignedSpecialist: "Sarah K.",
};

const DEMO_ACTIVITIES = [
  { id: 1, description: "Dispute letter sent to Experian for MIDLAND FUNDING LLC", status: "completed", occurredAt: "2025-04-02T10:00:00Z" },
  { id: 2, description: "Credit report analyzed — 6 derogatory items identified", status: "completed", occurredAt: "2025-03-28T09:30:00Z" },
  { id: 3, description: "Welcome call completed with Specialist Sarah K.", status: "completed", occurredAt: "2025-02-14T14:00:00Z" },
  { id: 4, description: "Enrollment confirmed — Pro Plan activated", status: "completed", occurredAt: "2025-02-12T11:00:00Z" },
];

function DemoDataProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const prevOnboarding = localStorage.getItem("ss_portal_onboarding_done");
    const prevGoal = localStorage.getItem("ss_portal_goal");
    const prevTimeline = localStorage.getItem("ss_portal_timeline");

    localStorage.setItem("ss_portal_onboarding_done", "1");
    localStorage.setItem("ss_portal_goal", "remove-negatives");
    localStorage.setItem("ss_portal_timeline", "6-months");

    qc.setQueryData(["/api/me/score-shift-profile"], DEMO_PROFILE);
    qc.setQueryData(["/api/me/managed-package"], DEMO_PACKAGE);
    qc.setQueryData(["/api/me/case-activities"], DEMO_ACTIVITIES);
    qc.setQueryData(["/api/me/documents"], []);

    setSeeded(true);

    return () => {
      if (prevOnboarding === null) localStorage.removeItem("ss_portal_onboarding_done");
      else localStorage.setItem("ss_portal_onboarding_done", prevOnboarding);

      if (prevGoal === null) localStorage.removeItem("ss_portal_goal");
      else localStorage.setItem("ss_portal_goal", prevGoal);

      if (prevTimeline === null) localStorage.removeItem("ss_portal_timeline");
      else localStorage.setItem("ss_portal_timeline", prevTimeline);
    };
  }, [qc]);

  if (!seeded) return null;
  return <>{children}</>;
}

const DEMO_ARRAY_STATE = {
  token: "",
  appKey: "",
  apiUrl: "",
  restApiUrl: "",
  sandboxMode: false,
  attempted: true,
  isReady: false,
  error: true,
  refresh: async () => {},
};

export default function PortalDemo() {
  return (
    <UserContext.Provider
      value={{
        user: DEMO_USER,
        isAdmin: false,
        isBetaTester: false,
        isClientViewer: true,
        canCreateDisputes: false,
        canAccessAI: false,
        canAccessCreditBuilding: false,
        canAccessEducation: false,
        setCurrentUserId: () => {},
        logout: () => { window.location.href = "/auth"; },
      }}
    >
      <ArrayTokenContext.Provider value={DEMO_ARRAY_STATE}>
        <DemoDataProvider>
          <ClientPortal />
        </DemoDataProvider>
      </ArrayTokenContext.Provider>
    </UserContext.Provider>
  );
}
