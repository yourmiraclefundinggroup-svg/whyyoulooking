/**
 * ScoreShift Client Dashboard — Production-ready, investor-demo quality.
 *
 * Sections:
 *  1. Header/Nav          — DashboardHeader
 *  2. Credit Score Hero   — ScoreHero (3 bureaus, sparkline, score bar)
 *  3. Dispute Tracker     — DisputeTracker (step progress, bureau pills)
 *  4. Items Removed       — ItemsRemoved (wins card)
 *  5. USPS Tracking       — USPSTracking (automated mail tracking + Lob prep)
 *  6. Document Upload     — DocumentUpload (drag-and-drop)
 *  7. Activity Feed       — ActivityFeed (team timeline)
 *  8. Action Center       — ActionCenter (next steps / caught up)
 *  9. Loan Readiness      — LoanReadiness (ScoreShift exclusive — CRC cannot do this)
 * 10. Support Card        — SupportCard
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useUserContext } from "@/hooks/use-user-context";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ScoreHero } from "@/components/dashboard/score-hero";
import { DisputeTracker } from "@/components/dashboard/dispute-tracker";
import { ItemsRemoved } from "@/components/dashboard/items-removed";
import { USPSTracking } from "@/components/dashboard/usps-tracking";
import { DocumentUpload } from "@/components/dashboard/document-upload";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ActionCenter } from "@/components/dashboard/action-center";
import { LoanReadiness } from "@/components/dashboard/loan-readiness";
import { SupportCard } from "@/components/dashboard/support-card";
import { CreditCoachAI } from "@/components/dashboard/credit-coach-ai";
import { VictoryRoom } from "@/components/dashboard/victory-room";
import { ScoreMap } from "@/components/dashboard/score-map";
import { ReferralEngine } from "@/components/dashboard/referral-engine";
import { ArrayWelcomeBanner } from "@/components/dashboard/array-welcome-banner";

import type { ScoreData } from "@/components/dashboard/score-hero";
import type { DisputeTrackerData } from "@/components/dashboard/dispute-tracker";
import type { RemovedItem } from "@/components/dashboard/items-removed";
import type { TrackingEntry } from "@/components/dashboard/usps-tracking";
import type { UploadedFile } from "@/components/dashboard/document-upload";
import type { ActivityEvent } from "@/components/dashboard/activity-feed";
import type { ActionItem } from "@/components/dashboard/action-center";
import type { LoanReadinessData } from "@/components/dashboard/loan-readiness";

// ─── Mock Data ─────────────────────────────────────────────────────────────
// Used as fallback when real API data is unavailable.
// Matches the realistic seed data from the product brief.

const mockClient = {
  name: "Marcus Johnson",
  email: "marcus.j@gmail.com",
  scores: { experian: 634, equifax: 621, transunion: 628 },
  scoreChange: { experian: +42, equifax: +38, transunion: +35 },
  scoreHistory: [572, 581, 595, 610, 621, 634], // last 6 months
  lastUpdated: "March 20, 2026",
  currentRound: 2,
  totalRounds: 3,
  itemsInDispute: 14,
  itemsRemoved: 4,
  nextUpdate: "April 15, 2026",
  loanReadiness: 68,
  targetScore: 680,
  disputeStage: 3, // 0-indexed — "Awaiting Response"
};

// Score hero data
const mockScoreData: ScoreData = {
  scores: mockClient.scores,
  scoreChange: mockClient.scoreChange,
  scoreHistory: mockClient.scoreHistory,
  lastUpdated: mockClient.lastUpdated,
};

// Dispute tracker data
const mockDisputeData: DisputeTrackerData = {
  disputeStage: mockClient.disputeStage,
  currentRound: mockClient.currentRound,
  totalRounds: mockClient.totalRounds,
  itemsInDispute: mockClient.itemsInDispute,
  nextUpdate: mockClient.nextUpdate,
};

// Removed items
const mockRemovedItems: RemovedItem[] = [
  {
    type: "Collection",
    creditor: "Portfolio Recovery",
    detail: "$1,247 balance — Fully removed from all 3 bureaus",
    removedDate: "Mar 20, 2026",
  },
  {
    type: "Late Payment",
    creditor: "Capital One",
    detail: "Feb 2023 — 30-day late mark deleted",
    removedDate: "Mar 18, 2026",
  },
  {
    type: "Collection",
    creditor: "Midland Credit",
    detail: "$892 — Removed from Experian & Equifax",
    removedDate: "Mar 12, 2026",
  },
  {
    type: "Charge-Off",
    creditor: "Synchrony Bank",
    detail: "$1,430 — Removed from TransUnion",
    removedDate: "Mar 10, 2026",
  },
];

// USPS tracking — loaded from API, no hardcoded entries

// Uploaded documents
const mockUploadedFiles: UploadedFile[] = [
  {
    id: "f1",
    name: "Equifax_Response_Letter_March2026.pdf",
    uploadedAt: "Mar 21, 2026",
    type: "pdf",
    category: "Bureau Letter",
    status: "received",
  },
  {
    id: "f2",
    name: "Drivers_License_Front.jpg",
    uploadedAt: "Jan 10, 2026",
    type: "jpg",
    category: "Identity",
    status: "reviewed",
  },
];

// Activity feed events
const mockActivityEvents: ActivityEvent[] = [
  {
    id: "a1",
    type: "action",
    icon: "✍️",
    message: "Round 2 letters being prepared by our dispute specialists",
    date: "Mar 22",
  },
  {
    id: "a2",
    type: "response",
    icon: "📨",
    message: "Equifax response received — 2 items removed successfully",
    date: "Mar 20",
  },
  {
    id: "a3",
    type: "win",
    icon: "🎉",
    message: "Portfolio Recovery collection removed — $1,247 gone!",
    date: "Mar 20",
  },
  {
    id: "a4",
    type: "mail",
    icon: "📬",
    message: "Dispute letters mailed to all 3 bureaus via certified mail",
    date: "Mar 18",
  },
  {
    id: "a5",
    type: "win",
    icon: "✅",
    message: "Capital One late payment removed from Experian",
    date: "Mar 18",
  },
  {
    id: "a6",
    type: "action",
    icon: "🔍",
    message: "Credit report analyzed — 14 disputable items identified by AI",
    date: "Feb 28",
  },
];

// Action center items
const mockActions: ActionItem[] = [
  {
    id: "act1",
    priority: "primary",
    message: "Upload your Equifax response letter to keep Round 2 on track",
    ctaLabel: "Upload Now",
    ctaAction: () => {
      document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
    },
  },
];

// Loan readiness data
const mockLoanData: LoanReadinessData = {
  loanReadiness: mockClient.loanReadiness,
  currentScore: Math.round(
    (mockClient.scores.experian + mockClient.scores.equifax + mockClient.scores.transunion) / 3
  ),
  targetScore: mockClient.targetScore,
};

// ─── Enrollment types ────────────────────────────────────────────────────────

interface ArrayEnrollmentData {
  enrolled: boolean;
  arrayUserId: string | null;
  productCodes: string[];
  enrolledAt: string | null;
  welcomeShown: boolean;
}

// ─── Dashboard Component ────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useUserContext();
  const [showVictory, setShowVictory] = useState(false);
  const [realCreditReport, setRealCreditReport] = useState<any>(null);
  const [realIssues, setRealIssues] = useState<any[]>([]);
  const [realDisputes, setRealDisputes] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { data: arrayEnrollment } = useQuery<ArrayEnrollmentData>({
    queryKey: ["/api/array/enrollment"],
    enabled: !!user,
    retry: false,
  });

  // Live USPS tracking from Lob-sent letters
  const { data: trackingEntries = [] } = useQuery<TrackingEntry[]>({
    queryKey: ["/api/dispute-letters/tracking"],
    enabled: !!user,
    retry: false,
  });

  // Script is loaded at app level; track readiness by polling custom elements registry
  const [arrayScriptReady, setArrayScriptReady] = useState(false);
  useEffect(() => {
    if (arrayScriptReady) return;
    const check = () => { if (customElements.get("array-credit-overview")) setArrayScriptReady(true); };
    check();
    const id = setInterval(check, 200);
    return () => clearInterval(id);
  }, [arrayScriptReady]);

  // isDemoMode: URL param ?demo=true OR user is a test account
  const isDemoMode =
    new URLSearchParams(window.location.search).get("demo") === "true" ||
    user?.isTestUser === true ||
    user?.email === "demo@scoreshift.com";

  // Fetch real data on mount
  useEffect(() => {
    if (!user?.id) return;
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    Promise.all([
      fetch("/api/credit-reports", { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/credit-issues", { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/disputes", { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([report, issues, disputes]) => {
      if (report) setRealCreditReport(report);
      if (issues && Array.isArray(issues)) setRealIssues(issues);
      if (disputes && Array.isArray(disputes)) setRealDisputes(disputes);
      setDataLoaded(true);
    });
  }, [user?.id]);

  // Determine whether to show real or mock data
  const hasRealData = dataLoaded && (realCreditReport !== null || realIssues.length > 0);
  // Show mock/sample data for all users who don't have real data yet (including new clients)
  const showMockData = !hasRealData;

  // Demo: show VictoryRoom after 3 seconds only in demo mode
  useEffect(() => {
    if (!isDemoMode) return;
    const timer = setTimeout(() => setShowVictory(true), 3000);
    return () => clearTimeout(timer);
  }, [isDemoMode]);

  // Build score data from real or mock
  const scoreData: ScoreData = hasRealData && realCreditReport
    ? {
        scores: {
          experian: realCreditReport.creditScore ?? mockClient.scores.experian,
          equifax: realCreditReport.creditScore ?? mockClient.scores.equifax,
          transunion: realCreditReport.creditScore ?? mockClient.scores.transunion,
        },
        scoreChange: 0,
        scoreHistory: [realCreditReport.creditScore ?? 600],
        lastUpdated: realCreditReport.lastUpdated ?? new Date().toISOString(),
      }
    : mockScoreData;

  const disputeData: DisputeTrackerData = hasRealData
    ? {
        disputeStage: realDisputes.length > 0 ? "Disputes Filed" : "Pending Upload",
        currentRound: 1,
        totalRounds: 3,
        itemsInDispute: realDisputes.filter((d) => d.status === "PENDING").length,
        nextUpdate: "30 days",
      }
    : mockDisputeData;

  const removedItems: RemovedItem[] = hasRealData
    ? realIssues
        .filter((i) => i.status === "RESOLVED")
        .slice(0, 6)
        .map((i, idx) => ({
          id: String(i.id ?? idx),
          creditor: i.creditor ?? "Unknown",
          type: i.type ?? "Collection",
          amount: i.amount ? `$${i.amount}` : undefined,
          removedDate: i.dateAdded ?? new Date().toISOString(),
        }))
    : mockRemovedItems;

  const loanData: LoanReadinessData = hasRealData && realCreditReport
    ? {
        loanReadiness: Math.min(100, Math.max(0, Math.round((realCreditReport.creditScore - 500) / 2.8))),
        currentScore: realCreditReport.creditScore,
        targetScore: 680,
      }
    : mockLoanData;

  // Use real user name if available, fall back to mock
  const clientName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || mockClient.name
    : mockClient.name;

  return (
    <div className="min-h-screen bg-background">
      {/* ── 1. Header / Nav ── */}
      <DashboardHeader clientName={clientName} />

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Welcome greeting row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {clientName.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening with your credit repair case
            </p>
          </div>
        </div>

        {/* Array credit profile welcome banner — shown once after enrollment */}
        {user && arrayEnrollment?.enrolled && (
          <ArrayWelcomeBanner
            userId={user.id}
            firstName={user.firstName ?? ""}
            productCodes={arrayEnrollment.productCodes}
            enrolledAt={arrayEnrollment.enrolledAt}
            welcomeShown={arrayEnrollment.welcomeShown ?? false}
          />
        )}

        {/* Sample data banner — shown until admin uploads real credit report */}
        {showMockData && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 px-4 py-3 flex items-center gap-3 text-sm text-blue-800 dark:text-blue-300">
            <span className="text-blue-500">📋</span>
            <span><strong>Sample Dashboard</strong> — Your personalized credit data will appear here once your admin uploads your credit report.</span>
          </div>
        )}


        {/* ── 2. Credit Score Hero — live credit data if enrolled, else static ── */}
        <ScoreHero
          data={scoreData}
          isEnrolled={arrayEnrollment?.enrolled ?? false}
          scriptReady={arrayScriptReady}
        />

        {/* ── 3 & 4. Dispute Tracker + Items Removed — always visible, right below scores ── */}
        {(hasRealData || showMockData) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DisputeTracker data={disputeData} />
            <ItemsRemoved count={removedItems.length} items={removedItems} />
          </div>
        )}

        {/* ── 8. Action Center ── */}
        <ActionCenter actions={mockActions} />

        {/* ── 9. Loan Readiness ── */}
        {(hasRealData || showMockData) && <LoanReadiness data={loanData} />}

        {/* ── ScoreMap (Credit Roadmap) ── */}
        <ScoreMap />

        {/* ── 5. USPS Tracking ── */}
        <USPSTracking entries={trackingEntries} />

        {/* ── Two-column layout for lower sections ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── 7. Activity Feed ── */}
          <ActivityFeed events={showMockData ? mockActivityEvents : []} />

          {/* ── 6. Document Upload (with anchor id for scroll-to) ── */}
          <div id="upload-section">
            <DocumentUpload uploadedFiles={showMockData ? mockUploadedFiles : []} />
          </div>
        </div>

        {/* ── Referral Engine ── */}
        <ReferralEngine userId={user?.id} />

        {/* ── Try Denial Decoder CTA ── */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/25 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Got a loan denial? Let AI decode it.</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Paste your denial letter — we'll tell you exactly what to fix and how long it takes.</p>
          </div>
          <Link href="/denial-decoder">
            <button className="shrink-0 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors">
              Try Denial Decoder →
            </button>
          </Link>
        </div>

        {/* ── 10. Support Card ── */}
        <SupportCard />

        {/* Bottom padding */}
        <div className="h-20" />
      </main>

      {/* ── Victory Room overlay ── */}
      <VictoryRoom
        show={showVictory}
        milestone="Score Crossed 620 🎯"
        onClose={() => setShowVictory(false)}
      />

      {/* ── Credit Coach AI (floating, always visible) ── */}
      <CreditCoachAI clientName={clientName} userId={user?.id} />
    </div>
  );
}
