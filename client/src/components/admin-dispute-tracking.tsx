import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Package, Plus, Clock, FileText, Mail, CheckCircle2 } from "lucide-react";
import type { User as UserType, DisputeLetterNew } from "@shared/schema";

interface AdminDisputeTrackingProps {
  selectedClientId?: number | null;
}

export function AdminDisputeTracking({ selectedClientId }: AdminDisputeTrackingProps) {
  const [selectedUserId, setSelectedUserId] = useState<number>(selectedClientId || 0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all users for client selection
  const { data: allUsers = [] } = useQuery<UserType[]>({
    queryKey: ['/api/users'],
  });

  const clientUsers = allUsers.filter(u => u.accessLevel !== "ADMIN");

  // Get dispute letters for tracking
  const { data: disputeLetters = [] } = useQuery<DisputeLetterNew[]>({
    queryKey: ['/api/admin/dispute-letters-new/all'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/dispute-letters-new/all");
      return response.json();
    }
  });

  // Letters filtered by selected client
  const lettersToShow = selectedUserId 
    ? disputeLetters.filter(l => l.clientId === selectedUserId)
    : disputeLetters;

  // State for adding tracking to letters
  const [letterTrackingNumber, setLetterTrackingNumber] = useState("");
  const [selectedLetterId, setSelectedLetterId] = useState<number | null>(null);

  // Add tracking number to letter
  const addLetterTrackingMutation = useMutation({
    mutationFn: async (data: { letterId: number; trackingNumber: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/dispute-letters-new/${data.letterId}`, {
        trackingNumber: data.trackingNumber,
        sentDate: new Date().toISOString().split('T')[0],
        status: 'sent'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dispute-letters-new/all'] });
      toast({
        title: "Tracking Added",
        description: "USPS tracking number has been saved to the letter."
      });
      setLetterTrackingNumber("");
      setSelectedLetterId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add tracking number",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Main Tracking Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            USPS Tracking Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label>Filter by Client</Label>
            <Select value={selectedUserId.toString()} onValueChange={(value) => setSelectedUserId(parseInt(value) || 0)}>
              <SelectTrigger data-testid="select-client-filter">
                <SelectValue placeholder="All clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Clients</SelectItem>
                {clientUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Tracking to Letter */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
            <Label className="font-medium">Add Tracking Number</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter 22-digit USPS tracking number"
                value={letterTrackingNumber}
                onChange={(e) => setLetterTrackingNumber(e.target.value)}
                maxLength={22}
                className="flex-1"
                data-testid="input-letter-tracking"
              />
              <Select 
                value={selectedLetterId?.toString() || ""}
                onValueChange={(value) => setSelectedLetterId(parseInt(value) || null)}
              >
                <SelectTrigger className="w-56" data-testid="select-letter-for-tracking">
                  <SelectValue placeholder="Select letter" />
                </SelectTrigger>
                <SelectContent>
                  {lettersToShow
                    .filter(l => !l.trackingNumber)
                    .map((letter) => (
                      <SelectItem key={letter.id} value={letter.id.toString()}>
                        Letter #{letter.id} - {letter.bureau}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  if (selectedLetterId && letterTrackingNumber) {
                    addLetterTrackingMutation.mutate({
                      letterId: selectedLetterId,
                      trackingNumber: letterTrackingNumber
                    });
                  }
                }}
                disabled={!selectedLetterId || !letterTrackingNumber || addLetterTrackingMutation.isPending}
                data-testid="button-add-letter-tracking"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {lettersToShow.filter(l => !l.trackingNumber).length} letters without tracking
            </p>
          </div>

          {/* Quick Stats for Letters */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {lettersToShow.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Letters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {lettersToShow.filter(l => l.trackingNumber).length}
              </div>
              <div className="text-sm text-muted-foreground">With Tracking</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {lettersToShow.filter(l => l.status === 'sent').length}
              </div>
              <div className="text-sm text-muted-foreground">Sent</div>
            </div>
          </div>

          {/* Letters List */}
          {lettersToShow.length > 0 ? (
            <div className="space-y-4 mt-4">
              {lettersToShow.map((letter) => {
                const clientUser = clientUsers.find(u => u.id === letter.clientId);
                return (
                  <div key={letter.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">Letter #{letter.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {letter.bureau} Bureau - {letter.letterType || 'Dispute Letter'}
                          </div>
                          {clientUser && (
                            <div className="text-xs text-gray-500 mt-1">
                              Client: {clientUser.firstName} {clientUser.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={letter.status === 'sent' ? "default" : "secondary"}
                        className={letter.status === 'sent' ? "bg-blue-600" : ""}
                      >
                        {letter.status}
                      </Badge>
                    </div>

                    {letter.trackingNumber ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded mt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="font-mono text-sm">{letter.trackingNumber}</span>
                        </div>
                        {letter.sentDate && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Sent: {new Date(letter.sentDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-3 bg-gray-50 rounded mt-2">
                        No tracking number assigned. Add tracking above after mailing.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No dispute letters found</p>
              <p className="text-sm">Generate dispute letters from the Credit Reports page</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}