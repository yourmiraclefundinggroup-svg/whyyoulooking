import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUserContext } from "@/hooks/use-user-context";
import { KeyRound, Eye, EyeOff } from "lucide-react";

export function PasswordReset() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useUserContext();

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors([]);
    },
    onError: (error: any) => {
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors: string[] = [];
    
    if (!currentPassword) {
      validationErrors.push("Current password is required");
    }
    
    if (!newPassword) {
      validationErrors.push("New password is required");
    }
    
    if (!confirmPassword) {
      validationErrors.push("Password confirmation is required");
    }
    
    if (newPassword && newPassword !== confirmPassword) {
      validationErrors.push("New passwords do not match");
    }
    
    if (newPassword && currentPassword === newPassword) {
      validationErrors.push("New password must be different from current password");
    }
    
    // Validate password strength
    if (newPassword) {
      const passwordErrors = validatePassword(newPassword);
      validationErrors.push(...passwordErrors);
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    resetPasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card className="max-w-md mx-auto bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-blue-800">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-blue-600">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <KeyRound className="h-5 w-5" />
            <span>Change Password</span>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Update your account password for enhanced security.
          </p>
        </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
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
              <li>One special character</li>
            </ul>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>

    {/* Success Message */}
    {resetPasswordMutation.isSuccess && (
      <Card className="max-w-md mx-auto bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <KeyRound className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Password Updated Successfully</p>
              <p className="text-sm text-green-600">Your account is now more secure.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
    </div>
  );
}