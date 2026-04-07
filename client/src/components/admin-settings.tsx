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
import { useTheme } from "@/components/theme-provider";
import { Shield, Eye, EyeOff, CheckCircle, AlertTriangle, RefreshCw, Zap, Moon, Sun } from "lucide-react";

export function AdminSettings() {
  const { user } = useUserContext();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [demoResetting, setDemoResetting] = useState(false);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setTheme(next ? "dark" : "light");
    toast({ title: `${next ? "Dark" : "Light"} mode activated` });
  };

  const handleDemoReset = async () => {
    if (!confirm("Reset the demo account? This will delete all demo data and re-create Marcus Johnson's account.")) return;
    setDemoResetting(true);
    try {
      const token = localStorage.getItem("auth_token");
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
      <div className="bg-[hsl(var(--admin-card))] rounded-lg border border-[hsl(var(--admin-border))] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--admin-text))] flex items-center gap-3">
              <Shield className="h-7 w-7 text-[hsl(var(--admin-info))]" />
              Admin Settings
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">
              Manage your administrator account security settings.
            </p>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="mb-6 p-4 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50">
          <div className="flex items-center gap-2 mb-3">
            {isDarkMode ? <Moon className="h-5 w-5 text-indigo-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
            <h3 className="font-semibold text-[hsl(var(--admin-text))]">Appearance</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-[hsl(var(--admin-text))]">Admin Portal Theme</p>
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">Currently: {isDarkMode ? "Dark Mode" : "Light Mode"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2 border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Switch to {isDarkMode ? "Light" : "Dark"}
            </Button>
          </div>
        </div>

        {/* Automation Settings */}
        <div className="mb-6 p-4 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-[hsl(var(--admin-text))]">Automation Settings</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--admin-border))]">
              <div>
                <p className="font-medium text-[hsl(var(--admin-text))]">Scoreshifting Auto-Run</p>
                <p className="text-xs text-[hsl(var(--admin-text-muted))]">Automatically analyze credit reports after upload</p>
              </div>
              <Badge className="bg-green-500/15 text-green-500 dark:text-green-400 border-green-500/30">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--admin-border))]">
              <div>
                <p className="font-medium text-[hsl(var(--admin-text))]">Auto-Create Credit Issues</p>
                <p className="text-xs text-[hsl(var(--admin-text-muted))]">Create negative items from parsed report data</p>
              </div>
              <Badge className="bg-green-500/15 text-green-500 dark:text-green-400 border-green-500/30">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-[hsl(var(--admin-text))]">Welcome SMS on Signup</p>
                <p className="text-xs text-[hsl(var(--admin-text-muted))]">Send automated welcome message to new clients</p>
              </div>
              <Badge variant="outline" className="text-[hsl(var(--admin-text-muted))] border-[hsl(var(--admin-border))]">Requires Twilio</Badge>
            </div>
          </div>
        </div>

        {/* Demo Settings */}
        <div className="mb-6 p-4 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold text-[hsl(var(--admin-text))]">Demo Settings</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-sm text-[hsl(var(--admin-text))]">Demo Account</p>
              <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5">
                Login: <code className="bg-[hsl(var(--admin-bg))] px-1 rounded text-[hsl(var(--admin-text))]">demo@scoreshift.com</code> / <code className="bg-[hsl(var(--admin-bg))] px-1 rounded text-[hsl(var(--admin-text))]">Demo2026!</code>
                {" "}— Marcus Johnson, Round 2 disputes, realistic data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemoReset}
              disabled={demoResetting}
              className="gap-2 border-[hsl(var(--admin-border))] text-purple-400 hover:text-purple-300 hover:border-purple-500/50"
            >
              <RefreshCw className={`h-4 w-4 ${demoResetting ? "animate-spin" : ""}`} />
              {demoResetting ? "Resetting..." : "Reset Demo Account"}
            </Button>
          </div>
        </div>

        {/* Change Password */}
        <div className="mb-6 p-4 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-[hsl(var(--admin-info))]" />
            <h3 className="font-semibold text-[hsl(var(--admin-text))]">Change Admin Password</h3>
          </div>

          <Alert className="mb-4 border-amber-500/30 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-[hsl(var(--admin-text-muted))]">
              <strong className="text-[hsl(var(--admin-text))]">Security Notice:</strong> Changing your admin password will protect your account from unauthorized access. Use a strong, unique password.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="current-password" className="text-[hsl(var(--admin-text-muted))]">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-subtle))]"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-[hsl(var(--admin-text-subtle))]"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="new-password" className="text-[hsl(var(--admin-text-muted))]">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-subtle))]"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-[hsl(var(--admin-text-subtle))]"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-password" className="text-[hsl(var(--admin-text-muted))]">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-subtle))]"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-[hsl(var(--admin-text-subtle))]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="text-sm text-[hsl(var(--admin-text-muted))] space-y-1">
              <p className="font-medium text-[hsl(var(--admin-text))]">Password Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>At least 8 characters long</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </div>

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
              className="w-full bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
              disabled={passwordChangeM.isPending}
            >
              {passwordChangeM.isPending ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </div>

        {/* Current Admin Info */}
        <div className="p-4 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-[hsl(var(--admin-text))]">Current Admin Account</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--admin-text-muted))]">Email:</span>
              <span className="text-sm font-medium text-[hsl(var(--admin-text))]">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--admin-text-muted))]">Name:</span>
              <span className="text-sm font-medium text-[hsl(var(--admin-text))]">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[hsl(var(--admin-text-muted))]">Access Level:</span>
              <Badge variant="outline" className="text-[hsl(var(--admin-info))] border-[hsl(var(--admin-info))]/30">
                {user?.accessLevel}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
