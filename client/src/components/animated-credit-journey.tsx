import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Calendar,
  MapPin,
  CheckCircle,
  ArrowRight,
  Zap,
  Award,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Sparkles,
  Crown,
  Gift,
  ChevronRight,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditJourneyMilestone {
  id: string;
  score: number;
  date: string;
  title: string;
  description: string;
  type: "IMPROVEMENT" | "DISPUTE_SUCCESS" | "GOAL_ACHIEVED" | "SETBACK" | "MILESTONE";
  impact: number; // Points changed
  actionTaken?: string;
  isCompleted: boolean;
  isActive: boolean;
  category: "SCORE" | "DISPUTES" | "PAYMENTS" | "UTILIZATION" | "ACCOUNTS";
}

interface CreditJourneyProps {
  userId: number;
  currentScore: number;
  targetScore: number;
  startingScore?: number;
  embedded?: boolean;
}

export function AnimatedCreditJourney({ 
  userId, 
  currentScore, 
  targetScore, 
  startingScore = 550,
  embedded = false 
}: CreditJourneyProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const pathRef = useRef<SVGPathElement>(null);

  // Sample journey milestones - in production, this would come from API
  const milestones: CreditJourneyMilestone[] = [
    {
      id: "start",
      score: startingScore,
      date: "2024-01-15",
      title: "Journey Begins",
      description: "Started credit repair journey with ScoreShift",
      type: "MILESTONE",
      impact: 0,
      isCompleted: true,
      isActive: false,
      category: "SCORE"
    },
    {
      id: "first_dispute",
      score: startingScore + 25,
      date: "2024-02-28",
      title: "First Dispute Success",
      description: "Removed outdated collection account",
      type: "DISPUTE_SUCCESS",
      impact: 25,
      actionTaken: "Disputed collection with Experian",
      isCompleted: true,
      isActive: false,
      category: "DISPUTES"
    },
    {
      id: "utilization_fix",
      score: startingScore + 45,
      date: "2024-04-10",
      title: "Utilization Optimized",
      description: "Reduced credit card utilization below 10%",
      type: "IMPROVEMENT",
      impact: 20,
      actionTaken: "Paid down credit card balances",
      isCompleted: true,
      isActive: false,
      category: "UTILIZATION"
    },
    {
      id: "payment_streak",
      score: startingScore + 65,
      date: "2024-06-15",
      title: "Perfect Payment History",
      description: "Achieved 6 months of on-time payments",
      type: "MILESTONE",
      impact: 20,
      actionTaken: "Automated payment reminders",
      isCompleted: true,
      isActive: false,
      category: "PAYMENTS"
    },
    {
      id: "current",
      score: currentScore,
      date: new Date().toISOString().split('T')[0],
      title: "Current Position",
      description: "Your credit score today",
      type: "MILESTONE",
      impact: currentScore - (startingScore + 65),
      isCompleted: false,
      isActive: true,
      category: "SCORE"
    },
    {
      id: "goal_750",
      score: Math.min(targetScore, 750),
      date: "2024-12-31",
      title: "Target Achievement",
      description: "Reach excellent credit score range",
      type: "GOAL_ACHIEVED",
      impact: Math.min(targetScore, 750) - currentScore,
      actionTaken: "Continue dispute process and maintain habits",
      isCompleted: false,
      isActive: false,
      category: "SCORE"
    }
  ];

  // Calculate journey progress
  const totalProgress = ((currentScore - startingScore) / (targetScore - startingScore)) * 100;
  const scoreImprovement = currentScore - startingScore;
  const remainingPoints = targetScore - currentScore;

  // Animation control
  useEffect(() => {
    if (autoPlay && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCurrentMilestone(prev => (prev + 1) % milestones.length);
      }, 3000);
    } else if (!autoPlay && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, milestones.length]);

  // Animate progress bar
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setAnimationProgress(totalProgress);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, totalProgress]);

  const handleStartAnimation = () => {
    setIsAnimating(true);
    setAnimationProgress(0);
    setCurrentMilestone(0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 740) return "text-green-600 bg-green-100";
    if (score >= 670) return "text-blue-600 bg-blue-100";
    if (score >= 580) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getMilestoneIcon = (type: string, category: string) => {
    switch (type) {
      case "DISPUTE_SUCCESS": return <CheckCircle className="h-5 w-5" />;
      case "GOAL_ACHIEVED": return <Trophy className="h-5 w-5" />;
      case "IMPROVEMENT": return <TrendingUp className="h-5 w-5" />;
      case "SETBACK": return <Activity className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "SCORE": return "bg-purple-100 text-purple-700";
      case "DISPUTES": return "bg-red-100 text-red-700";
      case "PAYMENTS": return "bg-green-100 text-green-700";
      case "UTILIZATION": return "bg-blue-100 text-blue-700";
      case "ACCOUNTS": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // SVG path for journey line
  const generateJourneyPath = () => {
    const width = 800;
    const height = 200;
    const padding = 40;
    const stepWidth = (width - padding * 2) / (milestones.length - 1);
    
    let path = `M ${padding} ${height - padding}`;
    
    milestones.forEach((milestone, index) => {
      const x = padding + index * stepWidth;
      const scoreRange = targetScore - startingScore;
      const scoreProgress = (milestone.score - startingScore) / scoreRange;
      const y = height - padding - (scoreProgress * (height - padding * 2));
      
      if (index === 0) {
        path += `L ${x} ${y}`;
      } else {
        // Create smooth curves between points
        const prevX = padding + (index - 1) * stepWidth;
        const controlX = (prevX + x) / 2;
        path += ` Q ${controlX} ${y} ${x} ${y}`;
      }
    });
    
    return path;
  };

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <LineChart className="h-8 w-8 text-purple-600" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Credit Score Journey</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your path to financial freedom
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAutoPlay(!autoPlay)}
                className="flex items-center gap-2"
              >
                {autoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {autoPlay ? "Pause" : "Play"}
              </Button>
              <Button
                size="sm"
                onClick={handleStartAnimation}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Replay
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{startingScore}</div>
              <div className="text-sm text-blue-600">Starting Score</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{currentScore}</div>
              <div className="text-sm text-green-600">Current Score</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">+{scoreImprovement}</div>
              <div className="text-sm text-purple-600">Points Gained</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{targetScore}</div>
              <div className="text-sm text-yellow-600">Target Score</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Journey Progress</span>
              <span className="text-gray-600 dark:text-gray-300">
                {Math.round(totalProgress)}% Complete
              </span>
            </div>
            <Progress 
              value={isAnimating ? animationProgress : totalProgress} 
              className="h-4 bg-gradient-to-r from-blue-100 to-purple-100"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{startingScore}</span>
              <span>{targetScore}</span>
            </div>
          </div>

          {/* Journey Timeline */}
          <div className="relative">
            <div className="flex flex-col space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className={cn(
                    "flex items-center p-4 rounded-lg border-2 transition-all duration-500 cursor-pointer",
                    milestone.isActive 
                      ? "border-purple-300 bg-purple-50 shadow-lg scale-105" 
                      : milestone.isCompleted
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50 dark:bg-gray-800",
                    currentMilestone === index && "ring-2 ring-purple-400 animate-pulse"
                  )}
                  onClick={() => setCurrentMilestone(index)}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-all",
                    milestone.isActive 
                      ? "bg-purple-600 text-white" 
                      : milestone.isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-gray-400 text-white"
                  )}>
                    {getMilestoneIcon(milestone.type, milestone.category)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{milestone.title}</h4>
                      <Badge 
                        className={cn(
                          "text-xs",
                          getScoreColor(milestone.score)
                        )}
                      >
                        {milestone.score}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getCategoryColor(milestone.category))}
                      >
                        {milestone.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{milestone.description}</p>
                    {milestone.actionTaken && (
                      <p className="text-xs text-gray-500">Action: {milestone.actionTaken}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className={cn(
                      "text-lg font-bold",
                      milestone.impact > 0 ? "text-green-600" : 
                      milestone.impact < 0 ? "text-red-600" : "text-gray-600 dark:text-gray-300"
                    )}>
                      {milestone.impact > 0 ? "+" : ""}{milestone.impact}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(milestone.date).toLocaleDateString()}
                    </div>
                  </div>

                  {index < milestones.length - 1 && (
                    <ArrowRight className="ml-4 h-5 w-5 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Journey Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Score Breakdown</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Payment History (35%)</span>
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Credit Utilization (30%)</span>
                    <span className="text-sm font-medium text-blue-600">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Credit History (15%)</span>
                    <span className="text-sm font-medium text-yellow-600">Fair</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Credit Mix (10%)</span>
                    <span className="text-sm font-medium text-blue-600">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New Credit (10%)</span>
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium">Next Milestones</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-sm">Complete 2 more disputes</span>
                    <Badge variant="outline" className="text-xs">+15-25 pts</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">Reduce utilization to 5%</span>
                    <Badge variant="outline" className="text-xs">+10-15 pts</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm">Add authorized user account</span>
                    <Badge variant="outline" className="text-xs">+5-10 pts</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Journey Achievements
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 text-green-700 px-3 py-1">
                <Trophy className="h-4 w-4 mr-1" />
                First Dispute Win
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                50+ Point Improvement
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
                <Clock className="h-4 w-4 mr-1" />
                6 Month Streak
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-700 px-3 py-1">
                <Star className="h-4 w-4 mr-1" />
                Utilization Master
              </Badge>
              <Badge className="bg-pink-100 text-pink-700 px-3 py-1 opacity-50">
                <Crown className="h-4 w-4 mr-1" />
                Credit Champion (Locked)
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}