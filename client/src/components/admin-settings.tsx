import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { Shield, Eye, EyeOff, CheckCircle, AlertTriangle, RefreshCw, Zap, MessageSquare, Tag, CreditCard, Moon, Sun } from "lucide-react";

export function AdminSettings() {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("adminTheme") !== "light";
  });
  const [demoResetting, setDemoResetting] = useState(false);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem("adminTheme", next ? "dark" : "light");
    document.documentElement.classList.toggle("light-mode", !next);
    toast({ title: `${next ? "Dark" : "Light"} mode activated` });
  };

  const handleDemoReset = async () => {
    if (!confirm("Reset the demo account? This will delete all demo data and re-create Marcus Johnson's account.")) return;
    setDemoResetting(true);
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      const res = await fetch("/api/admin/demo/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      toast({ title: "Demo Account Reset", description: data.message });
    } catch (e: any) {
      toast({ title: "Reset Failed", description: e.message, variant: "destructive" });
    } finally {
      setDemoResetting(false);
    }
  };

  const passwordChangeM = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your admin password has been successfully changed.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors([]);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to update password";
      setErrors([errorMessage]);
      toast({
        title: "Password Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Password must be at least 8 characters long");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
    if (!/\d/.test(password)) errors.push("Password must contain at least one number");
    if (!/[@$!%*?&]/.test(password)) errors.push("Password must contain at least one special character (@$!%*?&)");
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    if (!currentPassword) validationErrors.push("Current password is required");
    if (!newPassword) validationErrors.push("New password is required");
    if (!confirmPassword) validationErrors.push("Password confirmation is required");
    
    if (newPassword !== confirmPassword) {
      validationErrors.push("New passwords do not match");
    }

    const passwordErrors = validatePassword(newPassword);
    validationErrors.push(...passwordErrors);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    passwordChangeM.mutate({
      currentPassword,
      newPassword,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Shield className="h-7 w-7 text-blue-500" />
              Admin Settings
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage your administrator account security settings.
            </p>
          </div>
        </div>

        {/* Appearance Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDarkMode ? <Moon className="h-5 w-5 text-indigo-500" /> : <Sun className="h-5 w-5 text-amber-500" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Admin Portal Theme</p>
                <p className="text-xs text-slate-500">Currently: {isDarkMode ? "Dark Mode" : "Light Mode"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                Switch to {isDarkMode ? "Light" : "Dark"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Automation Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Automation Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="font-medium">Scoreshifting Auto-Run</p>
                  <p className="text-xs text-slate-500">Automatically analyze credit reports after upload</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="font-medium">Auto-Create Credit Issues</p>
                  <p className="text-xs text-slate-500">Create negative items from parsed report data</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Welcome SMS on Signup</p>
                  <p className="text-xs text-slate-500">Send automated welcome message to new clients</p>
                </div>
                <Badge variant="outline" className="text-slate-500">Requires Twilio</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-500" />
              Demo Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-sm">Demo Account</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Login: <code className="bg-slate-100 px-1 rounded">demo@scoreshift.com</code> / <code className="bg-slate-100 px-1 rounded">Demo2026!</code>
                  {" "}— Marcus Johnson, Round 2 disputes, realistic data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDemoReset}
                disabled={demoResetting}
                className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <RefreshCw className={`h-4 w-4 ${demoResetting ? "animate-spin" : ""}`} />
                {demoResetting ? "Resetting..." : "Reset Demo Account"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Change Admin Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Notice:</strong> Changing your admin password will protect your account from unauthorized access. Use a strong, unique password.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium">Password Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>At least 8 characters long</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                  <li>One special character (@$!%*?&)</li>
                </ul>
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={passwordChangeM.isPending}
              >
                {passwordChangeM.isPending ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Admin Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Current Admin Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Access Level:</span>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {user?.accessLevel}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}