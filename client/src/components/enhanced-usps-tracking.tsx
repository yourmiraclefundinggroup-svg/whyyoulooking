import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Calendar,
  Timer,
  Navigation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { Dispute } from "@shared/schema";

interface USPSTrackingEvent {
  event_time: string;
  event_date: string;
  event_city: string;
  event_state: string;
  event_zip_code: string;
  event_country: string;
  event_description: string;
  event_code: string;
}

interface USPSTrackingData {
  trackingNumber: string;
  status: string;
  description: string;
  isDelivered: boolean;
  deliveryDate?: string;
  events: USPSTrackingEvent[];
}

interface EnhancedUSPSTrackingProps {
  dispute: Dispute;
  showTitle?: boolean;
  compact?: boolean;
}

export function EnhancedUSPSTracking({ dispute, showTitle = true, compact = false }: EnhancedUSPSTrackingProps) {
  const [trackingNumber, setTrackingNumber] = useState(dispute.uspsTrackingNumber || "");
  const [showAllEvents, setShowAllEvents] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get real-time USPS tracking data
  const { data: trackingData, isLoading: trackingLoading, error: trackingError, refetch } = useQuery<USPSTrackingData>({
    queryKey: ['/api/usps/track', dispute.uspsTrackingNumber],
    enabled: !!dispute.uspsTrackingNumber,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    queryFn: async () => {
      const authToken = localStorage.getItem("auth_token");
      const response = await fetch(`/api/usps/track/${dispute.uspsTrackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get tracking information');
      }
      
      return response.json();
    }
  });

  // Add tracking number mutation
  const addTrackingMutation = useMutation({
    mutationFn: async (data: { trackingNumber: string }) => {
      return apiRequest("PATCH", `/api/disputes/${dispute.id}/tracking`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disputes"] });
      toast({
        title: "Tracking Added",
        description: "USPS tracking number has been added to this dispute."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add tracking number",
        variant: "destructive"
      });
    }
  });

  // Update dispute from tracking mutation
  const updateFromTrackingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/disputes/${dispute.id}/update-from-tracking`, {});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/disputes"] });
      toast({
        title: "Dispute Updated",
        description: `Dispute status updated to: ${data.dispute.status}`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update dispute from tracking",
        variant: "destructive"
      });
    }
  });

  const handleAddTracking = () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive"
      });
      return;
    }
    
    addTrackingMutation.mutate({ trackingNumber: trackingNumber.trim() });
  };

  const handleRefreshTracking = () => {
    refetch();
    updateFromTrackingMutation.mutate();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'IN TRANSIT':
      case 'SENT':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'PROCESSING':
        return <Package className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'IN TRANSIT':
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFollowUpDate = (followUpDate: Date | string) => {
    const date = new Date(followUpDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: "Follow-up required", color: "text-red-600", urgent: true };
    } else if (diffDays === 0) {
      return { text: "Follow-up due today", color: "text-orange-600", urgent: true };
    } else if (diffDays <= 3) {
      return { text: `Follow-up in ${diffDays} days`, color: "text-yellow-600", urgent: false };
    } else {
      return { text: date.toLocaleDateString(), color: "text-gray-600", urgent: false };
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        {trackingData ? (
          <>
            {getStatusIcon(trackingData.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(trackingData.status)}>
                  {trackingData.status}
                </Badge>
                <span className="text-sm text-gray-600">
                  {dispute.uspsTrackingNumber}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{trackingData.description}</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleRefreshTracking}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        ) : dispute.uspsTrackingNumber ? (
          <>
            <Package className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <span className="text-sm font-medium">{dispute.uspsTrackingNumber}</span>
              {trackingError && (
                <p className="text-xs text-red-500 mt-1">Failed to load tracking</p>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={handleRefreshTracking}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <Input
              placeholder="Enter USPS tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="text-sm"
            />
            <Button 
              size="sm" 
              onClick={handleAddTracking}
              disabled={addTrackingMutation.isPending}
            >
              Add
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            USPS Certified Mail Tracking
            {trackingData?.isDelivered && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Delivered
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {!dispute.uspsTrackingNumber ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Add a USPS tracking number to monitor delivery status and automatically calculate follow-up dates.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter USPS tracking number (e.g., 9407...)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
              <Button 
                onClick={handleAddTracking}
                disabled={addTrackingMutation.isPending}
              >
                {addTrackingMutation.isPending ? "Adding..." : "Add Tracking"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tracking Number & Controls */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tracking Number</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {dispute.uspsTrackingNumber}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${dispute.uspsTrackingNumber}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefreshTracking}
                disabled={trackingLoading || updateFromTrackingMutation.isPending}
              >
                <RefreshCw className={cn("h-4 w-4", trackingLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>

            {trackingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">
                    Unable to get tracking information: {trackingError.message}
                  </span>
                </div>
              </div>
            )}

            {trackingData && (
              <>
                {/* Current Status */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(trackingData.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getStatusColor(trackingData.status)}>
                          {trackingData.status}
                        </Badge>
                        {trackingData.deliveryDate && (
                          <span className="text-sm text-gray-600">
                            Delivered: {formatDate(trackingData.deliveryDate)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{trackingData.description}</p>
                    </div>
                  </div>
                </div>

                {/* Follow-up Information */}
                {dispute.deliveryDate && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Follow-up Schedule
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivered:</span>
                        <span>{new Date(dispute.deliveryDate).toLocaleDateString()}</span>
                      </div>
                      {dispute.followUpDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Follow-up due:</span>
                          <span className={formatFollowUpDate(dispute.followUpDate).color}>
                            {formatFollowUpDate(dispute.followUpDate).text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tracking Events */}
                {trackingData.events && trackingData.events.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Navigation className="h-4 w-4" />
                        Tracking History
                      </h4>
                      {trackingData.events.length > 3 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowAllEvents(!showAllEvents)}
                        >
                          {showAllEvents ? "Show Less" : `Show All (${trackingData.events.length})`}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {(showAllEvents ? trackingData.events : trackingData.events.slice(0, 3)).map((event, index) => (
                        <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {event.event_description}
                              </span>
                              <span className="text-xs text-gray-500">
                                {event.event_code}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(`${event.event_date} ${event.event_time || '00:00'}`)}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.event_city}, {event.event_state} {event.event_zip_code}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}