import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

import archImg from "@assets/ChatGPT_Image_Jun_10,_2026,_12_32_14_PM_1781109389839.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"client" | "admin">("client");
  const [, setLocation] = useLocation();
  const { setCurrentUserId } = useUserContext();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password, type }: { email: string; password: string; type: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", {
        email,
        password,
        loginType: type,
      });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_id", data.user.id.toString());
      setCurrentUserId(data.user.id);
      sessionStorage.setItem("ss_welcome_name", data.user?.firstName || "there");
      window.location.href = "/";
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password, type: loginType });
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden",
    }}>

      {/* ── Full-bleed background image ───────────────────────────────────── */}
      <img
        src={archImg}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
        }}
      />

      {/* ── Subtle directional overlay — darker on right for card legibility */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, rgba(8,5,2,0.06) 0%, rgba(8,5,2,0.22) 55%, rgba(8,5,2,0.38) 100%)",
      }} />

      {/* ── Scroll container ─────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0,
        overflowY: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "40px 6vw 40px 0",
      }}>

        {/* ── Glass card ────────────────────────────────────────────────────
            Positioned right-of-center so the arch + logo stays visible     */}
        <div style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(92,88,189,0.18)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.30)",
          borderRadius: "36px",
          padding: "52px 44px 44px",
          position: "relative",
        }}>

          {/* Inner highlight top edge */}
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.50), transparent)",
            borderRadius: "100px",
          }} />

          {/* ── Portal type toggle ──────────────────────────────────────── */}
          <div style={{
            display: "flex",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
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
                  color: loginType === t ? "#1E1B4B" : "rgba(255,255,255,0.55)",
                }}
              >
                {t === "client" ? "Client Portal" : "Admin Portal"}
              </button>
            ))}
          </div>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div style={{ marginBottom: "40px" }}>
            <h1 style={{
              color: "#FFFCF5",
              fontSize: "32px",
              fontWeight: 500,
              letterSpacing: "-0.8px",
              lineHeight: "1.1",
              marginBottom: "10px",
            }}>
              Welcome back.
            </h1>
            <p style={{
              color: "rgba(255,252,245,0.55)",
              fontSize: "15px",
              lineHeight: "1.5",
            }}>
              {loginType === "client"
                ? "Continue your guided financial journey."
                : "Access the ScoreShift admin portal."}
            </p>
          </div>

          {/* ── Form ───────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Email */}
            <div>
              <label style={{
                display: "block",
                color: "rgba(255,252,245,0.60)",
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
                style={{
                  width: "100%",
                  padding: "15px 18px",
                  borderRadius: "16px",
                  background: "rgba(255,253,245,0.10)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#FFFCF5",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(99,102,241,0.70)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.18)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.18)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block",
                color: "rgba(255,252,245,0.60)",
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
                  style={{
                    width: "100%",
                    padding: "15px 52px 15px 18px",
                    borderRadius: "16px",
                    background: "rgba(255,253,245,0.10)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "#FFFCF5",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(99,102,241,0.70)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.18)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.18)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "16px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,252,245,0.38)", padding: 0,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.70)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.38)")}
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

            {/* Submit */}
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
                  ? "rgba(99,102,241,0.40)"
                  : "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
                color: "#FFFCF5",
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                cursor: loginMutation.isPending || !email || !password ? "not-allowed" : "pointer",
                boxShadow: "0 8px 32px rgba(67,56,202,0.30)",
                transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loginMutation.isPending && email && password) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(67,56,202,0.40)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(67,56,202,0.30)";
              }}
            >
              {loginMutation.isPending ? "Signing in…" : "Continue →"}
            </button>

          </form>

          {/* ── Footer links ────────────────────────────────────────────── */}
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <Link href="/signup">
              <span style={{
                color: "rgba(255,252,245,0.45)",
                fontSize: "13px",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.75)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.45)")}
              >
                New to ScoreShift?{" "}
                <span style={{ color: "rgba(180,172,220,0.90)", fontWeight: 500 }}>
                  Create an account
                </span>
              </span>
            </Link>
          </div>

          {/* Trust line */}
          <p style={{
            textAlign: "center",
            color: "rgba(255,252,245,0.22)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            marginTop: "24px",
          }}>
            Protected by enterprise-grade security
          </p>

        </div>
      </div>

      {/* ── Bottom-left back link ─────────────────────────────────────────── */}
      <Link href="/">
        <div style={{
          position: "fixed", bottom: "32px", left: "40px",
          color: "rgba(255,252,245,0.38)",
          fontSize: "12px",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontWeight: 600,
          cursor: "pointer",
          transition: "color 0.2s",
          display: "flex", alignItems: "center", gap: "6px",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.70)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,245,0.38)")}
        >
          ← Back to ScoreShift
        </div>
      </Link>

    </div>
  );
}
