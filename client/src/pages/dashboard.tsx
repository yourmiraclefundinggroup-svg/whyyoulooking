import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  ChevronRight
} from "lucide-react";
import type { CreditReport, CreditIssue, Dispute, CreditGoal } from "@shared/schema";

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
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</span>
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
    gray: { bg: "bg-gray-50 dark:bg-gray-950/30", border: "border-gray-200 dark:border-gray-800", badge: "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300", text: "text-gray-600 dark:text-gray-400" },
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
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{issue.title}</h4>
            <Badge className={`${colors.badge} text-xs`}>{config.label}</Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{issue.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
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
            <h4 className="font-medium text-gray-900 dark:text-white">{dispute.bureau}</h4>
            <Badge className={isPending ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'}>
              {dispute.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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

  const handleDispute = (issue: CreditIssue) => {
    setSelectedIssue(issue);
    setDisputeModalOpen(true);
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.firstName || 'there'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Your Credit Score</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <Target className="h-5 w-5 text-purple-500" />
                  Score Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{currentScore}</span>
                      <span className="text-gray-500 dark:text-gray-400 mx-2">/</span>
                      <span className="text-xl text-purple-600 dark:text-purple-400 font-semibold">{targetScore}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(scoreProgress)}%</span>
                  </div>
                  <Progress value={scoreProgress} className="h-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {targetScore - currentScore} points to go!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-card text-card-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
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
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
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
                      <p className="font-medium text-gray-900 dark:text-white">No active issues!</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your credit report is looking great</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Disputes */}
            <Card className="border-0 shadow-lg bg-card text-card-foreground">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
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
                      <p className="font-medium text-gray-900 dark:text-white">No disputes yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start disputing negative items to improve your score</p>
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

            {/* Credit Utilization */}
            <Card className="border-0 shadow-lg bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  Credit Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Current Utilization</span>
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
                    <span className="text-gray-500 dark:text-gray-500">0%</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Ideal: Under 30%</span>
                    <span className="text-gray-500 dark:text-gray-500">100%</span>
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
