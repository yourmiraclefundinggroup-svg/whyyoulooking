/**
 * CreditCoachAI — Floating AI chat assistant for the client dashboard.
 * Opens a Sheet panel from the right; uses TanStack Query useMutation
 * to POST messages to /api/ai/credit-coach.
 */
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, Send, MessageCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface CreditCoachAIProps {
  clientName: string;
  userId?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "Why did my score change?",
  "What gets disputed next?",
  "How long until I hit 680?",
  "Should I pay this collection?",
];

async function sendMessage(message: string, userId?: number): Promise<string> {
  const response = await fetch("/api/ai/credit-coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, userId }),
  });
  const data = await response.json();
  return data.reply;
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-slate-100 rounded-2xl rounded-tl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-slate-400 rounded-full inline-block"
          style={{
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function CreditCoachAI({ clientName, userId }: CreditCoachAIProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: ({ message }: { message: string }) =>
      sendMessage(message, userId),
    onSuccess: (reply, { message }) => {
      // Remove the optimistic "pending" ai message and add the real one
      setMessages((prev) => {
        const withoutPending = prev.filter((m) => m.id !== "pending-ai");
        return [
          ...withoutPending,
          {
            id: `ai-${Date.now()}`,
            role: "ai",
            text: reply,
            timestamp: new Date(),
          },
        ];
      });
    },
    onError: () => {
      setMessages((prev) => {
        const withoutPending = prev.filter((m) => m.id !== "pending-ai");
        return [
          ...withoutPending,
          {
            id: `ai-err-${Date.now()}`,
            role: "ai",
            text: "Sorry, I had trouble connecting. Please try again in a moment.",
            timestamp: new Date(),
          },
        ];
      });
    },
  });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mutation.isPending]);

  // Send the intro message when the panel is first opened
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
      const firstName = clientName.split(" ")[0];
      setMessages([
        {
          id: "intro",
          role: "ai",
          text: `Hi ${firstName}! I have your full credit file in front of me. Ask me anything about your score, disputes, or next steps. I'm here 24/7.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [open, hasOpened, clientName]);

  function handleSend(text?: string) {
    const message = (text ?? inputValue).trim();
    if (!message || mutation.isPending) return;

    setInputValue("");

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: message,
      timestamp: new Date(),
    };

    // Add optimistic AI "thinking" slot
    const pendingMsg: ChatMessage = {
      id: "pending-ai",
      role: "ai",
      text: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    mutation.mutate({ message });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes creditCoachPing {
          0%, 100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .credit-coach-ring {
          animation: creditCoachPing 1.8s ease-in-out infinite;
        }
        .dot-bounce-0 { animation: dotBounce 1.2s ease-in-out 0s infinite; }
        .dot-bounce-1 { animation: dotBounce 1.2s ease-in-out 0.2s infinite; }
        .dot-bounce-2 { animation: dotBounce 1.2s ease-in-out 0.4s infinite; }
      `}</style>

      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-1">
        {/* Pulsing ring */}
        <div className="relative">
          <div className="credit-coach-ring absolute inset-0 rounded-full bg-amber-400 opacity-75" />
          <Button
            onClick={() => setOpen(true)}
            className="relative w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 shadow-xl border-2 border-amber-400 text-white flex items-center justify-center transition-transform hover:scale-105"
            aria-label="Open Credit Coach AI"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
        <span className="text-xs font-semibold text-amber-600 bg-white/90 rounded-full px-2 py-0.5 shadow-sm pointer-events-none select-none">
          AI Coach
        </span>
      </div>

      {/* Sheet panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[480px] flex flex-col p-0 gap-0"
        >
          {/* Header */}
          <SheetHeader className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-white text-base font-bold">
                  Credit Coach AI
                </SheetTitle>
                <p className="text-amber-400 text-xs font-medium">
                  Powered by ScoreShift AI
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.id === "pending-ai" ? (
                  <LoadingDots />
                ) : (
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-slate-100 text-slate-800 rounded-tl-sm"
                    )}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick question pills */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto flex-shrink-0 no-scrollbar">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={mutation.isPending}
                className="flex-shrink-0 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-3 py-1.5 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div className="px-4 py-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your credit…"
              disabled={mutation.isPending}
              className="flex-1 rounded-full border-slate-300 focus-visible:ring-amber-400 bg-slate-50"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || mutation.isPending}
              className="rounded-full w-10 h-10 p-0 bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
