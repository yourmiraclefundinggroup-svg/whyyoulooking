import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, Download, Copy } from "lucide-react";

interface GoodwillLetterGeneratorProps {
  userId: number;
}

export function GoodwillLetterGenerator({ userId }: GoodwillLetterGeneratorProps) {
  const [formData, setFormData] = useState({
    creditorName: "",
    accountNumber: "",
    latePaymentDate: "",
    paymentAmount: "",
    circumstance: "",
    customerRelationshipYears: ""
  });
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [activeTab, setActiveTab] = useState("generate");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(`/api/goodwill-letters/generate`, {
        method: "POST",
        body: {
          userId,
          ...data,
          paymentAmount: parseFloat(data.paymentAmount) * 100, // Convert to cents
          customerRelationshipYears: parseInt(data.customerRelationshipYears)
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedLetter(data.letterContent);
      setActiveTab("preview");
      toast({
        title: "Letter Generated",
        description: "Your goodwill letter has been generated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate goodwill letter. Please try again.",
        variant: "destructive"
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/goodwill-letters`, {
        method: "POST",
        body: {
          userId,
          ...formData,
          paymentAmount: parseFloat(formData.paymentAmount) * 100,
          customerRelationshipYears: parseInt(formData.customerRelationshipYears),
          letterContent: generatedLetter,
          status: "DRAFT"
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goodwill-letters"] });
      toast({
        title: "Letter Saved",
        description: "Goodwill letter has been saved to your drafts."
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    if (!formData.creditorName || !formData.circumstance) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    generateMutation.mutate(formData);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast({
      title: "Copied",
      description: "Letter content copied to clipboard."
    });
  };

  const downloadLetter = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goodwill_letter_${formData.creditorName}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI Goodwill Letter Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Letter</TabsTrigger>
              <TabsTrigger value="preview">Preview & Save</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditorName">Creditor Name *</Label>
                  <Input
                    id="creditorName"
                    value={formData.creditorName}
                    onChange={(e) => handleInputChange("creditorName", e.target.value)}
                    placeholder="Bank of America"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                    placeholder="****1234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latePaymentDate">Late Payment Date</Label>
                  <Input
                    id="latePaymentDate"
                    type="date"
                    value={formData.latePaymentDate}
                    onChange={(e) => handleInputChange("latePaymentDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    value={formData.paymentAmount}
                    onChange={(e) => handleInputChange("paymentAmount", e.target.value)}
                    placeholder="150.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerRelationshipYears">Relationship Length (Years)</Label>
                  <Input
                    id="customerRelationshipYears"
                    type="number"
                    value={formData.customerRelationshipYears}
                    onChange={(e) => handleInputChange("customerRelationshipYears", e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="circumstance">Circumstance Explanation *</Label>
                <Textarea
                  id="circumstance"
                  value={formData.circumstance}
                  onChange={(e) => handleInputChange("circumstance", e.target.value)}
                  placeholder="Briefly explain the circumstances that led to the late payment..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full"
              >
                {generateMutation.isPending ? "Generating..." : "Generate Goodwill Letter"}
              </Button>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {generatedLetter ? (
                <>
                  <div className="flex gap-2 mb-4">
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={downloadLetter} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                        {generatedLetter}
                      </pre>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Generate a letter first to see the preview
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}