import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, CreditCard, TrendingUp, CheckCircle, AlertTriangle, DollarSign, Target, ExternalLink, Lock } from "lucide-react";

interface BusinessCreditPortalProps {
  userId: number;
}

export function BusinessCreditPortal({ userId }: BusinessCreditPortalProps) {
  const [businessAppUrl] = useState("https://your-business-credit-app.com"); // Replace with your actual app URL

  const { data: personalCreditScore } = useQuery({
    queryKey: [`/api/credit-reports/${userId}`],
    enabled: !!userId
  });

  // Get current credit score (demo data shows 720, but use real data when available)
  const currentScore = personalCreditScore?.creditScore || 720;
  const isEligible = currentScore >= 680;

  const handleAccessBusinessCredit = () => {
    // Open your business credit app in a new tab
    window.open(businessAppUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Business Credit Eligibility Check */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Business Credit Eligibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Score Display */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {currentScore}
            </div>
            <p className="text-lg font-medium text-gray-700">Your Current Credit Score</p>
            <Badge 
              variant={isEligible ? "default" : "secondary"} 
              className={`mt-2 ${isEligible ? 'bg-green-600' : 'bg-gray-500'}`}
            >
              {isEligible ? "✓ Business Credit Eligible" : "⚠ Not Yet Eligible"}
            </Badge>
          </div>

          {/* Eligibility Status */}
          {isEligible ? (
            <div className="space-y-4">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      🎉 Congratulations! You're Eligible for Business Credit
                    </h3>
                    <p className="text-green-700 mb-4">
                      Your credit score of {currentScore} qualifies you for our comprehensive business credit building program.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Business credit cards up to $50K</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">SBA loan qualification</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Equipment financing options</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Trade line establishment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-blue-50">
                <CardContent className="p-6 text-center">
                  <Building2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Ready to Build Business Credit?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Access our complete business credit building platform with step-by-step guidance, 
                    funding applications, and expert support.
                  </p>
                  
                  <Button 
                    onClick={handleAccessBusinessCredit}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Access Business Credit Platform
                  </Button>
                  
                  <p className="text-xs text-gray-500 mt-3">
                    Opens in new tab • Secure platform • No additional login required
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">
                      Continue Building Your Credit
                    </h3>
                    <p className="text-orange-700 mb-4">
                      You need a credit score of 680+ to qualify for business credit. 
                      You're currently at {currentScore} - keep working on your personal credit first!
                    </p>
                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress to Business Credit</span>
                        <span className="text-sm text-gray-600">{Math.round((currentScore / 680) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-orange-500 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((currentScore / 680) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {680 - currentScore} points to go!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Locked Business Credit Platform */}
              <Card className="border-2 border-gray-300 bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-6 text-center opacity-60">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Business Credit Platform
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Unlock access to our business credit building platform when you reach 680+ credit score.
                  </p>
                  
                  <Button 
                    disabled
                    size="lg"
                    className="px-8 py-3"
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    Requires 680+ Credit Score
                  </Button>
                  
                  <p className="text-xs text-gray-400 mt-3">
                    Focus on personal credit repair first • We'll notify you when you qualify
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* What You'll Get Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                What You'll Get When Eligible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: <CreditCard className="h-5 w-5 text-blue-600" />,
                    title: "Business Credit Cards",
                    description: "Secured business credit cards with up to $50K limits"
                  },
                  {
                    icon: <DollarSign className="h-5 w-5 text-green-600" />,
                    title: "SBA Loan Access", 
                    description: "Qualification for Small Business Administration loans"
                  },
                  {
                    icon: <Building2 className="h-5 w-5 text-purple-600" />,
                    title: "Trade Line Building",
                    description: "Establish vendor accounts and business credit history"
                  },
                  {
                    icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
                    title: "Credit Monitoring",
                    description: "Business credit score tracking and improvement plans"
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                    {feature.icon}
                    <div>
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}