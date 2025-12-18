import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { CreditSimulatorModal } from "@/components/credit-simulator-modal";
import { SupportChat } from "@/components/support-chat";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { useUserContext } from "@/hooks/use-user-context";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  FileText, 
  RefreshCw, 
  Calculator, 
  CreditCard, 
  X, 
  Search, 
  AlertCircle, 
  Sparkles,
  Target,
  Shield,
  Zap,
  ArrowRight,
  BarChart3,
  Mail,
  ChevronRight,
  Building2,
  Calendar,
  DollarSign,
  AlertOctagon,
  Eye,
  Truck,
  MapPin,
  CheckCircle2
} from "lucide-react";
import type { CreditReport, CreditIssue, Dispute, CreditGoal, CreditReportAccount, CreditReportInquiry, CreditReportCollection, CreditReportPublicRecord, DisputeLetterNew } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MyCreditReportData {
  hasReport: boolean;
  uploadId?: number;
  uploadedAt?: string;
  fileName?: string;
  parsedScore?: number;
  accounts: CreditReportAccount[];
  inquiries: CreditReportInquiry[];
  collections: CreditReportCollection[];
  publicRecords: CreditReportPublicRecord[];
}

interface USPSTrackingStatus {
  trackingNumber: string;
  status: string;
  description: string;
  isDelivered: boolean;
  deliveryDate?: string;
  events?: Array<{
    event_time: string;
    event_date: string;
    event_city: string;
    event_state: string;
    event_description: string;
  }>;
  error?: string;
}

function InteractiveDashboardBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300" />
      
      {/* Animated orbs - more visible in dark mode */}
      <motion.div
        className="absolute top-10 right-10 w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-500/30 rounded-full blur-[100px]"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-[100px]"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-cyan-500/15 dark:bg-cyan-500/25 rounded-full blur-[80px]"
        animate={{ 
          x: [-50, 100, -50],
          y: [-30, 50, -30],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-green-500/10 dark:bg-green-500/20 rounded-full blur-[60px]"
        animate={{ 
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 4) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i * 0.5,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function CreditScoreGauge({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 740) return { color: "text-green-500", bg: "bg-green-500", label: "Excellent" };
    if (score >= 670) return { color: "text-blue-500", bg: "bg-blue-500", label: "Good" };
    if (score >= 580) return { color: "text-yellow-500", bg: "bg-yellow-500", label: "Fair" };
    return { color: "text-red-500", bg: "bg-red-500", label: "Poor" };
  };

  const { color, bg, label } = getScoreColor(score);
  const percentage = ((score - 300) / 550) * 100;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-800"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={color}
            strokeDasharray={`${percentage * 2.64} 264`}
            initial={{ strokeDasharray: "0 264" }}
            animate={{ strokeDasharray: `${percentage * 2.64} 264` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className={`text-5xl font-bold ${color}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-sm text-muted-foreground mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color }: { 
  icon: any; 
  label: string; 
  value: string | number; 
  trend?: string;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: "bg-blue-100 dark:bg-blue-900/30", icon: "text-blue-600 dark:text-blue-400", text: "text-blue-600 dark:text-blue-400" },
    red: { bg: "bg-red-100 dark:bg-red-900/30", icon: "text-red-600 dark:text-red-400", text: "text-red-600 dark:text-red-400" },
    yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: "text-yellow-600 dark:text-yellow-400", text: "text-yellow-600 dark:text-yellow-400" },
    green: { bg: "bg-green-100 dark:bg-green-900/30", icon: "text-green-600 dark:text-green-400", text: "text-green-600 dark:text-green-400" },
    purple: { bg: "bg-purple-100 dark:bg-purple-900/30", icon: "text-purple-600 dark:text-purple-400", text: "text-purple-600 dark:text-purple-400" },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card text-card-foreground">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${colors.icon}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
              <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
            </div>
            {trend && (
              <Badge className={`${colors.bg} ${colors.text} border-0`}>
                {trend}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function IssueCard({ issue, onDispute }: { issue: CreditIssue; onDispute: (issue: CreditIssue) => void }) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'COLLECTION': return { icon: AlertTriangle, color: "red", label: "Collection" };
      case 'CHARGE_OFF': return { icon: X, color: "red", label: "Charge-Off" };
      case 'LATE_PAYMENT': return { icon: Clock, color: "yellow", label: "Late Payment" };
      case 'INQUIRY': return { icon: Search, color: "blue", label: "Inquiry" };
      default: return { icon: AlertCircle, color: "gray", label: type };
    }
  };

  const config = getTypeConfig(issue.type);
  const colorClasses: Record<string, { bg: string; border: string; badge: string; text: string }> = {
    red: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300", text: "text-red-600 dark:text-red-400" },
    yellow: { bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800", badge: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300", text: "text-yellow-600 dark:text-yellow-400" },
    blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300", text: "text-blue-600 dark:text-blue-400" },
    gray: { bg: "bg-gray-50 dark:bg-gray-950/30", border: "border-gray-200 dark:border-gray-800", badge: "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300", text: "text-muted-foreground" },
  };
  const colors = colorClasses[config.color] || colorClasses.gray;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${colors.bg} ${colors.border} hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${colors.badge} flex items-center justify-center flex-shrink-0`}>
          <config.icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{issue.title}</h4>
            <Badge className={`${colors.badge} text-xs`}>{config.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Impact: <strong className={colors.text}>{issue.impact} pts</strong></span>
            {issue.amount && <span>Amount: <strong>{formatCurrency(issue.amount)}</strong></span>}
            <span>{issue.creditor}</span>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => onDispute(issue)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
          data-testid={`button-dispute-${issue.id}`}
        >
          <FileText className="h-4 w-4 mr-1" />
          Dispute
        </Button>
      </div>
    </motion.div>
  );
}

function DisputeTracker({ dispute, issue }: { dispute: Dispute; issue?: CreditIssue }) {
  const isPending = dispute.status === 'PENDING';
  
  return (
    <motion.div 
      className={`p-4 rounded-xl border ${
        isPending 
          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' 
          : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${isPending ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground">{dispute.bureau}</h4>
            <Badge className={isPending ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'}>
              {dispute.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {issue?.title || 'Dispute'} • Sent {formatRelativeDate(dispute.dateSent)}
          </p>
          {isPending && dispute.expectedResponse && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Response expected by {formatRelativeDate(dispute.expectedResponse)}
            </p>
          )}
        </div>
        {dispute.uspsTrackingNumber && (
          <Button variant="outline" size="sm" className="dark:border-gray-700 dark:text-gray-300">
            <Mail className="h-4 w-4 mr-1" />
            Track
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [simulatorModalOpen, setSimulatorModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CreditIssue | undefined>();
  const [trackingStatuses, setTrackingStatuses] = useState<Record<string, USPSTrackingStatus>>({});
  const [loadingTracking, setLoadingTracking] = useState<Record<string, boolean>>({});
  const [refreshingAll, setRefreshingAll] = useState(false);

  const { user } = useUserContext();
  const userId = user?.id || 1;

  const { data: creditReport } = useQuery<CreditReport>({
    queryKey: ['/api/credit-reports'],
  });

  const { data: creditIssues = [] } = useQuery<CreditIssue[]>({
    queryKey: ['/api/credit-issues'],
  });

  const { data: disputes = [] } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes'],
  });

  const { data: creditGoal } = useQuery<CreditGoal>({
    queryKey: ['/api/credit-goals'],
  });

  const { data: myCreditReport, isLoading: isLoadingCreditReport } = useQuery<MyCreditReportData>({
    queryKey: ['/api/my-credit-report'],
  });

  // Fetch client's tracked dispute letters
  const { data: myDisputeLetters = [] } = useQuery<DisputeLetterNew[]>({
    queryKey: ['/api/my-dispute-letters'],
  });

  const handleDispute = (issue: CreditIssue) => {
    setSelectedIssue(issue);
    setDisputeModalOpen(true);
  };

  // Fetch live USPS tracking status
  const fetchTrackingStatus = async (trackingNumber: string) => {
    setLoadingTracking(prev => ({ ...prev, [trackingNumber]: true }));
    try {
      const response = await apiRequest("GET", `/api/usps/track/${trackingNumber}`);
      const data = await response.json();
      setTrackingStatuses(prev => ({ ...prev, [trackingNumber]: data }));
      return data;
    } catch (error: any) {
      const errorStatus: USPSTrackingStatus = {
        trackingNumber,
        status: 'PENDING',
        description: 'Tracking information will be available soon',
        isDelivered: false,
        error: error.message
      };
      setTrackingStatuses(prev => ({ ...prev, [trackingNumber]: errorStatus }));
      return errorStatus;
    } finally {
      setLoadingTracking(prev => ({ ...prev, [trackingNumber]: false }));
    }
  };

  // Refresh all tracking statuses
  const refreshAllTracking = async () => {
    setRefreshingAll(true);
    const lettersWithTracking = myDisputeLetters.filter(l => l.trackingNumber);
    for (const letter of lettersWithTracking) {
      if (letter.trackingNumber) {
        await fetchTrackingStatus(letter.trackingNumber);
      }
    }
    setRefreshingAll(false);
  };

  // Get status display info with dark mode support
  const getStatusDisplay = (status: USPSTrackingStatus | undefined) => {
    if (!status) {
      return { 
        icon: Clock, 
        color: "text-gray-400 dark:text-gray-500", 
        bgColor: "bg-gray-100/50 dark:bg-gray-800/50", 
        borderColor: "border-gray-200 dark:border-gray-700",
        label: "Not Checked",
        step: 0
      };
    }
    if (status.error) {
      return { 
        icon: Building2, 
        color: "text-amber-500 dark:text-amber-400", 
        bgColor: "bg-amber-50/50 dark:bg-amber-900/30", 
        borderColor: "border-amber-200 dark:border-amber-700",
        label: "At Post Office",
        step: 1
      };
    }
    if (status.isDelivered) {
      return { 
        icon: CheckCircle2, 
        color: "text-green-600 dark:text-green-400", 
        bgColor: "bg-green-50/50 dark:bg-green-900/30", 
        borderColor: "border-green-200 dark:border-green-700",
        label: "Delivered",
        step: 3
      };
    }
    return { 
      icon: Truck, 
      color: "text-blue-600 dark:text-blue-400", 
      bgColor: "bg-blue-50/50 dark:bg-blue-900/30", 
      borderColor: "border-blue-200 dark:border-blue-700",
      label: "In Transit",
      step: 2
    };
  };

  // Interactive tracking journey component for client
  const TrackingJourney = ({ currentStep }: { currentStep: number }) => {
    const steps = [
      { label: "Accepted", icon: Building2, step: 1 },
      { label: "In Transit", icon: Truck, step: 2 },
      { label: "Delivered", icon: CheckCircle2, step: 3 }
    ];

    return (
      <div className="flex items-center justify-between py-3 px-2">
        {steps.map((step, index) => {
          const isComplete = currentStep >= step.step;
          const isCurrent = currentStep === step.step;
          const StepIcon = step.icon;
          
          return (
            <div key={step.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isComplete 
                    ? isCurrent 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-110' 
                      : 'bg-green-500 dark:bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }
                `}>
                  <StepIcon className="h-5 w-5" />
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isComplete 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-2 rounded-full transition-all duration-300
                  ${currentStep > step.step 
                    ? 'bg-green-500 dark:bg-green-600' 
                    : 'bg-gray-200 dark:bg-gray-700'
                  }
                `} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const activeIssues = creditIssues.filter(issue => issue.status === 'ACTIVE');
  const pendingDisputes = disputes.filter(dispute => dispute.status === 'PENDING');
  const resolvedIssues = creditIssues.filter(issue => issue.status === 'RESOLVED');

  const currentScore = creditReport?.creditScore || 582;
  const targetScore = creditGoal?.targetScore || 720;
  const scoreProgress = Math.min((currentScore / targetScore) * 100, 100);

  return (
    <>
      <InteractiveDashboardBackground />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
        {/* Welcome Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.firstName || 'there'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                Your credit journey is making progress
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                data-testid="button-update-report"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Report
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                onClick={() => setDisputeModalOpen(true)}
                data-testid="button-generate-dispute"
              >
                <Zap className="h-4 w-4 mr-2" />
                New Dispute
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard icon={TrendingUp} label="Current Score" value={currentScore} trend="+23 pts" color="blue" />
          <StatCard icon={AlertTriangle} label="Active Issues" value={activeIssues.length} color="red" />
          <StatCard icon={Clock} label="Pending Disputes" value={pendingDisputes.length} color="yellow" />
          <StatCard icon={CheckCircle} label="Items Removed" value={resolvedIssues.length} color="green" />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Credit Score & Progress */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Credit Score Card */}
            <Card className="border-0 shadow-xl bg-card text-card-foreground overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10" />
              <CardContent className="p-6 relative">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Your Credit Score</h3>
                  <p className="text-sm text-muted-foreground">
                    Updated {creditReport ? formatRelativeDate(creditReport.lastUpdated) : 'recently'}
                  </p>
                </div>
                
                <CreditScoreGauge score={currentScore} />
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">+23 points this month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goal Progress */}
            <Card className="border-0 shadow-lg bg-card text-card-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Target className="h-5 w-5 text-purple-500" />
                  Score Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-3xl font-bold text-foreground">{currentScore}</span>
                      <span className="text-muted-foreground mx-2">/</span>
                      <span className="text-xl text-purple-600 dark:text-purple-400 font-semibold">{targetScore}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{Math.round(scoreProgress)}%</span>
                  </div>
                  <Progress value={scoreProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {targetScore - currentScore} points to go!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-card text-card-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-between bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  onClick={() => setDisputeModalOpen(true)}
                  data-testid="button-quick-dispute"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Generate Dispute Letter
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => setSimulatorModalOpen(true)}
                  data-testid="button-score-simulator"
                >
                  <span className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Score Simulator
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  data-testid="button-view-report"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Full Report
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Issues & Disputes */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Credit Issues */}
            <Card className="border-0 shadow-lg bg-card text-card-foreground">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5 text-red-500" />
                  Credit Issues to Address
                </CardTitle>
                <Badge className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-0">
                  {activeIssues.length} active
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeIssues.length > 0 ? (
                    activeIssues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} onDispute={handleDispute} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="font-medium text-foreground">No active issues!</p>
                      <p className="text-sm text-muted-foreground mt-1">Your credit report is looking great</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Disputes */}
            <Card className="border-0 shadow-lg bg-card text-card-foreground">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Dispute Tracker
                </CardTitle>
                <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-0">
                  {pendingDisputes.length} pending
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disputes.length > 0 ? (
                    disputes.map((dispute) => (
                      <DisputeTracker 
                        key={dispute.id} 
                        dispute={dispute} 
                        issue={creditIssues.find(i => i.id === dispute.issueId)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-medium text-foreground">No disputes yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Start disputing negative items to improve your score</p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        onClick={() => setDisputeModalOpen(true)}
                      >
                        Create Your First Dispute
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracked Dispute Letters with Live USPS Tracking */}
            {myDisputeLetters.length > 0 && (
              <Card className="border-0 shadow-lg bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Mail className="h-5 w-5 text-green-500" />
                      My Dispute Letters
                    </CardTitle>
                    <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-0">
                      {myDisputeLetters.filter(l => l.trackingNumber).length} tracked
                    </Badge>
                  </div>
                  
                  {/* Prominent Refresh Button for Live Tracking */}
                  {myDisputeLetters.filter(l => l.trackingNumber).length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-green-800 dark:text-green-300">Live USPS Tracking</h3>
                          <p className="text-sm text-green-600 dark:text-green-400">Get real-time package status</p>
                        </div>
                        <Button
                          onClick={refreshAllTracking}
                          disabled={refreshingAll}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 h-12 text-base font-medium"
                          data-testid="button-refresh-all-tracking"
                        >
                          <RefreshCw className={`h-5 w-5 mr-2 ${refreshingAll ? 'animate-spin' : ''}`} />
                          {refreshingAll ? 'Refreshing...' : 'Refresh All'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myDisputeLetters.map((letter) => {
                      const trackingStatus = letter.trackingNumber ? trackingStatuses[letter.trackingNumber] : undefined;
                      const statusDisplay = getStatusDisplay(trackingStatus);
                      const isLoading = letter.trackingNumber ? loadingTracking[letter.trackingNumber] : false;
                      const StatusIcon = statusDisplay.icon;
                      
                      return (
                        <motion.div 
                          key={letter.id}
                          className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900 shadow-sm hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          data-testid={`dispute-letter-${letter.id}`}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusDisplay.bgColor} ${statusDisplay.borderColor} border`}>
                                <StatusIcon className={`h-6 w-6 ${statusDisplay.color}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">{letter.bureau} Bureau</h4>
                                <p className="text-sm text-muted-foreground">
                                  {letter.letterType || 'Dispute Letter'}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              className={`${
                                trackingStatus?.isDelivered 
                                  ? "bg-green-500 hover:bg-green-600 text-white" 
                                  : letter.trackingNumber
                                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                                    : "bg-gray-500 hover:bg-gray-600 text-white"
                              }`}
                            >
                              {letter.trackingNumber ? statusDisplay.label : letter.status}
                            </Badge>
                          </div>
                          
                          {/* Interactive Tracking Journey - Only for letters with tracking */}
                          {letter.trackingNumber && (
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                              <TrackingJourney currentStep={statusDisplay.step} />
                            </div>
                          )}

                          {/* Tracking Number & Actions */}
                          {letter.trackingNumber && (
                            <div className={`p-4 rounded-lg ${statusDisplay.bgColor} border ${statusDisplay.borderColor}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Mail className={`h-4 w-4 ${statusDisplay.color}`} />
                                  <span className="font-mono text-sm text-foreground">{letter.trackingNumber}</span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => letter.trackingNumber && fetchTrackingStatus(letter.trackingNumber)}
                                  disabled={isLoading}
                                  className="hover:bg-green-50 dark:hover:bg-green-900/30"
                                  data-testid={`button-refresh-tracking-${letter.id}`}
                                >
                                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                                  {isLoading ? 'Loading...' : 'Refresh'}
                                </Button>
                              </div>
                              
                              {/* Live USPS Status Details */}
                              {trackingStatus && !trackingStatus.error && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center gap-2 mb-2">
                                    <StatusIcon className={`h-5 w-5 ${statusDisplay.color}`} />
                                    <span className={`font-semibold ${statusDisplay.color}`}>
                                      {trackingStatus.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{trackingStatus.description}</p>
                                  {trackingStatus.deliveryDate && (
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                                      Delivered: {new Date(trackingStatus.deliveryDate).toLocaleDateString()}
                                    </p>
                                  )}
                                  {trackingStatus.events && trackingStatus.events.length > 0 && (
                                    <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700/50 rounded flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">
                                        Latest: {trackingStatus.events[0].event_city}, {trackingStatus.events[0].event_state}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Not yet checked */}
                              {!trackingStatus && (
                                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center">
                                  <p className="text-sm text-muted-foreground">
                                    Click "Refresh" to get live USPS tracking status
                                  </p>
                                </div>
                              )}
                              
                              {letter.sentDate && (
                                <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                  Sent: {formatRelativeDate(letter.sentDate)}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* No tracking - show basic info */}
                          {!letter.trackingNumber && (
                            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                              <p className="text-sm text-muted-foreground">
                                No tracking number assigned yet
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Created {letter.createdAt ? formatRelativeDate(letter.createdAt) : 'recently'}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Credit Report Details */}
            {myCreditReport?.hasReport && (
              <Card className="border-0 shadow-lg bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Eye className="h-5 w-5 text-indigo-500" />
                    My Credit Report Details
                  </CardTitle>
                  {myCreditReport.uploadedAt && (
                    <p className="text-sm text-muted-foreground">
                      Last updated: {formatRelativeDate(myCreditReport.uploadedAt)}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="accounts" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                      <TabsTrigger value="accounts" className="text-xs sm:text-sm">
                        Accounts ({myCreditReport.accounts.length})
                      </TabsTrigger>
                      <TabsTrigger value="collections" className="text-xs sm:text-sm">
                        Collections ({myCreditReport.collections.length})
                      </TabsTrigger>
                      <TabsTrigger value="inquiries" className="text-xs sm:text-sm">
                        Inquiries ({myCreditReport.inquiries.length})
                      </TabsTrigger>
                      <TabsTrigger value="public" className="text-xs sm:text-sm">
                        Public ({myCreditReport.publicRecords.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="accounts">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {myCreditReport.accounts.length > 0 ? (
                            myCreditReport.accounts.map((account) => (
                              <div 
                                key={account.id} 
                                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                data-testid={`account-item-${account.id}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-foreground">{account.creditorName}</h4>
                                      {account.accountNumberMasked && (
                                        <p className="text-xs text-muted-foreground">
                                          Account: {account.accountNumberMasked}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {account.dateOpened && (
                                          <Badge variant="outline" className="text-xs">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Opened: {new Date(account.dateOpened).toLocaleDateString()}
                                          </Badge>
                                        )}
                                        {account.accountType && (
                                          <Badge variant="outline" className="text-xs">
                                            {account.accountType}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {account.balance !== null && account.balance !== undefined && (
                                      <p className="text-sm font-medium text-foreground">
                                        ${account.balance.toLocaleString()}
                                      </p>
                                    )}
                                    <Badge 
                                      className={`mt-1 ${
                                        account.status?.toLowerCase().includes('open') 
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                          : account.status?.toLowerCase().includes('closed')
                                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                      }`}
                                    >
                                      {account.status || 'Unknown'}
                                    </Badge>
                                    {account.latePayments && (
                                      <div className="mt-2 text-xs text-muted-foreground">
                                        {account.latePayments.days30 && <span className="text-yellow-600">30d: {account.latePayments.days30} </span>}
                                        {account.latePayments.days60 && <span className="text-orange-600">60d: {account.latePayments.days60} </span>}
                                        {account.latePayments.days90 && <span className="text-red-600">90d: {account.latePayments.days90}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No accounts found in your credit report
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="collections">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {myCreditReport.collections.length > 0 ? (
                            myCreditReport.collections.map((collection) => (
                              <div 
                                key={collection.id} 
                                className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                                data-testid={`collection-item-${collection.id}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                      <AlertOctagon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-foreground">{collection.agencyName}</h4>
                                      {collection.originalCreditor && (
                                        <p className="text-xs text-muted-foreground">
                                          Original: {collection.originalCreditor}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {collection.amount !== null && collection.amount !== undefined && (
                                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                        ${collection.amount.toLocaleString()}
                                      </p>
                                    )}
                                    {collection.dateReported && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Reported: {new Date(collection.dateReported).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                              </div>
                              <p className="text-muted-foreground">No collections on your report!</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="inquiries">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {myCreditReport.inquiries.length > 0 ? (
                            myCreditReport.inquiries.map((inquiry) => (
                              <div 
                                key={inquiry.id} 
                                className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                                data-testid={`inquiry-item-${inquiry.id}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                      <Search className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-foreground">{inquiry.creditorName}</h4>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {inquiry.inquiryType || 'Hard Inquiry'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {inquiry.inquiryDate && (
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(inquiry.inquiryDate).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                              </div>
                              <p className="text-muted-foreground">No recent inquiries</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="public">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {myCreditReport.publicRecords.length > 0 ? (
                            myCreditReport.publicRecords.map((record) => (
                              <div 
                                key={record.id} 
                                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                                data-testid={`public-record-item-${record.id}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-foreground">{record.recordType}</h4>
                                    {record.court && (
                                      <p className="text-xs text-muted-foreground">{record.court}</p>
                                    )}
                                    {record.dateFiled && (
                                      <Badge variant="outline" className="text-xs mt-1">
                                        Filed: {new Date(record.dateFiled).toLocaleDateString()}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                              </div>
                              <p className="text-muted-foreground">No public records</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Credit Utilization */}
            <Card className="border-0 shadow-lg bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  Credit Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Current Utilization</span>
                    <span className={`text-2xl font-bold ${
                      (creditReport?.utilizationRate || 45) > 30 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {creditReport?.utilizationRate || 45}%
                    </span>
                  </div>
                  <Progress 
                    value={creditReport?.utilizationRate || 45} 
                    className={`h-3 ${(creditReport?.utilizationRate || 45) > 30 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">0%</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Ideal: Under 30%</span>
                    <span className="text-muted-foreground">100%</span>
                  </div>
                  {(creditReport?.utilizationRate || 45) > 30 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        💡 <strong>Tip:</strong> Paying down balances can quickly boost your score
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <DisputeLetterModal
        open={disputeModalOpen}
        onOpenChange={setDisputeModalOpen}
        issue={selectedIssue}
      />

      <CreditSimulatorModal
        open={simulatorModalOpen}
        onOpenChange={setSimulatorModalOpen}
        currentScore={currentScore}
      />

      {/* Support Chat Widget */}
      <SupportChat userId={userId} />
    </>
  );
}
