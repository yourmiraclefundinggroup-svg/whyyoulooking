import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CreditIssue } from "@shared/schema";

interface DisputeLetterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue?: CreditIssue;
}

export function DisputeLetterModal({ open, onOpenChange, issue }: DisputeLetterModalProps) {
  const [bureau, setBureau] = useState<string>("");
  const [letterContent, setLetterContent] = useState<string>("");
  const { toast } = useToast();

  const generateLetterMutation = useMutation({
    mutationFn: async (data: { issueId: number; bureau: string; issueType: string; description: string; creditor: string; amount?: number | null; dateAdded: Date; impact: number }) => {
      const response = await apiRequest("POST", "/api/disputes/generate-letter", data);
      return response.json();
    },
    onSuccess: (data) => {
      setLetterContent(data.letterContent);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate dispute letter",
        variant: "destructive",
      });
    },
  });

  const createDisputeMutation = useMutation({
    mutationFn: async (data: { userId: number; issueId: number; bureau: string; letterContent: string; expectedResponse: Date }) => {
      const response = await apiRequest("POST", "/api/disputes", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dispute letter created successfully",
      });
      onOpenChange(false);
      setLetterContent("");
      setBureau("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create dispute",
        variant: "destructive",
      });
    },
  });

  const handleGenerateLetter = () => {
    if (!issue || !bureau) return;

    generateLetterMutation.mutate({
      issueId: issue.id,
      bureau,
      issueType: issue.type,
      description: issue.description,
      creditor: issue.creditor,
      amount: issue.amount,
      dateAdded: issue.dateAdded,
      impact: issue.impact,
    });
  };

  const handleCreateDispute = () => {
    if (!issue || !bureau || !letterContent) return;

    const expectedResponse = new Date();
    expectedResponse.setDate(expectedResponse.getDate() + 30); // 30 days from now

    createDisputeMutation.mutate({
      userId: issue.userId,
      issueId: issue.id,
      bureau,
      letterContent,
      expectedResponse,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Dispute Letter</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {issue && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">{issue.title}</h3>
              <p className="text-sm text-gray-600">{issue.description}</p>
              <p className="text-sm text-gray-500 mt-1">Creditor: {issue.creditor}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="bureau">Select Credit Bureau</Label>
              <Select value={bureau} onValueChange={setBureau}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a credit bureau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUIFAX">Equifax</SelectItem>
                  <SelectItem value="EXPERIAN">Experian</SelectItem>
                  <SelectItem value="TRANSUNION">TransUnion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateLetter}
                disabled={!bureau || generateLetterMutation.isPending}
                className="bg-trust-blue hover:bg-blue-700"
              >
                {generateLetterMutation.isPending ? "Generating AI Letter..." : "Generate AI Letter"}
              </Button>
            </div>

            {letterContent && (
              <div>
                <Label htmlFor="letter">Dispute Letter Content</Label>
                <Textarea
                  id="letter"
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  rows={15}
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {letterContent && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateDispute}
                disabled={createDisputeMutation.isPending}
                className="bg-trust-blue hover:bg-blue-700"
              >
                {createDisputeMutation.isPending ? "Creating..." : "Create Dispute"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
