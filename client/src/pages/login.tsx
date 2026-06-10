import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

import archImg from "@assets/ChatGPT_Image_Jun_10,_2026,_12_32_14_PM_1781109389839.png";

/* ─── CSS keyframes injected once ───────────────────────────────────────── */
const STYLE_ID = "ss-login-reflection";
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes ssReflect {
      0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
      8%   { opacity: 1; }
      40%  { transform: translateX(220%) skewX(-18deg); opacity: 0; }
      100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
    }
    .ss-reflect {
      animation: ssReflect 9s ease-in-out infinite;
      animation-delay: 2s;
    }
    .ss-glass-input::placeholder { color: rgba(30,27,24,0.35); }
    .ss-glass-input:focus {
      border-color: rgba(99,102,241,0.65) !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.14), inset 0 2px 4px rgba(255,255,255,0.30) !important;
    }
  `;
  document.head.appendChild(s);
}

export default function Login() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType]       = useState<"client" | "admin">("client");
  const { setCurrentUserId }            = useUserContext();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password, type }: { email: string; password: string; type: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password, loginType: type });
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_id", data.user.id.toString());
      setCurrentUserId(data.user.id);
      sessionStorage.setItem("ss_welcome_name", data.user?.firstName || "there");
      window.location.href = "/";
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password, type: loginType });
  };

  /* ── shared input style ─────────────────────────────────────────────── */
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "15px 18px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.40)",
    boxShadow: "inset 0 2px 6px rgba(255,255,255,0.50), 0 1px 0 rgba(255,255,255,0.30)",
    color: "#1E1B18",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden",
    }}>

      {/* ── Full-bleed background ────────────────────────────────────────── */}
      <img
        src={archImg} alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
        }}
      />

      {/* ── Directional overlay — barely-there on left, slightly deeper right */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, rgba(8,5,2,0.04) 0%, rgba(8,5,2,0.16) 52%, rgba(8,5,2,0.30) 100%)",
      }} />

      {/* ── Scroll container ─────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0,
        overflowY: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "40px 5.5vw 40px 0",
      }}>

        {/* ══════════════════════════════════════════════════════════════════
            GLASS CARD
            ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          width: "100%",
          maxWidth: "420px",
          /* Reduced tint opacity — environment shows through clearly */
          background: "rgba(72,68,168,0.12)",
          backdropFilter: "blur(36px)",
          WebkitBackdropFilter: "blur(36px)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.28)",
          borderRadius: "36px",
          padding: "52px 44px 44px",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* ── Slow luxury reflection sweep ─────────────────────────────── */}
          <div
            className="ss-reflect"
            style={{
              position: "absolute", top: 0, left: 0,
              width: "38%", height: "100%",
              background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          />

          {/* Inner top-edge highlight */}
          <div style={{
            position: "absolute", top: 0, left: "12%", right: "12%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.48), transparent)",
            borderRadius: "100px",
          }} />

          {/* ── Portal toggle ────────────────────────────────────────────── */}
          <div style={{
            display: "flex",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "100px",
            padding: "4px",
            marginBottom: "44px",
          }}>
            {(["client", "admin"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setLoginType(t)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: "100px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  cursor: "pointer",
                  transition: "background 0.22s, color 0.22s",
                  background: loginType === t ? "rgba(255,255,255,0.88)" : "transparent",
                  color: loginType === t ? "#1E1B4B" : "rgba(255,255,255,0.50)",
                }}
              >
                {t === "client" ? "Client Portal" : "Admin Portal"}
              </button>
            ))}
          </div>

          {/* ── Header ───────────────────────────────────────────────────── */}
          <div style={{ marginBottom: "36px" }}>
            <h1 style={{
              color: "#FFFCF5",
              fontSize: "32px",
              fontWeight: 500,
              letterSpacing: "-0.8px",
              lineHeight: "1.1",
              marginBottom: "12px",
            }}>
              Welcome back.
            </h1>
            <p style={{
              color: "rgba(255,252,245,0.55)",
              fontSize: "15px",
              lineHeight: "1.55",
              marginBottom: "6px",
            }}>
              {loginType === "client"
                ? "Continue your guided financial journey."
                : "Access the ScoreShift admin portal."}
            </p>
            {loginType === "client" && (
              <p style={{
                color: "rgba(255,252,245,0.35)",
                fontSize: "13px",
                lineHeight: "1.55",
              }}>
                Know what matters. Know what to do next.
              </p>
            )}
          </div>

          {/* ── Form ─────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Email */}
            <div>
              <label style={{
                display: "block",
                color: "rgba(255,252,245,0.55)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="ss-glass-input"
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block",
                color: "rgba(255,252,245,0.55)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="ss-glass-input"
                  style={{ ...inputStyle, paddingRight: "52px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "16px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(30,27,24,0.38)", padding: 0,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(30,27,24,0.65)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(30,27,24,0.38)")}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {loginMutation.isError && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "13px 16px",
                borderRadius: "14px",
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#FCA5A5",
                fontSize: "13px",
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                Invalid email or password. Please try again.
              </div>
            )}

            {/* Submit — Linear-style glossy indigo gradient */}
            <button
              type="submit"
              disabled={loginMutation.isPending || !email || !password}
              style={{
                width: "100%",
                padding: "17px",
                marginTop: "4px",
                borderRadius: "100px",
                border: "none",
                background: loginMutation.isPending || !email || !password
                  ? "rgba(99,102,241,0.35)"
                  : "linear-gradient(135deg, #818CF8 0%, #6366F1 38%, #4338CA 100%)",
                color: "#FFFCF5",
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                cursor: loginMutation.isPending || !email || !password ? "not-allowed" : "pointer",
                boxShadow: "0 6px 30px rgba(67,56,202,0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
                transition: "transform 0.22s cubic-bezier(0.23,1,0.32,1), box-shadow 0.22s",
              }}
              onMouseEnter={(e) => {
                if (!loginMutation.isPending && email && password) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(67,56,202,0.45), inset 0 1px 0 rgba(255,255,255,0.22)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 6px 30px rgba(67,56,202,0.35), inset 0 1px 0 rgba(255,255,255,0.22)";
              }}
            >
              {loginMutation.isPending ? "Signing in…" : "Continue →"}
            </button>

          </form>

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <Link href="/signup">
              <span style={{
                color: "rgba(255,252,245,0.40)",
                fontSize: "13px",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.70)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.40)")}
              >
                New to ScoreShift?{" "}
                <span style={{ color: "rgba(180,172,220,0.85)", fontWeight: 500 }}>
                  Create an account
                </span>
              </span>
            </Link>
          </div>

          {/* Secure access line */}
          <p style={{
            textAlign: "center",
            color: "rgba(255,252,245,0.20)",
            fontSize: "11px",
            letterSpacing: "0.06em",
            marginTop: "22px",
          }}>
            Secure access to your ScoreShift dashboard.
          </p>

        </div>
      </div>

      {/* ── Bottom-left back link ─────────────────────────────────────────── */}
      <Link href="/">
        <div style={{
          position: "fixed", bottom: "32px", left: "40px",
          color: "rgba(255,252,245,0.32)",
          fontSize: "12px",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontWeight: 600,
          cursor: "pointer",
          transition: "color 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.65)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.32)")}
        >
          ← Back to ScoreShift
        </div>
      </Link>

    </div>
  );
}
