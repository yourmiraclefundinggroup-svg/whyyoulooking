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
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    loginMutation.mutate({ email, password, type: loginType });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CreditFix Pro</h1>
          <h2 className="text-xl font-semibold text-gray-700">
            {loginType === "client" ? "Client Portal" : "Admin Portal"}
          </h2>
          <p className="text-gray-600 mt-2">
            {loginType === "client" 
              ? "View your credit repair progress" 
              : "Manage client accounts and disputes"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Portal Type Selector */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Portal Type</Label>
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

        <div className="text-center text-sm text-gray-600">
          <p>Secure credit repair management system</p>
          <p className="mt-1">Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}