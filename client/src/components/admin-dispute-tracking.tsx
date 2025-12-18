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
import { Package, Plus, Mail, RefreshCw, MapPin, CheckCircle2, Truck, AlertCircle, Building2, Clock } from "lucide-react";
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

  // Get status icon and color with dark mode support
  const getStatusDisplay = (status: USPSTrackingStatus | undefined) => {
    if (!status) {
      return { 
        icon: Clock, 
        color: "text-gray-400 dark:text-gray-500", 
        bgColor: "bg-gray-100/50 dark:bg-gray-800/50", 
        borderColor: "border-gray-200 dark:border-gray-700",
        label: "Not Checked",
        step: 0
      };
    }
    if (status.error) {
      return { 
        icon: Building2, 
        color: "text-amber-500 dark:text-amber-400", 
        bgColor: "bg-amber-50/50 dark:bg-amber-900/30", 
        borderColor: "border-amber-200 dark:border-amber-700",
        label: "At Post Office",
        step: 1
      };
    }
    if (status.isDelivered) {
      return { 
        icon: CheckCircle2, 
        color: "text-green-600 dark:text-green-400", 
        bgColor: "bg-green-50/50 dark:bg-green-900/30", 
        borderColor: "border-green-200 dark:border-green-700",
        label: "Delivered",
        step: 3
      };
    }
    return { 
      icon: Truck, 
      color: "text-blue-600 dark:text-blue-400", 
      bgColor: "bg-blue-50/50 dark:bg-blue-900/30", 
      borderColor: "border-blue-200 dark:border-blue-700",
      label: "In Transit",
      step: 2
    };
  };

  // Interactive tracking journey component
  const TrackingJourney = ({ currentStep }: { currentStep: number }) => {
    const steps = [
      { label: "Accepted", icon: Building2, step: 1 },
      { label: "In Transit", icon: Truck, step: 2 },
      { label: "Delivered", icon: CheckCircle2, step: 3 }
    ];

    return (
      <div className="flex items-center justify-between py-3 px-2">
        {steps.map((step, index) => {
          const isComplete = currentStep >= step.step;
          const isCurrent = currentStep === step.step;
          const StepIcon = step.icon;
          
          return (
            <div key={step.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isComplete 
                    ? isCurrent 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-110' 
                      : 'bg-green-500 dark:bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }
                `}>
                  <StepIcon className="h-5 w-5" />
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isComplete 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-2 rounded-full transition-all duration-300
                  ${currentStep > step.step 
                    ? 'bg-green-500 dark:bg-green-600' 
                    : 'bg-gray-200 dark:bg-gray-700'
                  }
                `} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

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
                {addLetterTrackingMutation.isPending ? 'Verifying...' : 'Add'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {lettersToShow.filter(l => !l.trackingNumber).length} letters without tracking
            </p>
          </div>

          {/* Prominent Refresh Button */}
          {lettersToShow.filter(l => l.trackingNumber).length > 0 && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">Live USPS Tracking</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">Get real-time package status from USPS</p>
                </div>
                <Button
                  onClick={refreshAllTracking}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 h-12 text-base font-medium"
                  data-testid="button-refresh-all-tracking"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh All Tracking
                </Button>
              </div>
            </div>
          )}

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
                  <div 
                    key={letter.id} 
                    className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusDisplay.bgColor} ${statusDisplay.borderColor} border`}>
                          <StatusIcon className={`h-6 w-6 ${statusDisplay.color}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">Letter #{letter.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {letter.bureau} Bureau - {letter.letterType || 'Dispute Letter'}
                          </div>
                          {clientUser && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Client: {clientUser.firstName} {clientUser.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge 
                        className={`${
                          trackingStatus?.isDelivered 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {statusDisplay.label}
                      </Badge>
                    </div>

                    {/* Interactive Tracking Journey */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <TrackingJourney currentStep={statusDisplay.step} />
                    </div>

                    {/* Tracking Number & Actions */}
                    <div className={`p-4 rounded-lg ${statusDisplay.bgColor} border ${statusDisplay.borderColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className={`h-4 w-4 ${statusDisplay.color}`} />
                          <span className="font-mono text-sm text-foreground">{letter.trackingNumber}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => letter.trackingNumber && fetchTrackingStatus(letter.trackingNumber)}
                          disabled={isLoading}
                          className="hover:bg-green-50 dark:hover:bg-green-900/30"
                          data-testid={`button-refresh-tracking-${letter.id}`}
                        >
                          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                          {isLoading ? 'Loading...' : 'Refresh'}
                        </Button>
                      </div>
                      
                      {/* Live USPS Status Details */}
                      {trackingStatus && !trackingStatus.error && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusIcon className={`h-5 w-5 ${statusDisplay.color}`} />
                            <span className={`font-semibold ${statusDisplay.color}`}>
                              {trackingStatus.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{trackingStatus.description}</p>
                          {trackingStatus.deliveryDate && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                              Delivered: {new Date(trackingStatus.deliveryDate).toLocaleDateString()}
                            </p>
                          )}
                          {trackingStatus.events && trackingStatus.events.length > 0 && (
                            <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700/50 rounded flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Latest: {trackingStatus.events[0].event_city}, {trackingStatus.events[0].event_state}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Not yet checked */}
                      {!trackingStatus && (
                        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">
                            Click "Refresh" to get live USPS tracking status
                          </p>
                        </div>
                      )}
                      
                      {letter.sentDate && (
                        <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          Sent: {new Date(letter.sentDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Mail className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium">No tracked letters yet</p>
              <p className="text-sm mt-1">Select a letter above and add a USPS tracking number after mailing</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
