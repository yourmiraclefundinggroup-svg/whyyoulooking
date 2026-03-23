/**
 * VictoryRoom — Full-screen overlay modal for milestone achievements.
 * Displays confetti animation, achievement details, and a shareable victory card.
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Share2, Copy } from "lucide-react";

interface VictoryRoomProps {
  show: boolean;
  milestone: string;
  onClose: () => void;
}

export const MILESTONES = [
  "First Dispute Submitted 📋",
  "First Item Removed 🗑️",
  "Score Crossed 580 ⭐",
  "Score Crossed 620 🎯",
  "Score Crossed 660 🔥",
  "Score Crossed 700 💎",
  "Loan Ready — Target Score Hit! 🏠",
  "Dispute Champion — All Rounds Complete! 🏆",
];

// Generate confetti piece data once (stable across renders)
const CONFETTI_PIECES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 1.5,
  color: i % 2 === 0 ? "#F59E0B" : "#FFFFFF",
  size: 4 + Math.floor(Math.random() * 4),
}));

export function VictoryRoom({ show, milestone, onClose }: VictoryRoomProps) {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const victoryText = `I just achieved: ${milestone} on ScoreShift! My credit is on the way up! 🚀`;

  useEffect(() => {
    if (!show) {
      setCopied(false);
      setShareSuccess(false);
    }
  }, [show]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(victoryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement("textarea");
      el.value = victoryText;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ScoreShift Achievement",
          text: victoryText,
          url: "https://scoreshiftapp.com",
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch {
        // User cancelled or share failed — fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes victoryPop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes trophyBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-12px) scale(1.08); }
        }
        .victory-content {
          animation: victoryPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .trophy-bounce {
          animation: trophyBounce 1.8s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

      {/* Full-screen overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ backgroundColor: "#0F172A" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Confetti pieces */}
        {CONFETTI_PIECES.map((piece) => (
          <div
            key={piece.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${piece.left}%`,
              top: "-20px",
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              animation: `confettiFall ${piece.duration}s ease-in ${piece.delay}s infinite`,
            }}
          />
        ))}

        {/* Modal content */}
        <div className="victory-content relative z-10 w-full max-w-md flex flex-col items-center gap-6 text-center">
          {/* Trophy */}
          <div className="trophy-bounce text-7xl select-none" role="img" aria-label="Trophy">
            🏆
          </div>

          {/* Headline */}
          <div>
            <h1
              className="text-3xl font-black tracking-tight"
              style={{ color: "#F59E0B" }}
            >
              Achievement Unlocked!
            </h1>
            <p className="text-white text-xl font-bold mt-2 leading-snug">
              {milestone}
            </p>
          </div>

          {/* Shareable victory card */}
          <div
            className="w-full rounded-2xl border-2 p-5 flex flex-col gap-4"
            style={{ backgroundColor: "#1E2D47", borderColor: "#F59E0B" }}
          >
            <p className="text-white text-sm leading-relaxed text-left">
              <span className="text-amber-400 font-semibold">ScoreShift Victory</span>
              <br />
              {victoryText}
            </p>

            <div className="flex gap-3">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors border"
                style={{
                  backgroundColor: copied ? "#065F46" : "#1E3A5F",
                  borderColor: copied ? "#10B981" : "#334155",
                  color: copied ? "#6EE7B7" : "#E2E8F0",
                }}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Victory Text
                  </>
                )}
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors border"
                style={{
                  backgroundColor: shareSuccess ? "#065F46" : "#92400E",
                  borderColor: shareSuccess ? "#10B981" : "#F59E0B",
                  color: shareSuccess ? "#6EE7B7" : "#FDE68A",
                }}
              >
                {shareSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Shared!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Keep Going button */}
          <Button
            onClick={onClose}
            className="px-8 py-3 text-base font-bold rounded-2xl shadow-lg text-white transition-transform hover:scale-105"
            style={{ backgroundColor: "#F59E0B", color: "#0F172A" }}
          >
            Keep Going →
          </Button>
        </div>
      </div>
    </>
  );
}
