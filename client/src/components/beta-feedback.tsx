import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Star, Bug, Lightbulb } from "lucide-react";
import type { InsertTestingFeedback } from "@shared/schema";

interface BetaFeedbackProps {
  feature?: string;
  userId?: number;
}

export function BetaFeedback({ feature = "GENERAL", userId = 1 }: BetaFeedbackProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [bugReport, setBugReport] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [selectedFeature, setSelectedFeature] = useState(feature);

  const feedbackMutation = useMutation({
    mutationFn: async (data: InsertTestingFeedback) => {
      return await apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve the app!",
      });
      setIsOpen(false);
      setFeedback("");
      setBugReport("");
      setSuggestions("");
      setRating(5);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!feedback.trim()) return;

    feedbackMutation.mutate({
      userId,
      feature: selectedFeature,
      rating,
      feedback: feedback.trim(),
      bugReport: bugReport.trim() || undefined,
      suggestions: suggestions.trim() || undefined,
    });
  };

  const features = [
    { value: "AI_DISPUTE_LETTERS", label: "AI Dispute Letters" },
    { value: "USPS_TRACKING", label: "USPS Tracking" },
    { value: "CREDIT_SIMULATION", label: "Credit Simulation" },
    { value: "DASHBOARD", label: "Dashboard" },
    { value: "CREDIT_REPAIR", label: "Credit Repair" },
    { value: "CREDIT_BUILDING", label: "Credit Building" },
    { value: "EDUCATION", label: "Education" },
    { value: "GENERAL", label: "General App Experience" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="fixed bottom-4 right-4 z-50 shadow-lg">
          <MessageSquare className="h-4 w-4 mr-2" />
          Beta Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Beta Testing Feedback
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900">Help Us Improve</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Your feedback is crucial for making this credit repair app the best it can be. 
                  Please share your honest experience testing the features.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feature">Feature Tested</Label>
              <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                <SelectTrigger>
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  {features.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      star <= rating
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                    }`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {rating} star{rating !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">
                Your Experience <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="feedback"
                placeholder="Describe your experience with this feature. What worked well? What was confusing?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bugs" className="flex items-center">
                <Bug className="h-4 w-4 mr-1 text-red-500" />
                Bug Report (Optional)
              </Label>
              <Textarea
                id="bugs"
                placeholder="Did you encounter any bugs, errors, or unexpected behavior? Please describe in detail."
                value={bugReport}
                onChange={(e) => setBugReport(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestions" className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-1 text-blue-500" />
                Suggestions (Optional)
              </Label>
              <Textarea
                id="suggestions"
                placeholder="Any ideas for improvements or new features that would help with credit repair?"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Badge variant="secondary" className="text-xs">
              Beta Testing Program
            </Badge>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={feedbackMutation.isPending || !feedback.trim()}
              >
                {feedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BetaAccessBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-blue-800">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="ml-3 font-medium truncate">
              <span className="md:hidden">Beta testing active!</span>
              <span className="hidden md:inline">
                You're testing our credit repair app. Your feedback helps us improve!
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <Badge variant="secondary" className="bg-white text-blue-600">
              Beta Tester
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}