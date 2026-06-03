import { useQuery } from "@tanstack/react-query";

export type ScoreShiftSource = "array_live" | "array_cache" | "pdf_upload" | "none";

export type PlanSuggestionType =
  | "dispute"
  | "paydown"
  | "inquiry-dispute"
  | "public-record"
  | "charge-off";

export type PlanSuggestionStatus = "open" | "in_progress" | "completed";

export interface PlanSuggestion {
  id: string;
  type: PlanSuggestionType;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
  bureau?: string;
  creditor?: string;
  status: PlanSuggestionStatus;
  disputeId?: number;
}

export interface ProfileViolation {
  code: string;
  label: string;
  statute?: string;
  category: string;
  creditor?: string;
  bureau?: string;
}

export interface ProfileTradeline {
  creditor: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  creditLimit?: number;
  status: string;
  dateOpened: string;
  dateOfFirstDelinquency?: string;
  latePayments: { days30: number; days60: number; days90: number };
  bureau?: string;
  isDerogatory: boolean;
  violations: ProfileViolation[];
}

export interface ProfileInquiry {
  creditor: string;
  inquiryDate: string;
  inquiryType: string;
  suggestedDisputeReason?: string;
}

export interface ProfileDispute {
  id: number;
  issueId: number;
  bureau: string;
  status: string;
  dateSent: string | null;
  dateDelivered?: string | null;
  expectedResponse: string | null;
  letterContent: string | null;
  trackingNumber?: string | null;
  creditor?: string;
  issueType?: string;
  issueTitle?: string;
  outcome?: string | null;
}

export interface ProfilePublicRecord {
  type: string;
  creditor: string;
  balance?: number | null;
  dateReported?: string | null;
  bureau?: string | null;
  description?: string | null;
}

export interface ProfileAlert {
  type: string;
  message: string;
  severity: "high" | "medium" | "low";
}

export interface UtilizationByAccount {
  creditor: string;
  balance: number;
  limit: number;
  utilizationPct: number;
}

export interface ScoreFactor {
  label: string;
  impact: "high" | "medium" | "low";
  weight: number;
}

export interface ScoreShiftProfile {
  scores: {
    experian: number | null;
    equifax: number | null;
    transunion: number | null;
    vantage: number | null;
  };
  tradelines: ProfileTradeline[];
  negativeTradelines: ProfileTradeline[];
  collections: ProfileTradeline[];
  chargeOffs: ProfileTradeline[];
  publicRecords: ProfilePublicRecord[];
  inquiries: ProfileInquiry[];
  utilization: {
    overallPercent: number | null;
    byAccount: UtilizationByAccount[];
  };
  alerts: ProfileAlert[];
  disputes: ProfileDispute[];
  violations: ProfileViolation[];
  scoreSimulator: {
    factors: ScoreFactor[];
    projectedGains: { action: string; estimatedPts: number }[];
  };
  planSuggestions: PlanSuggestion[];
  studentLoans: {
    connected: boolean;
  };
  subscriptions: {
    connected: boolean;
    monthlySpend: number | null;
    annualSpend: number | null;
    potentialSavings: number | null;
    subscriptionsFound: number | null;
  };
  meta: {
    source: ScoreShiftSource;
    fetchedAt: string;
    reportDate: string | null;
    isLive: boolean;
  };
}

export function useScoreShiftProfile(clientId?: number | null) {
  const url = clientId
    ? `/api/me/score-shift-profile?clientId=${clientId}`
    : "/api/me/score-shift-profile";
  return useQuery<ScoreShiftProfile>({
    queryKey: clientId
      ? ["/api/me/score-shift-profile", clientId]
      : ["/api/me/score-shift-profile"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}
