import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
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
      // Store authentication in localStorage first
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_id", data.user.id.toString());

      // Set user context
      setCurrentUserId(data.user.id);

      // Redirect to root and let App.tsx handle routing to correct portal
      window.location.href = "/";
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response
      });

      // Show specific error message based on the error type
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

    console.log("Login attempt:", {
      email,
      password: password.substring(0, 3) + "***", // Only show first 3 chars for debugging
      loginType
    });

    loginMutation.mutate({ email, password, type: loginType });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden"
      style={{ background: "#050A14" }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(245,158,11,0.04)" }}
      />
      <div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(96,165,250,0.04)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 cursor-pointer mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black"
                style={{ background: "linear-gradient(135deg, #F59E0B, #FCD34D)" }}
              >
                SS
              </div>
              <span className="text-white font-black text-2xl tracking-tight">ScoreShift</span>
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white mt-2">
            {loginType === "client" ? "Welcome back" : "Admin Portal"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {loginType === "client"
              ? "Sign in to your credit repair dashboard"
              : "Empower clients to shift their credit scores"}
          </p>
        </div>

        {/* Card */}
        <div
          className="card-3d p-8"
        >
          {/* Portal type selector */}
          <div className="mb-6">
            <div
              className="flex rounded-full p-1"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <button
                type="button"
                onClick={() => setLoginType("client")}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                  loginType === "client"
                    ? "bg-amber-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Client Portal
              </button>
              <button
                type="button"
                onClick={() => setLoginType("admin")}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                  loginType === "admin"
                    ? "bg-amber-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Admin Portal
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
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
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none focus:ring-2 focus:ring-amber-500/50 transition-all pr-12"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                className="flex items-center gap-2 p-3 rounded-xl text-red-400 text-sm"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Invalid email or password. Please try again.
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending || !email || !password}
              className="w-full py-3 rounded-xl font-bold text-black text-sm transition-all glow-gold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #F59E0B, #FCD34D)" }}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <a href="/signup" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Sign up free
            </a>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
