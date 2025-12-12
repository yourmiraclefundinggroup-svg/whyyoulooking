import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreditSimulatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentScore: number;
}

interface SimulationResult {
  currentScore: number;
  simulatedScore: number;
  totalImprovement: number;
  impacts: { action: string; impact: number }[];
}

export function CreditSimulatorModal({ open, onOpenChange, currentScore }: CreditSimulatorModalProps) {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const { toast } = useToast();

  const actions = [
    { id: "payOffCollections", label: "Pay off collections", description: "Remove collection accounts from your report" },
    { id: "lowerUtilization", label: "Lower utilization to 10%", description: "Reduce credit card balances" },
    { id: "removeLatePays", label: "Remove late payments", description: "Dispute and remove late payment history" },
    { id: "addSecuredCard", label: "Add secured credit card", description: "Establish positive payment history" },
  ];

  const simulateMutation = useMutation({
    mutationFn: async (data: { currentScore: number; actions: string[] }) => {
      const response = await apiRequest("POST", "/api/simulate-credit-score", data);
      return response.json();
    },
    onSuccess: (data: SimulationResult) => {
      setSimulationResult(data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to simulate credit score",
        variant: "destructive",
      });
    },
  });

  const handleActionChange = (actionId: string, checked: boolean) => {
    if (checked) {
      setSelectedActions([...selectedActions, actionId]);
    } else {
      setSelectedActions(selectedActions.filter(id => id !== actionId));
    }
  };

  const handleSimulate = () => {
    if (selectedActions.length === 0) {
      toast({
        title: "No actions selected",
        description: "Please select at least one action to simulate",
        variant: "destructive",
      });
      return;
    }

    simulateMutation.mutate({
      currentScore,
      actions: selectedActions,
    });
  };

  const handleReset = () => {
    setSelectedActions([]);
    setSimulationResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Credit Score Simulator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            See how different actions might impact your credit score
          </p>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Select actions you're considering:</h3>
            {actions.map((action) => (
              <div key={action.id} className="flex items-start space-x-3">
                <Checkbox
                  id={action.id}
                  checked={selectedActions.includes(action.id)}
                  onCheckedChange={(checked) => handleActionChange(action.id, checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor={action.id} className="text-sm font-medium cursor-pointer">
                    {action.label}
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSimulate}
              disabled={selectedActions.length === 0 || simulateMutation.isPending}
              className="bg-trust-blue hover:bg-blue-700"
            >
              {simulateMutation.isPending ? "Simulating..." : "Simulate Impact"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>

          {simulationResult && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Simulation Results</h3>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{simulationResult.currentScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Current Score</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{simulationResult.simulatedScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Projected Score</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">+{simulationResult.totalImprovement}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Improvement</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Breakdown by Action:</h4>
                {simulationResult.impacts.map((impact, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{impact.action}</span>
                    <span className="text-sm font-medium text-green-600">+{impact.impact} points</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                * These are estimated impacts based on industry averages. Actual results may vary depending on your unique credit profile.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
