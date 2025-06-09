import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { AlertCircle, Phone, CheckCircle } from "lucide-react";
import type { Dispute } from "@shared/schema";

export function FollowUpAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: followUpDisputes = [], isLoading } = useQuery({
    queryKey: ["/api/disputes/follow-up"],
    refetchInterval: 60000 // Check every minute
  });

  const markAlertSentMutation = useMutation({
    mutationFn: async (disputeId: number) => {
      return apiRequest(`/api/disputes/${disputeId}/alert-sent`, {
        method: "PATCH"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disputes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/disputes/follow-up"] });
      toast({
        title: "Follow-up Completed",
        description: "Dispute marked as requiring follow-up action."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark follow-up as completed",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Follow-up Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading follow-up alerts...</p>
        </CardContent>
      </Card>
    );
  }

  if (followUpDisputes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Follow-up Alerts
          </CardTitle>
          <CardDescription>
            No disputes requiring follow-up at this time
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Follow-up Alerts
          <Badge variant="destructive">{followUpDisputes.length}</Badge>
        </CardTitle>
        <CardDescription>
          Disputes requiring immediate follow-up action
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {followUpDisputes.map((dispute: Dispute) => {
          const daysPastDue = dispute.followUpDate 
            ? Math.floor((new Date().getTime() - new Date(dispute.followUpDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          return (
            <div key={dispute.id} className="border rounded-lg p-4 bg-destructive/5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{dispute.bureau}</Badge>
                    <Badge variant="destructive">
                      {daysPastDue} day{daysPastDue !== 1 ? 's' : ''} overdue
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">Dispute ID: {dispute.id}</p>
                    <p className="text-sm text-muted-foreground">
                      Delivered: {dispute.deliveryDate ? formatDate(dispute.deliveryDate) : 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Follow-up due: {dispute.followUpDate ? formatDate(dispute.followUpDate) : 'Unknown'}
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                    <div className="flex items-center gap-2 font-medium text-yellow-800">
                      <Phone className="h-4 w-4" />
                      Action Required
                    </div>
                    <p className="text-yellow-700 mt-1">
                      Call {dispute.bureau} credit bureau to check dispute status and request removal if not processed within the legal timeframe.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAlertSentMutation.mutate(dispute.id)}
                  disabled={markAlertSentMutation.isPending}
                  className="ml-4"
                >
                  {markAlertSentMutation.isPending ? "Marking..." : "Mark Completed"}
                </Button>
              </div>
            </div>
          );
        })}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-medium text-blue-800 mb-2">Credit Bureau Contact Information:</p>
          <div className="space-y-1 text-blue-700">
            <p><strong>Equifax:</strong> 1-800-685-1111</p>
            <p><strong>Experian:</strong> 1-888-397-3742</p>
            <p><strong>TransUnion:</strong> 1-800-916-8800</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}