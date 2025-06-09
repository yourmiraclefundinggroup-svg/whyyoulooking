import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { CalendarIcon, Package, Truck, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { Dispute } from "@shared/schema";

interface USPSTrackingProps {
  dispute: Dispute;
}

export function USPSTracking({ dispute }: USPSTrackingProps) {
  const [trackingNumber, setTrackingNumber] = useState(dispute.uspsTrackingNumber || "");
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [showDeliveryCalendar, setShowDeliveryCalendar] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTrackingMutation = useMutation({
    mutationFn: async (data: { trackingNumber: string }) => {
      const response = await fetch(`/api/disputes/${dispute.id}/tracking`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
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

  const updateDeliveryMutation = useMutation({
    mutationFn: async (data: { deliveryDate: string }) => {
      const response = await fetch(`/api/disputes/${dispute.id}/delivery`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disputes"] });
      toast({
        title: "Delivery Confirmed",
        description: "Delivery date has been recorded. 14-day countdown started."
      });
      setShowDeliveryCalendar(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update delivery date",
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

  const handleDeliveryConfirm = () => {
    if (!deliveryDate) {
      toast({
        title: "Error",
        description: "Please select a delivery date",
        variant: "destructive"
      });
      return;
    }
    updateDeliveryMutation.mutate({ deliveryDate: deliveryDate.toISOString() });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "SENT":
        return <Truck className="h-4 w-4" />;
      case "DELIVERED":
        return <Package className="h-4 w-4" />;
      case "FOLLOW_UP_REQUIRED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "SENT":
        return "default";
      case "DELIVERED":
        return "default";
      case "FOLLOW_UP_REQUIRED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getDaysRemaining = () => {
    if (!dispute.followUpDate) return null;
    const now = new Date();
    const followUp = new Date(dispute.followUpDate);
    const diffTime = followUp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4" />
          USPS Tracking
        </CardTitle>
        <CardDescription className="text-sm">
          Track delivery and 14-day countdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {getStatusIcon(dispute.status)}
          <Badge variant={getStatusColor(dispute.status)} className="text-xs">
            {dispute.status.replace("_", " ")}
          </Badge>
          {daysRemaining !== null && (
            <Badge variant={daysRemaining <= 0 ? "destructive" : "outline"} className="text-xs">
              {daysRemaining <= 0 ? "Follow-up Required" : `${daysRemaining} days left`}
            </Badge>
          )}
        </div>

        {!dispute.uspsTrackingNumber ? (
          <div className="space-y-3">
            <Label htmlFor="tracking-number">USPS Tracking Number</Label>
            <div className="space-y-2">
              <Input
                id="tracking-number"
                placeholder="Enter USPS tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full"
              />
              <Button 
                onClick={handleAddTracking}
                disabled={addTrackingMutation.isPending}
                className="w-full sm:w-auto"
                size="sm"
              >
                {addTrackingMutation.isPending ? "Adding..." : "Add Tracking"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Tracking Number</Label>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {dispute.uspsTrackingNumber}
              </p>
            </div>

            {dispute.status === "SENT" && !dispute.deliveryDate && (
              <div className="space-y-3">
                <Label>Confirm Delivery Date</Label>
                <div className="flex gap-2">
                  <Popover open={showDeliveryCalendar} onOpenChange={setShowDeliveryCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP") : "Select delivery date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    onClick={handleDeliveryConfirm}
                    disabled={updateDeliveryMutation.isPending || !deliveryDate}
                  >
                    {updateDeliveryMutation.isPending ? "Confirming..." : "Confirm"}
                  </Button>
                </div>
              </div>
            )}

            {dispute.deliveryDate && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Delivered</Label>
                  <p className="text-muted-foreground">
                    {formatDate(dispute.deliveryDate)}
                  </p>
                </div>
                <div>
                  <Label>Follow-up Date</Label>
                  <p className="text-muted-foreground">
                    {dispute.followUpDate ? formatDate(dispute.followUpDate) : "Not set"}
                  </p>
                </div>
              </div>
            )}

            {daysRemaining !== null && daysRemaining <= 0 && !dispute.alertSent && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Follow-up Required
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  14 days have passed since delivery. Time to call the credit bureau to check on dispute status.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}