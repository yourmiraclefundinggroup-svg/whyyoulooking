import { useEffect, useState } from "react";
import { calculateCreditScorePercentage, calculateStrokeDashoffset, getCreditRating, getCreditRatingColor } from "@/lib/utils";

interface CreditScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
}

export function CreditScoreCircle({ score, size = "lg", showAnimation = true }: CreditScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(showAnimation ? 300 : score);
  const percentage = calculateCreditScorePercentage(animatedScore);
  const strokeDashoffset = calculateStrokeDashoffset(percentage);
  const rating = getCreditRating(score);
  const ratingColor = getCreditRatingColor(rating);

  const sizes = {
    sm: { width: 80, height: 80, radius: 30, strokeWidth: 6, textSize: "text-lg", subtextSize: "text-xs" },
    md: { width: 120, height: 120, radius: 45, strokeWidth: 7, textSize: "text-2xl", subtextSize: "text-sm" },
    lg: { width: 160, height: 160, radius: 60, strokeWidth: 8, textSize: "text-3xl", subtextSize: "text-sm" }
  };

  const config = sizes[size];
  const circumference = 2 * Math.PI * config.radius;

  useEffect(() => {
    if (!showAnimation) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = (score - 300) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newScore = 300 + (increment * currentStep);
      setAnimatedScore(Math.min(newScore, score));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedScore(score);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, showAnimation]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            stroke="#E5E7EB"
            strokeWidth={config.strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            stroke="hsl(var(--success-green))"
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (percentage / 100) * circumference}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold text-gray-900 ${config.textSize}`}>
              {Math.round(animatedScore)}
            </div>
            <div className={`${ratingColor} ${config.subtextSize}`}>
              {rating}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
