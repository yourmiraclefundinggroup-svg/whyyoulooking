import { cn } from "@/lib/utils";

interface PaymentCard3DProps {
  className?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  animated?: boolean;
}

export function PaymentCard3D({
  className,
  cardNumber = "4242",
  cardHolder = "SCORESHIFT CLIENT",
  expiry = "03/29",
  animated = true,
}: PaymentCard3DProps) {
  return (
    <div className={cn("relative w-80 h-48 mx-auto", className)}>
      <div
        className={cn(
          "relative w-full h-full rounded-2xl overflow-hidden",
          "card-shine",
          animated && "animate-card-float"
        )}
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.8), 0 0 40px rgba(245,158,11,0.1)",
        }}
      >
        {/* Gold accent top strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: "linear-gradient(90deg, #F59E0B, #FCD34D, #F59E0B)",
          }}
        />

        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(96,165,250,0.3) 0%, transparent 50%)",
          }}
        />

        {/* Card content */}
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Top row: Brand + Chip */}
          <div className="flex justify-between items-start mb-4">
            <span
              className="text-xs font-black tracking-[0.3em] text-white/80"
              style={{ letterSpacing: "0.3em" }}
            >
              SCORESHIFT
            </span>
            {/* Chip */}
            <div
              className="w-9 h-7 rounded-md border border-amber-400/60"
              style={{
                background:
                  "linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #D97706 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <div className="grid grid-cols-2 gap-px h-full p-1">
                <div className="bg-amber-700/40 rounded-sm" />
                <div className="bg-amber-700/40 rounded-sm" />
                <div className="bg-amber-700/40 rounded-sm" />
                <div className="bg-amber-700/40 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Card number */}
          <div className="flex gap-4 text-white font-mono text-lg tracking-[0.2em] mb-4">
            <span className="opacity-60">••••</span>
            <span className="opacity-60">••••</span>
            <span className="opacity-60">••••</span>
            <span className="font-bold">{cardNumber}</span>
          </div>

          {/* Bottom row */}
          <div className="flex justify-between items-end mt-auto">
            <div>
              <div className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">
                Card Holder
              </div>
              <div className="text-white text-xs font-semibold tracking-wide">
                {cardHolder}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/40 text-[9px] uppercase tracking-widest mb-0.5">
                Expires
              </div>
              <div className="text-white text-xs font-semibold">{expiry}</div>
            </div>
            {/* Logo circles */}
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-full opacity-80"
                style={{
                  background:
                    "linear-gradient(135deg, #F59E0B, #D97706)",
                }}
              />
              <div
                className="w-8 h-8 rounded-full -ml-3 opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, #FBBF24, #F59E0B)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
