import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import scoreshiftLogo from "@assets/scoreshift-logo.png";

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
        loginType: type
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
      if (error.message?.includes("Invalid credentials")) {
        console.error("Credential validation failed - check email/password combination");
      }
      if (error.message?.includes("Access denied")) {
        console.error("Access denied - check if you selected the correct portal type");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password, type: loginType });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden"
      style={{ background: "#F1E8DA" }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(124,107,203,0.08)" }}
      />
      <div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(124,107,203,0.05)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 cursor-pointer mb-4">
              <img src={scoreshiftLogo} alt="ScoreShift" className="w-10 h-10 object-contain" />
              <span className="font-black text-2xl tracking-tight" style={{ color: "#2A2725" }}>ScoreShift</span>
            </div>
          </Link>
          <h1 className="text-2xl font-black mt-2" style={{ color: "#2A2725" }}>
            {loginType === "client" ? "Welcome back" : "Admin Portal"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#5B5652" }}>
            {loginType === "client"
              ? "Sign in to your credit repair dashboard"
              : "Empower clients to shift their credit scores"}
          </p>
        </div>

        {/* Card */}
        <div
          className="p-8 rounded-2xl"
          style={{
            background: "#F3EEE6",
            border: "1px solid rgba(42,39,37,0.12)",
            boxShadow: "0 4px 24px rgba(42,39,37,0.08)",
          }}
        >
          {/* Portal type selector */}
          <div className="mb-6">
            <div
              className="flex rounded-full p-1"
              style={{
                background: "rgba(42,39,37,0.06)",
                border: "1px solid rgba(42,39,37,0.10)",
              }}
            >
              <button
                type="button"
                onClick={() => setLoginType("client")}
                className="flex-1 py-2 rounded-full text-sm font-semibold transition-all"
                style={
                  loginType === "client"
                    ? { background: "#7C6BCB", color: "#fff" }
                    : { color: "#8B8480" }
                }
              >
                Client Portal
              </button>
              <button
                type="button"
                onClick={() => setLoginType("admin")}
                className="flex-1 py-2 rounded-full text-sm font-semibold transition-all"
                style={
                  loginType === "admin"
                    ? { background: "#7C6BCB", color: "#fff" }
                    : { color: "#8B8480" }
                }
              >
                Admin Portal
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#4A4541" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(42,39,37,0.04)",
                  border: "1px solid rgba(42,39,37,0.15)",
                  color: "#2A2725",
                }}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px rgba(124,107,203,0.20)")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#4A4541" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-12"
                  style={{
                    background: "rgba(42,39,37,0.04)",
                    border: "1px solid rgba(42,39,37,0.15)",
                    color: "#2A2725",
                  }}
                  onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px rgba(124,107,203,0.20)")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#8B8480" }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {loginMutation.isError && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.18)",
                  color: "#dc2626",
                }}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Invalid email or password. Please try again.
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending || !email || !password}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#7C6BCB" }}
              onMouseEnter={(e) => { if (!loginMutation.isPending) (e.target as HTMLButtonElement).style.background = "#8D80D3"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "#7C6BCB"; }}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: "#8B8480" }}>
            Don't have an account?{" "}
            <a href="/signup" style={{ color: "#7C6BCB" }} className="font-medium transition-colors hover:opacity-80">
              Sign up free
            </a>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#8B8480" }}>
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
