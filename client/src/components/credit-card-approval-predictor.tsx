import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, TrendingUp, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";

interface CreditCardApprovalPredictorProps {
  userId: number;
}

export function CreditCardApprovalPredictor({ userId }: CreditCardApprovalPredictorProps) {
  const [selectedCard, setSelectedCard] = useState("");
  const [customCard, setCustomCard] = useState({
    cardName: "",
    bank: "",
    annualFee: "",
    minCreditScore: ""
  });

  const queryClient = useQueryClient();

  const { data: predictions, isLoading } = useQuery({
    queryKey: [`/api/credit-card-predictions/${userId}`],
    enabled: !!userId
  });

  const predictMutation = useMutation({
    mutationFn: async (cardData: any) => {
      return await fetch(`/api/credit-card-predictions/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cardData })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/credit-card-predictions/${userId}`] });
    }
  });

  const popularCards = [
    { name: "Chase Sapphire Preferred", bank: "Chase", type: "Travel Rewards" },
    { name: "Capital One Venture", bank: "Capital One", type: "Travel" },
    { name: "Citi Double Cash", bank: "Citi", type: "Cashback" },
    { name: "Discover It", bank: "Discover", type: "Cashback" },
    { name: "American Express Gold", bank: "American Express", type: "Rewards" }
  ];

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return "text-green-600";
      case "MEDIUM": return "text-yellow-600";
      case "HIGH": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const handlePredict = () => {
    const cardData = selectedCard === "custom" ? customCard : 
      popularCards.find(card => card.name === selectedCard);
    
    if (cardData) {
      predictMutation.mutate(cardData);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Card Approval Predictor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardSelect">Select Credit Card</Label>
              <Select value={selectedCard} onValueChange={setSelectedCard}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a credit card" />
                </SelectTrigger>
                <SelectContent>
                  {popularCards.map((card) => (
                    <SelectItem key={card.name} value={card.name}>
                      {card.name} - {card.bank}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCard === "custom" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Card Name</Label>
                  <Input
                    id="cardName"
                    value={customCard.cardName}
                    onChange={(e) => setCustomCard(prev => ({ ...prev, cardName: e.target.value }))}
                    placeholder="e.g., Platinum Card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank</Label>
                  <Input
                    id="bank"
                    value={customCard.bank}
                    onChange={(e) => setCustomCard(prev => ({ ...prev, bank: e.target.value }))}
                    placeholder="e.g., Chase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualFee">Annual Fee ($)</Label>
                  <Input
                    id="annualFee"
                    type="number"
                    value={customCard.annualFee}
                    onChange={(e) => setCustomCard(prev => ({ ...prev, annualFee: e.target.value }))}
                    placeholder="95"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minCreditScore">Min Credit Score</Label>
                  <Input
                    id="minCreditScore"
                    type="number"
                    value={customCard.minCreditScore}
                    onChange={(e) => setCustomCard(prev => ({ ...prev, minCreditScore: e.target.value }))}
                    placeholder="650"
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={handlePredict}
              disabled={!selectedCard || predictMutation.isPending}
              className="w-full"
            >
              {predictMutation.isPending ? "Analyzing..." : "Predict Approval Odds"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {predictions && predictions.length > 0 && (
        <div className="space-y-4">
          {predictions.map((prediction: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{prediction.cardName}</span>
                  <Badge variant="outline">{prediction.bank}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Approval Probability */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Approval Probability</p>
                          <p className={`text-2xl font-bold ${getProbabilityColor(prediction.approvalProbability)}`}>
                            {prediction.approvalProbability}%
                          </p>
                        </div>
                        <CircularProgress value={prediction.approvalProbability} size="sm" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Hard Inquiry Risk</p>
                          <p className={`text-lg font-bold ${getRiskColor(prediction.hardInquiryRisk)}`}>
                            {prediction.hardInquiryRisk}
                          </p>
                        </div>
                        <AlertTriangle className={`h-6 w-6 ${getRiskColor(prediction.hardInquiryRisk)}`} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pre-Qualification</p>
                          <p className="text-lg font-bold">
                            {prediction.preQualificationAvailable ? "Available" : "Not Available"}
                          </p>
                        </div>
                        {prediction.preQualificationAvailable ? 
                          <CheckCircle className="h-6 w-6 text-green-600" /> :
                          <AlertTriangle className="h-6 w-6 text-gray-400" />
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommended Timing */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommended Timing
                  </h4>
                  <p className="text-sm text-gray-600">{prediction.recommendedTiming}</p>
                </div>

                {/* Requirements */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {prediction.requirements?.map((req: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-sm">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvement Suggestions */}
                {prediction.improvementSuggestions && prediction.improvementSuggestions.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Improvement Suggestions
                    </h4>
                    <div className="space-y-3">
                      {prediction.improvementSuggestions.map((suggestion: any, idx: number) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium">{suggestion.action}</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Impact: {suggestion.impact} | Timeline: {suggestion.timeline}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">AI Analysis</h4>
                  <p className="text-sm text-gray-600">{prediction.aiAnalysis}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {prediction.preQualificationAvailable && (
                    <Button variant="outline" className="flex-1">
                      Check Pre-Qualification
                    </Button>
                  )}
                  <Button 
                    variant={prediction.approvalProbability >= 70 ? "default" : "outline"}
                    className="flex-1"
                    disabled={prediction.approvalProbability < 50}
                  >
                    {prediction.approvalProbability >= 70 ? "Apply Now" : 
                     prediction.approvalProbability >= 50 ? "Consider Applying" : 
                     "Improve Profile First"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}