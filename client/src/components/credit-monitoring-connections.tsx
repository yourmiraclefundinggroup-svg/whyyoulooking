import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditMonitoringConnection, CreditFileSyncHistory } from "@shared/schema";
import { Shield, RefreshCw, Plus, Trash2, CheckCircle, AlertCircle, Clock, Eye, EyeOff } from "lucide-react";

interface CreditMonitoringConnectionsProps {
  userId: number;
}

const PROVIDERS = [
  { value: "IDENTITY_IQ", label: "IdentityIQ", color: "bg-blue-500" },
  { value: "EXPERIAN", label: "Experian", color: "bg-green-500" },
  { value: "SMART_CREDIT", label: "Smart Credit", color: "bg-purple-500" }
];

export function CreditMonitoringConnections({ userId }: CreditMonitoringConnectionsProps) {
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [newConnection, setNewConnection] = useState({
    provider: "",
    accountEmail: "",
    password: "",
    syncFrequency: "DAILY",
    autoSyncEnabled: true
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["/api/credit-monitoring-connections", userId],
    enabled: !!userId,
  });

  const { data: syncHistory = [] } = useQuery({
    queryKey: ["/api/credit-file-sync-history", userId],
    enabled: !!userId,
  });

  const createConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/credit-monitoring-connections", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          userId,
          credentialsEncrypted: btoa(data.password) // Simple base64 encoding for demo
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-monitoring-connections", userId] });
      setNewConnection({
        provider: "",
        accountEmail: "",
        password: "",
        syncFrequency: "DAILY",
        autoSyncEnabled: true
      });
      setIsAddDialogOpen(false);
      toast({
        title: "Connection Added",
        description: "Credit monitoring service connected successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add credit monitoring connection.",
        variant: "destructive",
      });
    }
  });

  const syncConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      return apiRequest(`/api/sync-credit-monitoring/${connectionId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-monitoring-connections", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-file-sync-history", userId] });
      toast({
        title: "Sync Complete",
        description: "Credit file synchronized successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync credit monitoring data.",
        variant: "destructive",
      });
    }
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      return apiRequest(`/api/credit-monitoring-connections/${connectionId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-monitoring-connections", userId] });
      toast({
        title: "Connection Removed",
        description: "Credit monitoring connection deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete credit monitoring connection.",
        variant: "destructive",
      });
    }
  });

  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnection.provider || !newConnection.accountEmail || !newConnection.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createConnectionMutation.mutate(newConnection);
  };

  const getProviderInfo = (provider: string) => {
    return PROVIDERS.find(p => p.value === provider) || { label: provider, color: "bg-gray-500" };
  };

  const togglePasswordVisibility = (connectionId: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [connectionId]: !prev[connectionId]
    }));
  };

  const getLastSyncForConnection = (connectionId: number) => {
    return syncHistory.find((sync: CreditFileSyncHistory) => sync.connectionId === connectionId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Credit Monitoring Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Credit Monitoring Connections
              </CardTitle>
              <CardDescription>
                Connect your credit monitoring accounts for automatic credit file syncing
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Connection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Credit Monitoring Connection</DialogTitle>
                  <DialogDescription>
                    Connect your credit monitoring service to automatically sync your credit file
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddConnection} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Credit Monitoring Service</Label>
                    <Select
                      value={newConnection.provider}
                      onValueChange={(value) => setNewConnection(prev => ({ ...prev, provider: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDERS.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${provider.color}`} />
                              {provider.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountEmail">Account Email</Label>
                    <Input
                      id="accountEmail"
                      type="email"
                      value={newConnection.accountEmail}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, accountEmail: e.target.value }))}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Account Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newConnection.password}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Your account password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="syncFrequency">Sync Frequency</Label>
                    <Select
                      value={newConnection.syncFrequency}
                      onValueChange={(value) => setNewConnection(prev => ({ ...prev, syncFrequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoSync"
                      checked={newConnection.autoSyncEnabled}
                      onCheckedChange={(checked) => setNewConnection(prev => ({ ...prev, autoSyncEnabled: checked }))}
                    />
                    <Label htmlFor="autoSync">Enable automatic syncing</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createConnectionMutation.isPending}>
                      {createConnectionMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Add Connection
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Connections Yet</h3>
              <p className="text-muted-foreground mb-4">
                Connect your credit monitoring accounts to automatically sync your credit file
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Connection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection: CreditMonitoringConnection) => {
                const providerInfo = getProviderInfo(connection.provider);
                const lastSync = getLastSyncForConnection(connection.id);
                return (
                  <Card key={connection.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg ${providerInfo.color} flex items-center justify-center text-white font-semibold`}>
                            {providerInfo.label.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{providerInfo.label}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{connection.accountEmail}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={connection.isActive ? "default" : "secondary"}>
                                {connection.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline">
                                {connection.syncFrequency.toLowerCase()}
                              </Badge>
                              {connection.autoSyncEnabled && (
                                <Badge variant="outline" className="text-blue-600">
                                  Auto-sync
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => syncConnectionMutation.mutate(connection.id)}
                            disabled={syncConnectionMutation.isPending}
                            size="sm"
                            variant="outline"
                          >
                            {syncConnectionMutation.isPending ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Sync Now
                          </Button>
                          <Button
                            onClick={() => deleteConnectionMutation.mutate(connection.id)}
                            disabled={deleteConnectionMutation.isPending}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {lastSync && (
                        <>
                          <Separator className="my-4" />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-300">Last Sync</p>
                              <p className="font-medium">{new Date(lastSync.syncDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-300">Status</p>
                              <div className="flex items-center gap-1">
                                {lastSync.syncStatus === "SUCCESS" ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : lastSync.syncStatus === "FAILED" ? (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                )}
                                <span className="font-medium">{lastSync.syncStatus}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-300">Issues Found</p>
                              <p className="font-medium">{lastSync.issuesFound}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-300">Score Change</p>
                              <p className={`font-medium ${lastSync.scoreChange && lastSync.scoreChange > 0 ? 'text-green-600' : lastSync.scoreChange && lastSync.scoreChange < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {lastSync.scoreChange ? (lastSync.scoreChange > 0 ? `+${lastSync.scoreChange}` : lastSync.scoreChange) : '0'}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Sync History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncHistory.slice(0, 5).map((sync: CreditFileSyncHistory) => {
                const providerInfo = getProviderInfo(sync.provider);
                return (
                  <div key={sync.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded ${providerInfo.color} flex items-center justify-center text-white text-xs font-semibold`}>
                        {providerInfo.label.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{providerInfo.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(sync.syncDate).toLocaleDateString()} at {new Date(sync.syncDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300">Issues</p>
                        <p className="font-medium">{sync.issuesFound}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300">Score</p>
                        <p className={`font-medium ${sync.scoreChange && sync.scoreChange > 0 ? 'text-green-600' : sync.scoreChange && sync.scoreChange < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {sync.scoreChange ? (sync.scoreChange > 0 ? `+${sync.scoreChange}` : sync.scoreChange) : '0'}
                        </p>
                      </div>
                      <Badge variant={sync.syncStatus === "SUCCESS" ? "default" : sync.syncStatus === "FAILED" ? "destructive" : "secondary"}>
                        {sync.syncStatus}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}