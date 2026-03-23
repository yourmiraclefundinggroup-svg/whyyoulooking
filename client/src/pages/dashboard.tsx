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

// USPS tracking entries
const mockTrackingEntries: TrackingEntry[] = [
  {
    id: "exp-1",
    trackingNumber: "9400111899223456789012",
    bureau: "Experian",
    mailedDate: "Mar 18, 2026",
    expectedDate: "Mar 22, 2026",
    status: "in_transit",
    sentViaLob: true,
  },
  {
    id: "eq-1",
    trackingNumber: "9400111899223456789034",
    bureau: "Equifax",
    mailedDate: "Mar 18, 2026",
    deliveredDate: "Mar 21, 2026",
    status: "delivered",
    sentViaLob: true,
  },
  {
    id: "tu-1",
    trackingNumber: "9400111899223456789056",
    bureau: "TransUnion",
    mailedDate: "Mar 18, 2026",
    deliveredDate: "Mar 20, 2026",
    status: "delivered",
    sentViaLob: true,
  },
];

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

// ─── Dashboard Component ────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useUserContext();
  const [showVictory, setShowVictory] = useState(false);

  // Demo: show VictoryRoom after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowVictory(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Use real user name if available, fall back to mock
  const clientName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || mockClient.name
    : mockClient.name;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── 1. Header / Nav ── */}
      <DashboardHeader clientName={clientName} />

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Welcome greeting row */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {clientName.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening with your credit repair case
          </p>
        </div>

        {/* ── 2. Credit Score Hero ── */}
        <ScoreHero data={mockScoreData} />

        {/* ── 9. Loan Readiness (prominent — above the fold on desktop) ── */}
        <LoanReadiness data={mockLoanData} />

        {/* ── 8. Action Center ── */}
        <ActionCenter actions={mockActions} />

        {/* ── Two-column layout for middle sections ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── 3. Dispute Tracker ── */}
          <DisputeTracker data={mockDisputeData} />

          {/* ── 4. Items Removed Wins ── */}
          <ItemsRemoved count={mockClient.itemsRemoved} items={mockRemovedItems} />
        </div>

        {/* ── ScoreMap (Credit Roadmap) ── */}
        <ScoreMap />

        {/* ── 5. USPS Tracking ── */}
        <USPSTracking entries={mockTrackingEntries} />

        {/* ── Two-column layout for lower sections ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── 7. Activity Feed ── */}
          <ActivityFeed events={mockActivityEvents} />

          {/* ── 6. Document Upload (with anchor id for scroll-to) ── */}
          <div id="upload-section">
            <DocumentUpload uploadedFiles={mockUploadedFiles} />
          </div>
        </div>

        {/* ── Referral Engine ── */}
        <ReferralEngine userId={user?.id} />

        {/* ── Try Denial Decoder CTA ── */}
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">Got a loan denial? Let AI decode it.</h3>
            <p className="text-sm text-slate-600 mt-0.5">Paste your denial letter — we'll tell you exactly what to fix and how long it takes.</p>
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
