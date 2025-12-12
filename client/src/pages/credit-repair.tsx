import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { USPSTracking } from "@/components/usps-tracking";
import { AICreditAnalysis } from "@/components/ai-credit-analysis";
import { CreditSimulatorModal } from "@/components/credit-simulator-modal";
import { CreditMonitoringConnections } from "@/components/credit-monitoring-connections";
import { CreditUtilizationOptimizer } from "@/components/credit-utilization-optimizer";
import { LoanReadinessAssessment } from "@/components/loan-readiness-assessment";
import { CreditMixOptimizer } from "@/components/credit-mix-optimizer";
import { IdentityTheftRecovery } from "@/components/identity-theft-recovery";
import { RentUtilityOptimizer } from "@/components/rent-utility-optimizer";
import { BankAccountIntegration } from "@/components/bank-account-integration";
import { TaxSoftwareIntegration } from "@/components/tax-software-integration";
import { EmploymentVerification } from "@/components/employment-verification";
import { BusinessCreditPortal } from "@/components/business-credit-portal";
import { SecureChat } from "@/components/secure-chat";
import { PasswordReset } from "@/components/password-reset";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatRelativeDate, getIssueTypeColor, getDisputeStatusColor } from "@/lib/utils";
import { X, Clock, Search, AlertCircle, CheckCircle, Gavel, Check, FileText, Bot, Calculator, Eye } from "lucide-react";

function getIssueIcon(type: string) {
  switch (type) {
    case 'COLLECTION':
    case 'CHARGE_OFF':
      return <X className="h-4 w-4 text-white" />;
    case 'LATE_PAYMENT':
      return <Clock className="h-4 w-4 text-white" />;
    case 'INQUIRY':
      return <Search className="h-4 w-4 text-white" />;
    default:
      return <AlertCircle className="h-4 w-4 text-white" />;
  }
}
import type { CreditIssue, Dispute } from "@shared/schema";
import { Shield, LogOut, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function CreditRepair() {
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CreditIssue | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, canCreateDisputes, isClientViewer, logout } = useUserContext();

  // Use current user ID from context or default to 1
  const userId = user?.id || 1;

  const { data: creditIssues = [], isLoading: issuesLoading } = useQuery<CreditIssue[]>({
    queryKey: ['/api/credit-issues', userId],
  });

  const { data: disputes = [], isLoading: disputesLoading } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes', userId],
  });

  const { data: creditConnections = [] } = useQuery({
    queryKey: ['/api/credit-monitoring-connections', userId],
    queryFn: () => fetch(`/api/credit-monitoring-connections?userId=${userId}`).then(res => res.json()),
  });

  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CreditIssue> }) => {
      const response = await apiRequest("PATCH", `/api/credit-issues/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credit-issues', userId] });
      toast({
        title: "Success",
        description: "Issue updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update issue",
        variant: "destructive",
      });
    },
  });

  const handleDispute = (issue: CreditIssue) => {
    setSelectedIssue(issue);
    setDisputeModalOpen(true);
  };

  const handleMarkResolved = (issue: CreditIssue) => {
    updateIssueMutation.mutate({
      id: issue.id,
      updates: { status: 'RESOLVED' }
    });
  };

  const activeIssues = creditIssues.filter(issue => issue.status === 'ACTIVE');
  const disputedIssues = creditIssues.filter(issue => issue.status === 'DISPUTED');
  const resolvedIssues = creditIssues.filter(issue => issue.status === 'RESOLVED');

  const pendingDisputes = disputes.filter(dispute => dispute.status === 'PENDING' || dispute.status === 'SENT' || dispute.status === 'DELIVERED');
  const resolvedDisputes = disputes.filter(dispute => dispute.status === 'RESOLVED');

  if (issuesLoading || disputesLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      {/* Header - More compact for mobile */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Credit Repair</h1>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
        {isClientViewer ? (
          <div className="mt-3 space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                <Eye className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-700 dark:text-blue-200" />
                <span><strong>Client View:</strong> This shows the work being done on your credit file. 
                You can view dispute progress and tracking but cannot create new disputes.</span>
              </p>
            </div>
            
            {/* Credit Monitoring Connections Status */}
            <div className="space-y-3">
              {creditConnections.length > 0 ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">Connected Credit Monitoring</h3>
                  {creditConnections.map((connection: any) => (
                    <div key={connection.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{connection.provider}</p>
                          <p className="text-xs text-green-700">
                            Connected {connection.accountEmail} • Last sync: {new Date(connection.lastSyncDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-red-900">Connect to Experian</h3>
                        <p className="text-xs text-red-700">Get real-time credit monitoring and updates</p>
                      </div>
                    </div>
                    <Link href="/experian">
                      <Button 
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Dispute negative items to improve your credit score.
          </p>
        )}
      </div>

      {/* Summary Cards - Better mobile grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Active Issues</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{activeIssues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Gavel className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Disputed</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{disputedIssues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Resolved</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{resolvedIssues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{pendingDisputes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="space-y-4 sm:space-y-6">
        <TabsList className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 h-auto gap-1 p-1">
          <TabsTrigger value="issues" className="text-xs px-2 py-2">Issues</TabsTrigger>
          <TabsTrigger value="disputes" className="text-xs px-2 py-2">Disputes</TabsTrigger>
          <TabsTrigger value="monitoring" className="text-xs px-2 py-2">Monitor</TabsTrigger>
          <TabsTrigger value="utilization" className="text-xs px-2 py-2">Utilization</TabsTrigger>
          <TabsTrigger value="loan-readiness" className="text-xs px-2 py-2">Loan</TabsTrigger>
          <TabsTrigger value="credit-mix" className="text-xs px-2 py-2">Mix</TabsTrigger>
          <TabsTrigger value="identity-theft" className="text-xs px-2 py-2">ID Theft</TabsTrigger>
          <TabsTrigger value="rent-utility" className="text-xs px-2 py-2">Rent</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs px-2 py-2">Verify</TabsTrigger>
          <TabsTrigger value="business-credit" className="text-xs px-2 py-2">Business</TabsTrigger>
          <TabsTrigger value="chat" className="text-xs px-2 py-2">Chat</TabsTrigger>
          <TabsTrigger value="password-reset" className="text-xs px-2 py-2">Password</TabsTrigger>
          <TabsTrigger value="ai-tools" className="text-xs px-2 py-2">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4 sm:space-y-6">
          {/* Active Issues */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <span>Active Credit Issues</span>
                <Badge variant="destructive" className="text-xs">{activeIssues.length} Issues</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 sm:space-y-4">
                {activeIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 rounded-lg border ${getIssueTypeColor(issue.type)}`}
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                          {getIssueIcon(issue.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{issue.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                              <span>Creditor: {issue.creditor}</span>
                              {issue.amount && <span>Amount: {formatCurrency(issue.amount)}</span>}
                              <span>Impact: {issue.impact} points</span>
                              <span className="hidden sm:inline">Added: {formatRelativeDate(issue.dateAdded)}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {issue.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 flex-shrink-0">
                      {canCreateDisputes ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none text-xs"
                            onClick={() => handleDispute(issue)}
                          >
                            Dispute
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-none text-xs"
                            onClick={() => handleMarkResolved(issue)}
                            disabled={updateIssueMutation.isPending}
                          >
                            Mark Resolved
                          </Button>
                        </>
                      ) : (
                        <div className="text-xs text-gray-500 text-center p-2">
                          View Only
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {activeIssues.length === 0 && (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Active Issues</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Great! You don't have any active credit issues to address.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resolved Issues */}
          {resolvedIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resolved Issues</span>
                  <Badge variant="secondary">{resolvedIssues.length} Resolved</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resolvedIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-green-900">{issue.title}</h4>
                        <p className="text-sm text-green-700">{issue.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-green-600">
                          <span>Creditor: {issue.creditor}</span>
                          {issue.amount && <span>Amount: {formatCurrency(issue.amount)}</span>}
                          <span>Was impacting: {Math.abs(issue.impact)} points</span>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Resolved</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          {/* Pending Disputes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Disputes</span>
                <Badge variant="secondary">{pendingDisputes.length} Pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingDisputes.map((dispute) => {
                  const issue = creditIssues.find(i => i.id === dispute.issueId);
                  return (
                    <div key={dispute.id} className="space-y-4">
                      <div
                        className={`flex items-start space-x-4 p-4 rounded-lg border ${getDisputeStatusColor(dispute.status)}`}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse mt-2"></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-blue-900">
                            {dispute.bureau} - {issue?.title}
                          </h4>
                          <p className="text-sm text-blue-700">
                            {issue?.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                            <span>Sent: {formatRelativeDate(dispute.dateSent)}</span>
                            <span>Expected Response: {formatRelativeDate(dispute.expectedResponse)}</span>
                            <span>Bureau: {dispute.bureau}</span>
                          </div>
                        </div>
                        <Badge className="bg-blue-600">{dispute.status}</Badge>
                      </div>
                      <USPSTracking dispute={dispute} />
                    </div>
                  );
                })}
                {pendingDisputes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Disputes</h3>
                    <p className="text-gray-600">
                      You don't have any disputes currently pending with credit bureaus.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resolved Disputes */}
          {resolvedDisputes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resolved Disputes</span>
                  <Badge variant="secondary">{resolvedDisputes.length} Resolved</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resolvedDisputes.map((dispute) => {
                    const issue = creditIssues.find(i => i.id === dispute.issueId);
                    return (
                      <div
                        key={dispute.id}
                        className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-green-900">
                            {dispute.bureau} - {issue?.title}
                          </h4>
                          <p className="text-sm text-green-700">
                            Successfully resolved and removed from credit report
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-green-600">
                            <span>Sent: {formatRelativeDate(dispute.dateSent)}</span>
                            <span>Resolved: {formatRelativeDate(dispute.actualResponse || dispute.dateSent)}</span>
                            <span>Bureau: {dispute.bureau}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-600">Resolved</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <CreditMonitoringConnections userId={userId} />
        </TabsContent>

        <TabsContent value="utilization" className="space-y-6">
          <CreditUtilizationOptimizer userId={userId} />
        </TabsContent>

        <TabsContent value="loan-readiness" className="space-y-6">
          <LoanReadinessAssessment userId={userId} />
        </TabsContent>

        <TabsContent value="credit-mix" className="space-y-6">
          <CreditMixOptimizer userId={userId} />
        </TabsContent>

        <TabsContent value="identity-theft" className="space-y-6">
          <IdentityTheftRecovery userId={userId} />
        </TabsContent>

        <TabsContent value="rent-utility" className="space-y-6">
          <RentUtilityOptimizer userId={userId} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Secure Financial Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Connect your financial accounts to strengthen loan applications and improve credit qualification
                </p>
                <Tabs defaultValue="bank-accounts" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="bank-accounts">Bank Accounts</TabsTrigger>
                    <TabsTrigger value="tax-software">Tax Software</TabsTrigger>
                    <TabsTrigger value="employment">Employment</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="bank-accounts">
                    <BankAccountIntegration userId={userId} />
                  </TabsContent>
                  
                  <TabsContent value="tax-software">
                    <TaxSoftwareIntegration userId={userId} />
                  </TabsContent>
                  
                  <TabsContent value="employment">
                    <EmploymentVerification userId={userId} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business-credit" className="space-y-6">
          <BusinessCreditPortal userId={userId} />
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <SecureChat userId={userId} userType="client" />
        </TabsContent>

        <TabsContent value="password-reset" className="space-y-6">
          <PasswordReset />
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-6">
          {isClientViewer ? (
            // Client View - Limited AI Tools
            <div className="space-y-6">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">AI Analysis & Insights</h3>
                <p className="text-blue-700 mb-4">
                  Your credit repair specialist uses advanced AI tools to analyze your credit profile and create personalized strategies.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">AI Credit Analysis</span>
                    </div>
                    <p className="text-sm text-gray-600">Your specialist runs AI analysis on your credit file to identify priority issues and optimal dispute strategies.</p>
                  </div>
                  <div className="p-4 bg-white rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Score Simulation</span>
                    </div>
                    <p className="text-sm text-gray-600">AI simulates the impact of potential credit improvements to predict your score increases.</p>
                  </div>
                </div>
              </div>
              
              {/* AI Credit Analysis - View Only for Clients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="h-5 w-5 text-blue-600 mr-3" />
                    Your AI Credit Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      View the AI analysis results generated by your credit repair specialist.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                      <AICreditAnalysis userId={userId} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Admin/Beta Tester View - Full AI Tools
            <div className="space-y-6">
              {/* AI Credit Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="h-5 w-5 text-blue-600 mr-3" />
                    AI Credit Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Get personalized AI-powered recommendations for your credit repair strategy.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                      <AICreditAnalysis userId={userId} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Score Simulator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 text-green-600 mr-3" />
                    Credit Score Simulator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Simulate how different actions could impact your credit score.
                    </p>
                    <CreditSimulatorModal 
                      open={false} 
                      onOpenChange={() => {}} 
                      currentScore={650} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!isClientViewer && (
        <DisputeLetterModal
          open={disputeModalOpen}
          onOpenChange={setDisputeModalOpen}
          issue={selectedIssue}
        />
      )}
    </div>
  );
}
