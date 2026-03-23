/**
 * ReferralEngine — Referral program card.
 * Users can copy their referral link, share via WhatsApp/SMS/Email,
 * and track earnings. Fetches real referrals via GET /api/referrals.
 */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  Check,
  Copy,
  MessageCircle,
  MessageSquare,
  Mail,
} from "lucide-react";

interface ReferralEngineProps {
  userId?: number;
}

interface Referral {
  name: string;
  status: "Signed Up" | "Paid" | "Invited";
  reward: string;
}

const MOCK_REFERRALS: Referral[] = [
  { name: "Sarah M.", status: "Signed Up", reward: "$0 (pending)" },
  { name: "James K.", status: "Paid", reward: "$25 Earned ✓" },
  { name: "Maria T.", status: "Invited", reward: "Pending" },
];

function statusBadgeClass(status: Referral["status"]): string {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "Signed Up":
      return "bg-blue-100 text-blue-700 border-blue-300";
    default:
      return "bg-slate-100 text-slate-500 border-slate-300";
  }
}

export function ReferralEngine({ userId }: ReferralEngineProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const referralId = userId ?? "YOUR_ID";
  const referralUrl = `scoreshiftapp.com/ref/${referralId}`;
  const shareText = `Hey! I'm using ScoreShift to fix my credit and it's amazing. Get started here: scoreshiftapp.com/ref/${referralId}`;

  // Track referral visit on mount if referrerId is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referrerId = params.get("referrerId");
    if (referrerId && userId) {
      fetch(`/api/referrals/track?referrerId=${referrerId}`, {
        method: "POST",
      }).catch(() => {
        // Silently fail — tracking is best-effort
      });
    }
  }, [userId]);

  // Fetch real referrals (falls back to mock if the request fails)
  const { data: referrals } = useQuery<Referral[]>({
    queryKey: ["/api/referrals", userId],
    queryFn: async () => {
      const res = await fetch("/api/referrals");
      if (!res.ok) throw new Error("Failed to fetch referrals");
      return res.json();
    },
    // On error, the component falls back to MOCK_REFERRALS via the nullish coalesce below
    retry: false,
  });

  const displayReferrals = referrals ?? MOCK_REFERRALS;

  const totalEarned = displayReferrals
    .filter((r) => r.status === "Paid")
    .length * 25;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(`https://${referralUrl}`);
    } catch {
      // Fallback
      const el = document.createElement("input");
      el.value = `https://${referralUrl}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  function handleWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleSMS() {
    window.open(
      `sms:?&body=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleEmail() {
    window.open(
      `mailto:?subject=${encodeURIComponent("Fix Your Credit with ScoreShift")}&body=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200 overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg font-bold text-slate-900">Refer &amp; Earn</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-5 pb-6 px-5 space-y-5">
        {/* Headline */}
        <p className="text-slate-800 font-bold text-base leading-snug">
          Earn{" "}
          <span className="text-emerald-600">$25</span> for every friend who
          joins ScoreShift
        </p>

        {/* Referral link */}
        <div className="flex gap-2">
          <Input
            readOnly
            value={referralUrl}
            className="flex-1 bg-slate-50 border-slate-200 text-sm font-mono text-slate-700 select-all cursor-pointer"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className={`flex-shrink-0 min-w-[110px] gap-1.5 font-semibold transition-colors ${
              linkCopied
                ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {linkCopied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleWhatsApp}
            variant="outline"
            className="flex-1 gap-1.5 text-xs border-green-300 text-green-700 hover:bg-green-50 font-semibold"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            onClick={handleSMS}
            variant="outline"
            className="flex-1 gap-1.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
          >
            <MessageSquare className="h-4 w-4" />
            SMS
          </Button>
          <Button
            onClick={handleEmail}
            variant="outline"
            className="flex-1 gap-1.5 text-xs border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>

        {/* Referrals table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Friend
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Reward
                </th>
              </tr>
            </thead>
            <tbody>
              {displayReferrals.map((ref, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-3 py-2.5 font-medium text-slate-800">
                    {ref.name}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge
                      className={`text-xs font-semibold border ${statusBadgeClass(
                        ref.status
                      )}`}
                    >
                      {ref.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs font-medium text-slate-600">
                    {ref.reward}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total row */}
          <div className="bg-amber-50 border-t border-amber-200 px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">
              Total Earned
            </span>
            <span className="text-sm font-black text-amber-600">
              ${totalEarned} earned
            </span>
          </div>
        </div>

        {/* How it works */}
        <div className="pt-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            How it works
          </p>
          <ol className="space-y-1">
            {[
              "Share your link",
              "Friend signs up & pays",
              "You earn $25",
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
