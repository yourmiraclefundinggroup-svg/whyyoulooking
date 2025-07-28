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
import { EnhancedUSPSTracking } from "@/components/enhanced-usps-tracking";
import { Package, Plus, Send, User, Calendar, MapPin, Clock } from "lucide-react";
import type { Dispute, User as UserType } from "@shared/schema";

interface AdminDisputeTrackingProps {
  selectedClientId?: number | null;
}

export function AdminDisputeTracking({ selectedClientId }: AdminDisputeTrackingProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number>(selectedClientId || 0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all users for client selection
  const { data: allUsers = [] } = useQuery<UserType[]>({
    queryKey: ['/api/users'],
  });

  const clientUsers = allUsers.filter(u => u.accessLevel !== "ADMIN");

  // Get all disputes for admin view
  const { data: allDisputes = [] } = useQuery<Dispute[]>({
    queryKey: ['/api/admin/all-disputes'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/all-disputes");
      return response.json();
    }
  });

  // Get disputes for selected client
  const { data: clientDisputes = [] } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes', selectedUserId],
    enabled: !!selectedUserId,
  });

  // Get follow-up alerts
  const { data: followUpDisputes = [] } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes/follow-up'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Add tracking number to dispute
  const addTrackingMutation = useMutation({
    mutationFn: async (data: { disputeId: number; trackingNumber: string }) => {
      const response = await apiRequest("PATCH", `/api/disputes/${data.disputeId}/tracking`, {
        trackingNumber: data.trackingNumber
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-disputes'] });
      toast({
        title: "Tracking Added",
        description: "USPS tracking number has been added successfully."
      });
      setTrackingNumber("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add tracking number",
        variant: "destructive"
      });
    }
  });

  const disputesToShow = selectedUserId ? clientDisputes : allDisputes;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* USPS Tracking Management */}
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
              <Label>Select Client</Label>
              <Select value={selectedUserId.toString()} onValueChange={(value) => setSelectedUserId(parseInt(value) || 0)}>
                <SelectTrigger>
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

            {/* Add Tracking Number */}
            <div className="space-y-2">
              <Label>Add Tracking Number</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter 22-digit USPS tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  maxLength={22}
                />
                <Select 
                  disabled={!trackingNumber || disputesToShow.filter(d => !d.uspsTrackingNumber).length === 0}
                  onValueChange={(value) => {
                    if (value && trackingNumber) {
                      addTrackingMutation.mutate({
                        disputeId: parseInt(value),
                        trackingNumber
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select dispute" />
                  </SelectTrigger>
                  <SelectContent>
                    {disputesToShow
                      .filter(d => !d.uspsTrackingNumber)
                      .map((dispute) => (
                        <SelectItem key={dispute.id} value={dispute.id.toString()}>
                          Dispute #{dispute.id}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the USPS tracking number from your certified mail receipt
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {disputesToShow.filter(d => d.uspsTrackingNumber).length}
                </div>
                <div className="text-sm text-muted-foreground">Being Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {disputesToShow.filter(d => d.status === "DELIVERED").length}
                </div>
                <div className="text-sm text-muted-foreground">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {followUpDisputes.length}
                </div>
                <div className="text-sm text-muted-foreground">Need Follow-Up</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-Up Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Follow-Up Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {followUpDisputes.length > 0 ? (
              <div className="space-y-3">
                {followUpDisputes.map((dispute) => (
                  <div key={dispute.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Dispute #{dispute.id}</div>
                        <div className="text-sm text-muted-foreground">
                          Delivered {dispute.deliveryDate && new Date(dispute.deliveryDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-orange-600">
                          14-day follow-up required
                        </div>
                      </div>
                      <Badge variant="outline" className="border-orange-600 text-orange-600">
                        Action Required
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No follow-ups required at this time</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dispute Tracking List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Disputes & Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          {disputesToShow.length > 0 ? (
            <div className="space-y-4">
              {disputesToShow.map((dispute) => (
                <div key={dispute.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">Dispute #{dispute.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {dispute.bureau} Bureau - Issue #{dispute.issueId}
                        </div>
                      </div>
                      {selectedUserId === 0 && (
                        <Badge variant="outline">
                          User #{dispute.userId}
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      variant={dispute.status === "DELIVERED" ? "default" : "secondary"}
                      className={dispute.status === "DELIVERED" ? "bg-green-600" : ""}
                    >
                      {dispute.status}
                    </Badge>
                  </div>

                  {dispute.uspsTrackingNumber ? (
                    <EnhancedUSPSTracking dispute={dispute} showTitle={false} compact={true} />
                  ) : (
                    <div className="text-sm text-muted-foreground p-3 bg-gray-50 rounded">
                      No tracking number assigned. Add tracking above after mailing.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No disputes found</p>
              <p className="text-sm">Create disputes for clients to begin tracking</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}