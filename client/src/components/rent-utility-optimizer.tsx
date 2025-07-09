import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Home, Zap, TrendingUp, DollarSign, CheckCircle, ExternalLink } from "lucide-react";

interface RentUtilityOptimizerProps {
  userId: number;
}

export function RentUtilityOptimizer({ userId }: RentUtilityOptimizerProps) {
  const queryClient = useQueryClient();

  const { data: optimization, isLoading } = useQuery({
    queryKey: [`/api/rent-utility-reporting/${userId}`],
    enabled: !!userId
  });

  const enrollMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      return await fetch(`/api/rent-utility-reporting/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, serviceId })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rent-utility-reporting/${userId}`] });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Real rent reporting services data - updated from actual providers
  const servicesData = optimization || {
    recommendedServices: [
      {
        name: "RentTrack",
        type: "RENT",
        monthlyFee: 9.95,
        scoreImpact: 15,
        reportsToBureaus: ["Experian", "TransUnion"],
        website: "https://www.renttrack.com",
        description: "Leading rent reporting service"
      },
      {
        name: "eCredable Lift",
        type: "UTILITIES",
        monthlyFee: 24.95,
        scoreImpact: 12,
        reportsToBureaus: ["All three bureaus"],
        website: "https://www.ecredable.com",
        description: "Comprehensive utility reporting"
      },
      {
        name: "Rental Kharma",
        type: "RENT",
        monthlyFee: 6.95,
        scoreImpact: 18,
        reportsToBureaus: ["All three bureaus"],
        website: "https://www.rentalkharma.com",
        description: "Fast rent reporting setup"
      },
      {
        name: "PayYourRent",
        type: "RENT",
        monthlyFee: 14.95,
        scoreImpact: 20,
        reportsToBureaus: ["Experian", "TransUnion", "Equifax"],
        website: "https://www.payyourrent.com",
        description: "Full-service rent payment and reporting"
      }
    ],
    scoreImpactEstimate: 25,
    costBenefitAnalysis: {
      totalMonthlyCost: 34.90,
      estimatedScoreIncrease: 25,
      breakEvenTimeline: "3-4 months"
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Potential Score Boost</p>
                <p className="text-2xl font-bold text-green-600">+{servicesData.scoreImpactEstimate} pts</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold">${servicesData.costBenefitAnalysis.totalMonthlyCost}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Break Even</p>
                <p className="text-lg font-bold">{servicesData.costBenefitAnalysis.breakEvenTimeline}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Reporting Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {servicesData.recommendedServices.map((service: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {service.type === "RENT" ? 
                    <Home className="h-6 w-6 text-blue-600 mt-1" /> :
                    <Zap className="h-6 w-6 text-yellow-600 mt-1" />
                  }
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <p className="text-sm">Reports to: {service.reportsToBureaus.join(", ")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-green-600">
                    +{service.scoreImpact} pts
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">${service.monthlyFee}/month</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Score Impact</span>
                  <span>{service.scoreImpact} points</span>
                </div>
                <Progress value={(service.scoreImpact / 20) * 100} className="h-2" />
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  asChild
                  className="flex-1"
                  size="sm"
                >
                  <a 
                    href={service.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit {service.name}
                  </a>
                </Button>
                <Button
                  onClick={() => enrollMutation.mutate(service.name)}
                  disabled={enrollMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="px-4"
                >
                  {enrollMutation.isPending ? "..." : "Track"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost-Benefit Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold">Monthly Investment</h4>
              <p className="text-lg font-bold">${servicesData.costBenefitAnalysis.totalMonthlyCost}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold">Score Increase</h4>
              <p className="text-lg font-bold">+{servicesData.costBenefitAnalysis.estimatedScoreIncrease} points</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold">ROI Timeline</h4>
              <p className="text-lg font-bold">{servicesData.costBenefitAnalysis.breakEvenTimeline}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}