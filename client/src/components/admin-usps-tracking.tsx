import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Package, Clock, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Dispute } from "@shared/schema";

interface AdminUSPSTrackingProps {
  userId: number;
}

export function AdminUSPSTracking({ userId }: AdminUSPSTrackingProps) {
  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['/api/disputes', userId],
    queryFn: () => fetch(`/api/disputes?userId=${userId}`).then(res => res.json())
  });

  const pendingDisputes = disputes.filter((dispute: Dispute) => 
    dispute.status === 'PENDING' || dispute.status === 'SENT'
  );

  const getDeliveryStatus = (dispute: Dispute) => {
    if (dispute.deliveryDate) {
      const deliveryDate = new Date(dispute.deliveryDate);
      const followUpDate = new Date(deliveryDate);
      followUpDate.setDate(followUpDate.getDate() + 14);
      
      const today = new Date();
      const isFollowUpRequired = today >= followUpDate;
      
      return {
        status: 'DELIVERED',
        deliveryDate: deliveryDate.toLocaleDateString(),
        followUpDate: followUpDate.toLocaleDateString(),
        isFollowUpRequired,
        daysRemaining: Math.max(0, Math.ceil((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
      };
    } else if (dispute.dateSent) {
      return {
        status: 'IN_TRANSIT',
        dateSent: new Date(dispute.dateSent).toLocaleDateString(),
        isFollowUpRequired: false
      };
    }
    return { status: 'NOT_SENT', isFollowUpRequired: false };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            USPS Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading tracking information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            USPS Tracking
            <Badge variant="secondary">{pendingDisputes.length} Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Track delivery and 14-day countdown for active disputes
          </p>
          
          {pendingDisputes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active disputes to track</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDisputes.map((dispute: Dispute) => {
                const tracking = getDeliveryStatus(dispute);
                
                return (
                  <div key={dispute.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{dispute.bureau} - {dispute.status}</h4>
                        <p className="text-sm text-muted-foreground">
                          Sent: {new Date(dispute.dateSent).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {tracking.status === 'DELIVERED' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            DELIVERED
                          </Badge>
                        )}
                        {tracking.isFollowUpRequired && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Follow-up Required
                          </Badge>
                        )}
                      </div>
                    </div>

                    {dispute.uspsTrackingNumber && (
                      <div className="bg-muted/50 rounded p-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Tracking Number</span>
                          <code className="bg-background px-2 py-1 rounded text-xs">
                            {dispute.uspsTrackingNumber}
                          </code>
                        </div>
                        
                        {tracking.status === 'DELIVERED' && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Delivered</span>
                              <p className="font-medium">{tracking.deliveryDate}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Follow-up Date</span>
                              <p className="font-medium">{tracking.followUpDate}</p>
                            </div>
                          </div>
                        )}

                        {tracking.isFollowUpRequired && (
                          <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                              <div className="flex-1">
                                <h5 className="font-medium text-red-800">Follow-up Required</h5>
                                <p className="text-sm text-red-700 mt-1">
                                  14 days have passed since delivery. Time to call the credit bureau
                                  and check on dispute status.
                                </p>
                                <Button 
                                  size="sm" 
                                  className="mt-2 bg-red-600 hover:bg-red-700"
                                  onClick={() => {
                                    // Handle follow-up action
                                    window.open(`tel:${dispute.bureau === 'EQUIFAX' ? '1-800-685-1111' : 
                                                dispute.bureau === 'EXPERIAN' ? '1-888-397-3742' : 
                                                '1-800-916-8800'}`, '_self');
                                  }}
                                >
                                  Call {dispute.bureau}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {tracking.status === 'DELIVERED' && !tracking.isFollowUpRequired && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <div>
                                <h5 className="font-medium text-blue-800">
                                  {tracking.daysRemaining} days remaining
                                </h5>
                                <p className="text-sm text-blue-700">
                                  Follow-up call required on {tracking.followUpDate}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}