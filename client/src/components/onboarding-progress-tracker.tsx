import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Trophy, 
  Star, 
  Target, 
  CheckCircle, 
  Clock, 
  Award,
  TrendingUp,
  Shield,
  FileText,
  CreditCard,
  Users,
  Zap,
  Gift,
  Crown,
  Sparkles,
  ChevronRight,
  Play,
  Lock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  requiredAction: string;
  experienceReward: number;
  isOptional: boolean;
  estimatedTime: string;
  helpText?: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Badge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  experienceReward: number;
  earnedAt?: string;
  isNew?: boolean;
}

interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  experiencePoints: number;
  level: number;
  badges: string[];
  streakDays: number;
  isCompleted: boolean;
}

interface OnboardingProgressTrackerProps {
  userId: number;
  embedded?: boolean;
}

export function OnboardingProgressTracker({ userId, embedded = false }: OnboardingProgressTrackerProps) {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const { toast } = useToast();

  // Icon mapping for different step categories
  const getStepIcon = (iconName: string, category: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'user': <Users className="h-6 w-6" />,
      'shield': <Shield className="h-6 w-6" />,
      'file': <FileText className="h-6 w-6" />,
      'credit-card': <CreditCard className="h-6 w-6" />,
      'target': <Target className="h-6 w-6" />,
      'trending-up': <TrendingUp className="h-6 w-6" />,
      'award': <Award className="h-6 w-6" />,
      'zap': <Zap className="h-6 w-6" />
    };
    return iconMap[iconName] || <CheckCircle className="h-6 w-6" />;
  };

  // Rarity colors for badges
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'text-gray-600 bg-gray-100';
      case 'RARE': return 'text-blue-600 bg-blue-100';
      case 'EPIC': return 'text-purple-600 bg-purple-100';
      case 'LEGENDARY': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate experience needed for next level
  const getExperienceForLevel = (level: number) => level * 1000;
  const experienceToNextLevel = progress ? getExperienceForLevel(progress.level) - progress.experiencePoints : 0;
  const currentLevelProgress = progress ? (progress.experiencePoints % 1000) / 10 : 0;

  useEffect(() => {
    loadOnboardingData();
  }, [userId]);

  const loadOnboardingData = async () => {
    try {
      setIsLoading(true);
      
      // Load progress, steps, and badges in parallel
      const [progressRes, stepsRes, badgesRes] = await Promise.all([
        apiRequest("GET", `/api/onboarding/progress/${userId}`),
        apiRequest("GET", `/api/onboarding/steps`),
        apiRequest("GET", `/api/onboarding/badges/${userId}`)
      ]);

      const progressData = await progressRes.json();
      const stepsData = await stepsRes.json();
      const badgesData = await badgesRes.json();

      setProgress(progressData);
      setSteps(stepsData.steps || []);
      setEarnedBadges(badgesData.badges || []);

      // Show notification for new badges
      const newBadges = badgesData.badges?.filter((b: Badge) => b.isNew) || [];
      if (newBadges.length > 0) {
        toast({
          title: "New Badge Earned! 🏆",
          description: `You earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`,
        });
      }

    } catch (error) {
      console.error("Failed to load onboarding data:", error);
      toast({
        title: "Loading Error",
        description: "Failed to load onboarding progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeStep = async (stepId: number) => {
    try {
      const response = await apiRequest("POST", `/api/onboarding/complete-step`, {
        userId,
        stepId
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setSteps(prev => prev.map(step => 
          step.id === stepId ? { ...step, isCompleted: true } : step
        ));
        
        setProgress(prev => prev ? {
          ...prev,
          experiencePoints: prev.experiencePoints + result.experienceAwarded,
          level: result.newLevel || prev.level,
          completedSteps: [...prev.completedSteps, stepId.toString()]
        } : null);

        // Show success notification
        toast({
          title: "Step Completed! ⭐",
          description: `+${result.experienceAwarded} XP earned`,
        });

        // Check for new badges
        if (result.newBadges && result.newBadges.length > 0) {
          setEarnedBadges(prev => [...prev, ...result.newBadges]);
          toast({
            title: "Badge Earned! 🏆",
            description: `You earned: ${result.newBadges[0].name}`,
          });
        }
      }
    } catch (error) {
      console.error("Failed to complete step:", error);
      toast({
        title: "Error",
        description: "Failed to complete step. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Loading Progress...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Welcome to ScoreShift!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Let's get your credit repair journey started!</p>
          <Button onClick={loadOnboardingData} className="mt-4">
            <Play className="h-4 w-4 mr-2" />
            Start Onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = (progress.completedSteps.length / progress.totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Trophy className="h-8 w-8 text-yellow-600" />
                {progress.level > 1 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {progress.level}
                  </Badge>
                )}
              </div>
              <div>
                <CardTitle className="text-xl">Credit Repair Journey</CardTitle>
                <CardDescription>
                  Level {progress.level} • {progress.experiencePoints.toLocaleString()} XP
                </CardDescription>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(completionPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress ({progress.completedSteps.length}/{progress.totalSteps})</span>
              <span className="text-gray-600">{experienceToNextLevel} XP to Level {progress.level + 1}</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>

          {/* Level Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Level {progress.level}</span>
              <span className="text-gray-600">Level {progress.level + 1}</span>
            </div>
            <Progress value={currentLevelProgress} className="h-2 bg-yellow-100" />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{progress.streakDays}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{earnedBadges.length}</div>
              <div className="text-xs text-gray-600">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.experiencePoints}</div>
              <div className="text-xs text-gray-600">Total XP</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Onboarding Steps
          </CardTitle>
          <CardDescription>
            Complete these steps to unlock your full credit repair potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={cn(
                  "flex items-center p-4 rounded-lg border transition-all",
                  step.isCompleted 
                    ? "bg-green-50 border-green-200" 
                    : step.isLocked
                    ? "bg-gray-50 border-gray-200 opacity-60"
                    : "bg-blue-50 border-blue-200 hover:shadow-md"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-4",
                  step.isCompleted 
                    ? "bg-green-600 text-white" 
                    : step.isLocked
                    ? "bg-gray-400 text-white"
                    : "bg-blue-600 text-white"
                )}>
                  {step.isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : step.isLocked ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    getStepIcon(step.icon, step.category)
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      +{step.experienceReward} XP
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {step.estimatedTime}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  {step.helpText && (
                    <p className="text-xs text-gray-500">{step.helpText}</p>
                  )}
                </div>

                <div className="ml-4">
                  {step.isCompleted ? (
                    <Badge className="bg-green-100 text-green-700">
                      Completed
                    </Badge>
                  ) : step.isLocked ? (
                    <Badge variant="secondary">
                      Locked
                    </Badge>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => completeStep(step.id)}
                      className="min-w-[100px]"
                    >
                      Complete
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges Collection */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Badge Collection
            </CardTitle>
            <CardDescription>
              Your achievements and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {earnedBadges.map((badge) => (
                <Dialog key={badge.badgeId}>
                  <DialogTrigger asChild>
                    <div className="relative group cursor-pointer">
                      <div className={cn(
                        "p-4 rounded-lg border-2 text-center transition-all group-hover:shadow-lg",
                        getRarityColor(badge.rarity),
                        badge.isNew && "ring-2 ring-yellow-400 animate-pulse"
                      )}>
                        <div className="text-3xl mb-2">
                          {badge.icon === 'crown' ? <Crown className="h-8 w-8 mx-auto" /> : 
                           badge.icon === 'star' ? <Star className="h-8 w-8 mx-auto" /> :
                           badge.icon === 'sparkles' ? <Sparkles className="h-8 w-8 mx-auto" /> :
                           <Award className="h-8 w-8 mx-auto" />}
                        </div>
                        <div className="font-medium text-sm">{badge.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {badge.rarity}
                        </Badge>
                      </div>
                      {badge.isNew && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-yellow-500 text-yellow-900 animate-bounce">
                            New!
                          </Badge>
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {badge.icon === 'crown' ? <Crown className="h-6 w-6" /> : 
                         badge.icon === 'star' ? <Star className="h-6 w-6" /> :
                         badge.icon === 'sparkles' ? <Sparkles className="h-6 w-6" /> :
                         <Award className="h-6 w-6" />}
                        {badge.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-gray-600">{badge.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge className={getRarityColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                        <Badge variant="outline">
                          +{badge.experienceReward} XP
                        </Badge>
                      </div>
                      {badge.earnedAt && (
                        <p className="text-sm text-gray-500">
                          Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}