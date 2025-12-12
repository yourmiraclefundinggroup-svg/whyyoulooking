import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { ForcePasswordReset } from "@/components/force-password-reset";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"client" | "admin">("client");
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);
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
      
      // Check if password reset is required
      if (data.requiresPasswordReset) {
        setRequiresPasswordReset(true);
        return;
      }
      
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

  const handlePasswordReset = () => {
    // After password reset, redirect to appropriate portal
    window.location.href = "/";
  };

  // Show forced password reset if required
  if (requiresPasswordReset) {
    return <ForcePasswordReset onPasswordReset={handlePasswordReset} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* ScoreShift Logo Design */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-2xl shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <h1 className="text-3xl font-bold tracking-tight">Score</h1>
              </div>
              <div className="bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 px-6 py-3 rounded-2xl shadow-lg border-2 border-blue-200 dark:border-blue-700 transform rotate-2 hover:rotate-0 transition-transform duration-300 -mt-3 ml-4">
                <h1 className="text-3xl font-bold tracking-tight">Shift</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
            <div className="mx-3 text-2xl">📈</div>
            <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
          </div>
          
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-300 mb-2">
            {loginType === "client" ? "Client Portal" : "Admin Portal"}
          </h2>
          <p className="text-blue-600 dark:text-blue-400 mt-2 font-medium">
            {loginType === "client" 
              ? "Track your credit score transformation" 
              : "Empower clients to shift their credit scores"}
          </p>
        </div>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-center dark:text-white">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Portal Type Selector */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Portal Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={loginType === "client" ? "default" : "outline"}
                  onClick={() => setLoginType("client")}
                  className="w-full"
                >
                  Client Portal
                </Button>
                <Button
                  type="button"
                  variant={loginType === "admin" ? "default" : "outline"}
                  onClick={() => setLoginType("admin")}
                  className="w-full"
                >
                  Admin Portal
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {loginMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Invalid email or password. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loginMutation.isPending || !email || !password}
                className="w-full"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>


          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Secure credit repair management system</p>
          <p className="mt-1">Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}