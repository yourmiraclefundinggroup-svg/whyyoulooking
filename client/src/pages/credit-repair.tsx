import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
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
import { X, Clock, Search, AlertCircle, CheckCircle, Gavel, Check, FileText, Bot, Calculator, Eye, CreditCard, Calendar, ArrowUpCircle, ArrowDownCircle, Building2, Users, Wallet, FileWarning, Mail, ChevronRight } from "lucide-react";

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

function IssueTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; icon: JSX.Element; bgColor: string; textColor: string; borderColor: string }> = {
    'COLLECTION': {
      label: 'Collection',
      icon: <X className="h-3.5 w-3.5" />,
      bgColor: 'bg-red-600 dark:bg-red-700',
      textColor: 'text-white',
      borderColor: 'border-red-700 dark:border-red-600'
    },
    'CHARGE_OFF': {
      label: 'Charge-Off',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      bgColor: 'bg-rose-600 dark:bg-rose-700',
      textColor: 'text-white',
      borderColor: 'border-rose-700 dark:border-rose-600'
    },
    'LATE_PAYMENT': {
      label: 'Late Payment',
      icon: <Clock className="h-3.5 w-3.5" />,
      bgColor: 'bg-orange-500 dark:bg-orange-600',
      textColor: 'text-white',
      borderColor: 'border-orange-600 dark:border-orange-500'
    },
    'INQUIRY': {
      label: 'Inquiry',
      icon: <Search className="h-3.5 w-3.5" />,
      bgColor: 'bg-amber-500 dark:bg-amber-600',
      textColor: 'text-white',
      borderColor: 'border-amber-600 dark:border-amber-500'
    }
  };

  const { label, icon, bgColor, textColor, borderColor } = config[type] || {
    label: type,
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    bgColor: 'bg-gray-500 dark:bg-gray-600',
    textColor: 'text-white',
    borderColor: 'border-gray-600 dark:border-gray-500'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor} border ${borderColor} shadow-sm`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
import type { CreditIssue, Dispute, CreditReportUpload, CreditReportAccount, CreditReportInquiry, CreditReportCollection, DisputeLetterNew, DisputeCalendarEvent } from "@shared/schema";
import { Shield, LogOut, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Client Credit Reports Tab - Read-only view of credit reports
function ClientCreditReportsTab({ userId }: { userId: number }) {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  // Fetch client's credit report uploads
  const { data: uploads = [], isLoading: uploadsLoading } = useQuery<CreditReportUpload[]>({
    queryKey: ['/api/client/credit-report-uploads'],
  });

  // Fetch details for selected report
  const { data: reportDetails, isLoading: detailsLoading } = useQuery<{
    upload: CreditReportUpload;
    accounts: CreditReportAccount[];
    inquiries: CreditReportInquiry[];
    collections: CreditReportCollection[];
    publicRecords: any[];
    disputeItems: any[];
    letters: DisputeLetterNew[];
  }>({
    queryKey: ['/api/client/credit-report-uploads', selectedReportId],
    enabled: !!selectedReportId,
  });

  // Fetch client's dispute calendar
  const { data: calendarEvents = [] } = useQuery<DisputeCalendarEvent[]>({
    queryKey: ['/api/client/dispute-calendar'],
  });

  if (uploadsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (uploads.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Credit Reports Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Your admin will upload your credit report data. Once available, you'll be able to view your accounts, disputes, and progress here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
            Your Credit Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((upload) => (
              <motion.div
                key={upload.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedReportId(upload.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedReportId === upload.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      upload.bureau === 'EXPERIAN' ? 'bg-blue-100 dark:bg-blue-900/50' :
                      upload.bureau === 'EQUIFAX' ? 'bg-red-100 dark:bg-red-900/50' :
                      'bg-green-100 dark:bg-green-900/50'
                    }`}>
                      <Building2 className={`h-5 w-5 ${
                        upload.bureau === 'EXPERIAN' ? 'text-blue-600' :
                        upload.bureau === 'EQUIFAX' ? 'text-red-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 dark:text-white">{upload.bureau}</p>
                      <p className="text-xs text-gray-500">{new Date(upload.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-transform ${
                    selectedReportId === upload.id ? 'rotate-90 text-blue-500' : 'text-gray-400'
                  }`} />
                </div>
                
                {/* Credit Score */}
                {upload.creditScore && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500">Score</span>
                    <span className={`text-lg font-bold ${
                      (upload.creditScore || 0) >= 700 ? 'text-green-600' :
                      (upload.creditScore || 0) >= 600 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {upload.creditScore}
                    </span>
                  </div>
                )}

                <Badge 
                  className={`mt-2 ${
                    upload.parseStatus === 'succeeded' ? 'bg-green-100 text-green-700' :
                    upload.parseStatus === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {upload.parseStatus}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Details */}
      {selectedReportId && reportDetails && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Accounts</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{reportDetails.accounts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                    <Search className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Inquiries</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{reportDetails.inquiries.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                    <FileWarning className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Collections</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{reportDetails.collections.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500">Letters</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{reportDetails.letters.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accounts Section */}
          {reportDetails.accounts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Wallet className="h-5 w-5 mr-2 text-purple-600" />
                  Accounts ({reportDetails.accounts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {reportDetails.accounts.map((account, index) => (
                    <AccordionItem key={account.id} value={`account-${account.id}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center">
                            <span className="font-medium">{account.creditorName}</span>
                            <Badge className="ml-2" variant={account.status === 'Open' ? 'default' : 'secondary'}>
                              {account.status || 'Unknown'}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">{formatCurrency(account.balance || 0)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4 py-2 text-sm">
                          <div>
                            <span className="text-gray-500">Account Type:</span>
                            <span className="ml-2 font-medium">{account.accountType}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Credit Limit:</span>
                            <span className="ml-2 font-medium">{formatCurrency(account.creditLimit || 0)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Payment Status:</span>
                            <span className="ml-2 font-medium">{account.paymentStatus}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Opened:</span>
                            <span className="ml-2 font-medium">{account.dateOpened ? new Date(account.dateOpened).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Inquiries Section */}
          {reportDetails.inquiries.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Search className="h-5 w-5 mr-2 text-orange-600" />
                  Credit Inquiries ({reportDetails.inquiries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportDetails.inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{inquiry.creditorName}</p>
                        <p className="text-sm text-gray-500">{inquiry.inquiryDate ? new Date(inquiry.inquiryDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <Badge variant={inquiry.inquiryType === 'hard' ? 'destructive' : 'secondary'}>
                        {inquiry.inquiryType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Collections Section */}
          {reportDetails.collections.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <FileWarning className="h-5 w-5 mr-2 text-red-600" />
                  Collections ({reportDetails.collections.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportDetails.collections.map((collection) => (
                    <div key={collection.id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-200">{collection.agencyName}</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Original: {collection.originalCreditor}</p>
                        </div>
                        <span className="text-lg font-bold text-red-600">{formatCurrency(collection.amount || 0)}</span>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-red-600 dark:text-red-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Reported: {collection.dateReported ? new Date(collection.dateReported).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dispute Letters Section */}
          {reportDetails.letters.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  Dispute Letters ({reportDetails.letters.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportDetails.letters.map((letter) => (
                    <div key={letter.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{letter.letterType} - {letter.bureau}</p>
                          <p className="text-sm text-gray-500">Created: {new Date(letter.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge className={
                          letter.status === 'approved' ? 'bg-green-100 text-green-700' :
                          letter.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          letter.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {letter.status}
                        </Badge>
                      </div>
                      
                      {letter.downloadUrl && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <Mail className="h-4 w-4 mr-1" />
                          Download available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dispute Calendar */}
      {calendarEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Dispute Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calendarEvents.map((event) => (
                <div key={event.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mr-4 ${
                    event.status === 'completed' ? 'bg-green-500' :
                    event.status === 'sent' ? 'bg-blue-500' :
                    event.status === 'overdue' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Round {event.round}</p>
                    <p className="text-sm text-gray-500">
                      {event.scheduledSendDate ? `Scheduled: ${new Date(event.scheduledSendDate).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <Badge variant="outline">{event.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

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
    <>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300" />
        <motion.div
          className="absolute top-10 right-10 w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-600/30 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-[450px] h-[450px] bg-purple-500/20 dark:bg-purple-600/35 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5], x: [-20, 20, -20] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/15 dark:bg-cyan-500/30 rounded-full blur-[80px]"
          animate={{ x: [-80, 80, -80], y: [-50, 50, -50], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-pink-500/10 dark:bg-pink-500/25 rounded-full blur-[70px]"
          animate={{ x: [50, -50, 50], y: [30, -30, 30], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-2/3 right-10 w-[300px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[60px]"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 relative">
      {/* Header - More compact for mobile */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Credit Repair</h1>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
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
          <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-300">
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
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Active Issues</p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Disputed</p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Resolved</p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Pending</p>
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
          <TabsTrigger value="credit-reports" className="text-xs px-2 py-2">Reports</TabsTrigger>
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
                {activeIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 ${getIssueTypeColor(issue.type)}`}
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <motion.div 
                        className="flex-shrink-0"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                          {getIssueIcon(issue.type)}
                        </div>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{issue.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{issue.description}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>Creditor: {issue.creditor}</span>
                              {issue.amount && <span>Amount: {formatCurrency(issue.amount)}</span>}
                              <span>Impact: {issue.impact} points</span>
                              <span className="hidden sm:inline">Added: {formatRelativeDate(issue.dateAdded)}</span>
                            </div>
                          </div>
                          <IssueTypeBadge type={issue.type} />
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
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Only</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {activeIssues.length === 0 && (
                  <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
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
                      className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-green-900 dark:text-green-100">{issue.title}</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">{issue.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-green-600 dark:text-green-400">
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
                          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {dispute.bureau} - {issue?.title}
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {issue?.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600 dark:text-blue-400">
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
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Pending Disputes</h3>
                    <p className="text-gray-600 dark:text-gray-300">
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
                        className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                            {dispute.bureau} - {issue?.title}
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Successfully resolved and removed from credit report
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-green-600 dark:text-green-400">
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
              <div className="p-6 bg-blue-900/20 dark:bg-blue-950/40 border border-blue-700/30 dark:border-blue-600/30 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-300 dark:text-blue-200 mb-2">AI Analysis & Insights</h3>
                <p className="text-blue-400 dark:text-blue-300 mb-4">
                  Your credit repair specialist uses advanced AI tools to analyze your credit profile and create personalized strategies.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-5 w-5 text-blue-400" />
                      <span className="font-medium text-foreground">AI Credit Analysis</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Your specialist runs AI analysis on your credit file to identify priority issues and optimal dispute strategies.</p>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-5 w-5 text-green-400" />
                      <span className="font-medium text-foreground">Score Simulation</span>
                    </div>
                    <p className="text-sm text-muted-foreground">AI simulates the impact of potential credit improvements to predict your score increases.</p>
                  </div>
                </div>
              </div>
              
              {/* AI Credit Analysis - View Only for Clients */}
              <Card className="bg-card text-card-foreground border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Bot className="h-5 w-5 text-blue-400 mr-3" />
                    Your AI Credit Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      View the AI analysis results generated by your credit repair specialist.
                    </p>
                    <div>
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
                    <p className="text-sm text-gray-600 dark:text-gray-300">
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
                    <p className="text-sm text-gray-600 dark:text-gray-300">
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

        <TabsContent value="credit-reports" className="space-y-6">
          <ClientCreditReportsTab userId={userId} />
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
    </>
  );
}
