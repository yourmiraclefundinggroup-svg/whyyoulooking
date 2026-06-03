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

export interface ProfileTradeline {
  creditor: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  status: string;
  dateOpened: string;
  dateOfFirstDelinquency?: string;
  latePayments: { days30: number; days60: number; days90: number };
  bureau?: string;
  isDerogatory: boolean;
  violations: { code: string; label: string; statute?: string; category: string }[];
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
  dateSent: string;
  expectedResponse: string;
  letterContent: string;
  creditor?: string;
  issueType?: string;
  issueTitle?: string;
  outcome?: string | null;
}

export interface ScoreShiftProfile {
  scores: {
    experian: number | null;
    equifax: number | null;
    transunion: number | null;
    source: ScoreShiftSource;
  };
  tradelines: ProfileTradeline[];
  negativeTradelines: ProfileTradeline[];
  inquiries: ProfileInquiry[];
  disputes: {
    active: ProfileDispute[];
    resolved: ProfileDispute[];
  };
  planSuggestions: PlanSuggestion[];
  meta: {
    source: ScoreShiftSource;
    fetchedAt: string;
    note?: string;
  };
}

export function useScoreShiftProfile() {
  return useQuery<ScoreShiftProfile>({
    queryKey: ["/api/me/score-shift-profile"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/me/score-shift-profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
