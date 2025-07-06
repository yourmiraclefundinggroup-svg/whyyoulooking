import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Phone } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";

interface IdentityTheftRecoveryProps {
  userId: number;
}

export function IdentityTheftRecovery({ userId }: IdentityTheftRecoveryProps) {
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: cases, isLoading } = useQuery({
    queryKey: [`/api/identity-theft-scan/${userId}`],
    enabled: !!userId
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      return await fetch(`/api/identity-theft-scan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/identity-theft-scan/${userId}`] });
    }
  });

  const completeStepMutation = useMutation({
    mutationFn: async ({ caseId, stepId }: { caseId: number; stepId: string }) => {
      return await fetch(`/api/identity-theft-cases/${caseId}/complete-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/identity-theft-cases/${userId}`] });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeCase = cases?.find((c: any) => c.status === "ACTIVE");

  if (!activeCase) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Identity Theft Recovery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Identity Theft Detected</h3>
              <p className="text-gray-500 mb-4">Run a scan to check for suspicious activity</p>
              <Button 
                onClick={() => scanMutation.mutate()}
                disabled={scanMutation.isPending}
              >
                {scanMutation.isPending ? "Scanning..." : "Scan for Identity Theft"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "HIGH": return "destructive";
      case "MEDIUM": return "secondary";
      case "LOW": return "outline";
      default: return "outline";
    }
  };

  const getStepIcon = (step: any) => {
    if (step.completed) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (step.priority === "IMMEDIATE") return <AlertTriangle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-800">Identity Theft Detected</h4>
              <p className="text-sm text-red-700">
                AI detected {activeCase.fraudulentAccounts?.length || 0} suspicious accounts with {activeCase.aiDetectionConfidence}% confidence
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recovery Progress</p>
                <p className="text-2xl font-bold">{activeCase.recoveryProgress}%</p>
              </div>
              <CircularProgress value={activeCase.recoveryProgress} size="sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Detection Confidence</p>
                <p className="text-2xl font-bold text-red-600">{activeCase.aiDetectionConfidence}%</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Est. Completion</p>
                <p className="text-lg font-bold">{activeCase.estimatedCompletionDate || "TBD"}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recovery-steps" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recovery-steps">Recovery Steps</TabsTrigger>
          <TabsTrigger value="fraudulent-accounts">Fraudulent Accounts</TabsTrigger>
          <TabsTrigger value="patterns">Suspicious Patterns</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="recovery-steps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recovery Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCase.recoverySteps?.map((step: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getStepIcon(step)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{step.action}</h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getUrgencyColor(step.priority)}>
                          {step.priority}
                        </Badge>
                        {step.estimatedTime && (
                          <span className="text-xs text-gray-500">Est. {step.estimatedTime}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {!step.completed && (
                        <Button
                          size="sm"
                          onClick={() => completeStepMutation.mutate({ 
                            caseId: activeCase.id, 
                            stepId: step.id 
                          })}
                          disabled={completeStepMutation.isPending}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraudulent-accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Fraudulent Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCase.fraudulentAccounts?.map((account: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{account.creditor}</h4>
                        <p className="text-sm text-gray-600">Account: {account.accountNumber}</p>
                        <p className="text-sm text-gray-600">Opened: {account.openedDate}</p>
                      </div>
                      <Badge variant="destructive">Fraudulent</Badge>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-2">Suspicious Factors:</h5>
                      <ul className="text-sm space-y-1">
                        {account.suspiciousFactors?.map((factor: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={() => setSelectedAccount(account)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Dispute This Account
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Activity Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeCase.suspiciousPatterns?.map((pattern: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">{pattern}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recovery Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">Police Report</h4>
                          <p className="text-sm text-gray-600">
                            {activeCase.policeReportNumber ? 
                              `Report #${activeCase.policeReportNumber}` : 
                              "Not filed yet"
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Phone className="h-8 w-8 text-green-600" />
                        <div>
                          <h4 className="font-semibold">Fraud Alerts</h4>
                          <p className="text-sm text-gray-600">
                            Active on all bureaus
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">
                      Download Affidavit
                    </Button>
                    <Button variant="outline" size="sm">
                      Contact Credit Bureaus
                    </Button>
                    <Button variant="outline" size="sm">
                      File FTC Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Detail Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Dispute Fraudulent Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Account Details</h4>
                <p>Creditor: {selectedAccount.creditor}</p>
                <p>Account: {selectedAccount.accountNumber}</p>
                <p>Opened: {selectedAccount.openedDate}</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Next Steps</h4>
                <ul className="text-sm space-y-1">
                  <li>• File identity theft report with creditor</li>
                  <li>• Submit fraud affidavit</li>
                  <li>• Request account closure</li>
                  <li>• Dispute with credit bureaus</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  Start Dispute Process
                </Button>
                <Button 
                  onClick={() => setSelectedAccount(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}