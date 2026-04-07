import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Key, Lock, CheckCircle } from "lucide-react";
import type { BetaAccess } from "@shared/schema";

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccessGranted: (access: BetaAccess) => void;
}

export function AccessCodeModal({ isOpen, onClose, onAccessGranted }: AccessCodeModalProps) {
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState("");
  const [verifiedAccess, setVerifiedAccess] = useState<BetaAccess | null>(null);

  const validateMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("/api/validate-access", {
        method: "POST",
        body: JSON.stringify({ accessCode: code }),
      });
    },
    onSuccess: (access: BetaAccess) => {
      setVerifiedAccess(access);
      toast({
        title: "Access Code Verified!",
        description: "You now have special access to beta features.",
      });
    },
    onError: () => {
      toast({
        title: "Invalid Access Code",
        description: "Please check the code and try again.",
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (!accessCode.trim()) return;
    validateMutation.mutate(accessCode.trim().toUpperCase());
  };

  const handleContinue = () => {
    if (verifiedAccess) {
      onAccessGranted(verifiedAccess);
      onClose();
      setAccessCode("");
      setVerifiedAccess(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && accessCode.trim()) {
      handleVerify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2 text-blue-500" />
            Beta Access Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {!verifiedAccess ? (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Enter Your Access Code
                </h3>
                <p className="text-muted-foreground text-sm">
                  You've been given a special access code to test our credit repair features.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="access-code">Access Code</Label>
                <Input
                  id="access-code"
                  placeholder="Enter your access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className="text-center font-mono text-lg tracking-wider"
                  autoComplete="off"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={validateMutation.isPending || !accessCode.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                >
                  {validateMutation.isPending ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Access Granted!
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You now have access to these beta features:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Access Code:</span>
                    <code className="px-2 py-1 bg-blue-500/15 text-blue-500 dark:text-blue-400 rounded text-sm font-mono">
                      {verifiedAccess.accessCode}
                    </code>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {verifiedAccess.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
              >
                Continue to App
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AccessCodePrompt() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const handleAccessGranted = (access: BetaAccess) => {
    setHasAccess(true);
    localStorage.setItem('betaAccess', JSON.stringify(access));
  };

  React.useEffect(() => {
    const storedAccess = localStorage.getItem('betaAccess');
    if (storedAccess) {
      setHasAccess(true);
    }
  }, []);

  if (hasAccess) {
    return null;
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg"
          size="sm"
        >
          <Key className="h-4 w-4 mr-2" />
          Beta Access
        </Button>
      </div>
      
      <AccessCodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccessGranted={handleAccessGranted}
      />
    </>
  );
}
