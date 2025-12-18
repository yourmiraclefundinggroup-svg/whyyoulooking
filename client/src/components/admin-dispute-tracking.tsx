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
import { Package, Plus, Mail, RefreshCw, MapPin, CheckCircle2, Truck, AlertCircle } from "lucide-react";
import type { User as UserType, DisputeLetterNew } from "@shared/schema";

interface AdminDisputeTrackingProps {
  selectedClientId?: number | null;
}

interface USPSTrackingStatus {
  trackingNumber: string;
  status: string;
  description: string;
  isDelivered: boolean;
  deliveryDate?: string;
  events?: Array<{
    event_time: string;
    event_date: string;
    event_city: string;
    event_state: string;
    event_description: string;
  }>;
  error?: string;
}

export function AdminDisputeTracking({ selectedClientId }: AdminDisputeTrackingProps) {
  const [selectedUserId, setSelectedUserId] = useState<number>(selectedClientId || 0);
  const [trackingStatuses, setTrackingStatuses] = useState<Record<string, USPSTrackingStatus>>({});
  const [loadingTracking, setLoadingTracking] = useState<Record<string, boolean>>({});
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

  // Fetch live USPS tracking status
  const fetchTrackingStatus = async (trackingNumber: string) => {
    setLoadingTracking(prev => ({ ...prev, [trackingNumber]: true }));
    try {
      const response = await apiRequest("GET", `/api/usps/track/${trackingNumber}`);
      const data = await response.json();
      setTrackingStatuses(prev => ({ ...prev, [trackingNumber]: data }));
      return data;
    } catch (error: any) {
      const errorStatus: USPSTrackingStatus = {
        trackingNumber,
        status: 'ERROR',
        description: error.message || 'Failed to fetch tracking',
        isDelivered: false,
        error: error.message
      };
      setTrackingStatuses(prev => ({ ...prev, [trackingNumber]: errorStatus }));
      return errorStatus;
    } finally {
      setLoadingTracking(prev => ({ ...prev, [trackingNumber]: false }));
    }
  };

  // Add tracking number to letter (with USPS validation)
  const addLetterTrackingMutation = useMutation({
    mutationFn: async (data: { letterId: number; trackingNumber: string }) => {
      // First, try to validate with USPS API by fetching tracking
      const trackingStatus = await fetchTrackingStatus(data.trackingNumber);
      
      // If tracking number is invalid or not found, still save it but warn
      if (trackingStatus.error) {
        toast({
          title: "Warning",
          description: "Tracking number saved but could not verify with USPS. It may take time to appear in USPS system.",
          variant: "default"
        });
      }
      
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
        description: "USPS tracking number has been saved and verified."
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

  // Refresh all tracking statuses
  const refreshAllTracking = async () => {
    const lettersWithTracking = lettersToShow.filter(l => l.trackingNumber);
    for (const letter of lettersWithTracking) {
      if (letter.trackingNumber) {
        await fetchTrackingStatus(letter.trackingNumber);
      }
    }
    toast({
      title: "Tracking Updated",
      description: `Refreshed ${lettersWithTracking.length} tracking statuses from USPS.`
    });
  };

  // Get status icon and color
  const getStatusDisplay = (status: USPSTrackingStatus | undefined) => {
    if (!status) {
      return { icon: Package, color: "text-gray-400", bgColor: "bg-gray-100", label: "Not Checked" };
    }
    if (status.error) {
      return { icon: AlertCircle, color: "text-amber-500", bgColor: "bg-amber-50", label: "Pending" };
    }
    if (status.isDelivered) {
      return { icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-50", label: "Delivered" };
    }
    return { icon: Truck, color: "text-blue-600", bgColor: "bg-blue-50", label: "In Transit" };
  };

  return (
    <div className="space-y-6">
      {/* Main Tracking Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              USPS Tracking Management
            </CardTitle>
            {lettersToShow.filter(l => l.trackingNumber).length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAllTracking}
                data-testid="button-refresh-all-tracking"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh All
              </Button>
            )}
          </div>
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
                {addLetterTrackingMutation.isPending ? 'Verifying...' : 'Add'}
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

          {/* Letters with Tracking - Only show letters that have tracking numbers */}
          {lettersToShow.filter(l => l.trackingNumber).length > 0 ? (
            <div className="space-y-4 mt-4">
              <h4 className="font-medium text-sm text-muted-foreground">Letters with Tracking Numbers</h4>
              {lettersToShow.filter(l => l.trackingNumber).map((letter) => {
                const clientUser = clientUsers.find(u => u.id === letter.clientId);
                const trackingStatus = letter.trackingNumber ? trackingStatuses[letter.trackingNumber] : undefined;
                const statusDisplay = getStatusDisplay(trackingStatus);
                const isLoading = letter.trackingNumber ? loadingTracking[letter.trackingNumber] : false;
                const StatusIcon = statusDisplay.icon;
                
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
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="default"
                          className={trackingStatus?.isDelivered ? "bg-green-600" : "bg-blue-600"}
                        >
                          {trackingStatus?.isDelivered ? 'Delivered' : 'sent'}
                        </Badge>
                      </div>
                    </div>

                    {/* Tracking Info with Live Status */}
                    <div className={`p-3 ${statusDisplay.bgColor} border border-blue-200 rounded mt-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="font-mono text-sm">{letter.trackingNumber}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => letter.trackingNumber && fetchTrackingStatus(letter.trackingNumber)}
                          disabled={isLoading}
                          data-testid={`button-refresh-tracking-${letter.id}`}
                        >
                          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      
                      {/* Live USPS Status */}
                      {trackingStatus && !trackingStatus.error && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusIcon className={`h-5 w-5 ${statusDisplay.color}`} />
                            <span className={`font-medium ${statusDisplay.color}`}>
                              {trackingStatus.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{trackingStatus.description}</p>
                          {trackingStatus.deliveryDate && (
                            <p className="text-xs text-green-600 mt-1">
                              Delivered: {new Date(trackingStatus.deliveryDate).toLocaleDateString()}
                            </p>
                          )}
                          {trackingStatus.events && trackingStatus.events.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Last: {trackingStatus.events[0].event_city}, {trackingStatus.events[0].event_state}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Not yet checked */}
                      {!trackingStatus && (
                        <div className="mt-2 text-xs text-gray-500">
                          Click refresh to get live USPS tracking status
                        </div>
                      )}
                      
                      {letter.sentDate && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Sent: {new Date(letter.sentDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tracked letters yet</p>
              <p className="text-sm">Select a letter above and add a USPS tracking number after mailing</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
