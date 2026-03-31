import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import type { CreditIssue } from "@shared/schema";

interface DisputeLetterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue?: CreditIssue;
}

function deriveLetterType(issueType: string, description?: string): string {
  const t = (issueType || "").toLowerCase();
  const d = (description || "").toLowerCase();
  if (t.includes("late_payment") || t.includes("late payment")) return "late_payment_metro2";
  if (t.includes("closed_school") || t.includes("closed school")) return "closed_school";
  const isStudentLoan = t.includes("student_loan") || t.includes("student loan");
  const hasClosedSchoolKeyword =
    d.includes("closed school") || d.includes("school closed") || d.includes("school closure") || d.includes("discharge");
  if (isStudentLoan && hasClosedSchoolKeyword) return "closed_school";
  if (t.includes("identity") || t.includes("fraud")) return "identity_theft";
  return "general";
}

export function DisputeLetterModal({ open, onOpenChange, issue }: DisputeLetterModalProps) {
  const [bureau, setBureau] = useState<string>("");
  const [letterContent, setLetterContent] = useState<string>("");
  const { toast } = useToast();
  const { isAdmin } = useUserContext();

  const generateLetterMutation = useMutation({
    mutationFn: async (data: {
      issueType: string;
      description: string;
      creditor: string;
      bureau: string;
      letterType: string;
      clientId?: number;
    }) => {
      if (isAdmin && data.clientId) {
        const response = await apiRequest("POST", "/api/admin/generate-dispute-letter", {
          issue: {
            type: data.issueType,
            description: data.description,
            creditor: data.creditor,
          },
          clientName: "",
          clientId: data.clientId,
          bureau: data.bureau,
          roundNumber: 1,
          letterType: data.letterType,
        });
        const result = await response.json();
        return { letterContent: result.letter };
      }
      const response = await apiRequest("POST", "/api/generate-dispute-letter", {
        issueType: data.issueType,
        description: data.description,
        creditor: data.creditor,
        bureau: data.bureau,
        letterType: data.letterType,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setLetterContent(data.letterContent);
      toast({
        title: "Success",
        description: "AI dispute letter generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate dispute letter with AI",
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
      issueType: issue.type,
      description: issue.description,
      creditor: issue.creditor,
      bureau,
      letterType: deriveLetterType(issue.type, issue.description),
      clientId: issue.userId,
    });
  };

  const handleCreateDispute = () => {
    if (!issue || !bureau || !letterContent) return;

    const expectedResponse = new Date();
    expectedResponse.setDate(expectedResponse.getDate() + 30);

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
              <h3 className="font-medium text-gray-900 dark:text-white">{issue.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{issue.description}</p>
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
