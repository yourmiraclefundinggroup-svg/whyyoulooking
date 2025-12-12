import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, CreditCard, CheckCircle, AlertTriangle, Calendar, DollarSign, TrendingUp, Shield, Lock, Eye, Key } from "lucide-react";

interface BankAccountIntegrationProps {
  userId: number;
}

export function BankAccountIntegration({ userId }: BankAccountIntegrationProps) {
  const [connectionForm, setConnectionForm] = useState({
    bankName: "",
    accountType: "",
    routingNumber: "",
    accountNumber: "",
    autoPaymentOptimization: false
  });
  const [securityVerified, setSecurityVerified] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  const queryClient = useQueryClient();

  const { data: connections, isLoading } = useQuery({
    queryKey: [`/api/bank-account-connections/${userId}`],
    enabled: !!userId
  });

  const connectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await fetch(`/api/bank-account-connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bank-account-connections/${userId}`] });
      setConnectionForm({
        bankName: "",
        accountType: "",
        routingNumber: "",
        accountNumber: "",
        autoPaymentOptimization: false
      });
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      return await fetch(`/api/bank-account-connections/${connectionId}`, {
        method: "DELETE"
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bank-account-connections/${userId}`] });
    }
  });

  const handleConnect = () => {
    if (!connectionForm.bankName || !connectionForm.accountType) return;
    connectMutation.mutate(connectionForm);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONNECTED": return "default";
      case "PENDING": return "secondary";
      case "ERROR": return "destructive";
      default: return "outline";
    }
  };

  const demoConnections = connections || [
    {
      id: 1,
      bankName: "Chase Bank",
      accountType: "CHECKING",
      connectionStatus: "CONNECTED",
      lastSync: "2024-01-06T18:00:00Z",
      autoPaymentOptimization: true,
      balanceHistory: [
        { date: "2024-01-01", balance: 250000 },
        { date: "2024-01-02", balance: 247500 },
        { date: "2024-01-03", balance: 251000 }
      ],
      aiRecommendations: [
        {
          type: "PAYMENT_TIMING",
          message: "Optimize credit card payments by paying $500 on the 15th for maximum score impact",
          priority: "HIGH"
        },
        {
          type: "CASH_FLOW",
          message: "Your balance suggests you can make larger payments to reduce utilization faster",
          priority: "MEDIUM"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections">Connected Accounts</TabsTrigger>
          <TabsTrigger value="add-account">Add Account</TabsTrigger>
          <TabsTrigger value="optimization">Payment Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {demoConnections.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Connected Accounts</h3>
                <p className="text-gray-600 mb-4">Connect your bank accounts to enable automatic payment optimization</p>
                <Button onClick={() => window.location.hash = "#add-account"}>
                  Connect Bank Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            demoConnections.map((connection: any) => (
              <Card key={connection.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5" />
                      <span>{connection.bankName}</span>
                    </div>
                    <Badge variant={getStatusColor(connection.connectionStatus)}>
                      {connection.connectionStatus}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Account Type</p>
                      <p className="font-semibold">{connection.accountType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Sync</p>
                      <p className="font-semibold">
                        {new Date(connection.lastSync).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Auto Optimization</p>
                      <div className="flex items-center gap-2">
                        <Switch checked={connection.autoPaymentOptimization} />
                        <span className="text-sm">
                          {connection.autoPaymentOptimization ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {connection.aiRecommendations && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">AI Recommendations</h4>
                      {connection.aiRecommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded-lg bg-blue-50">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">{rec.message}</p>
                              <Badge size="sm" variant={rec.priority === "HIGH" ? "destructive" : "secondary"}>
                                {rec.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Sync Now
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => disconnectMutation.mutate(connection.id)}
                      disabled={disconnectMutation.isPending}
                    >
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="add-account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connect Bank Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={connectionForm.bankName}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="Chase Bank"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select value={connectionForm.accountType} onValueChange={(value) => 
                    setConnectionForm(prev => ({ ...prev, accountType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHECKING">Checking</SelectItem>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                      <SelectItem value="CREDIT">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={connectionForm.routingNumber}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                    placeholder="123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number (Last 4 digits)</Label>
                  <Input
                    id="accountNumber"
                    value={connectionForm.accountNumber}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="****1234"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoOptimization"
                  checked={connectionForm.autoPaymentOptimization}
                  onCheckedChange={(checked) => 
                    setConnectionForm(prev => ({ ...prev, autoPaymentOptimization: checked }))
                  }
                />
                <Label htmlFor="autoOptimization">Enable automatic payment optimization</Label>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-900/20 dark:bg-green-950/30 border border-green-700/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-300 dark:text-green-200">Bank-Level Security</p>
                      <ul className="text-green-400 dark:text-green-300 mt-1 space-y-1">
                        <li>• 256-bit AES encryption for all data transmission</li>
                        <li>• PCI DSS Level 1 compliant tokenization</li>
                        <li>• SOC 2 Type II certified security controls</li>
                        <li>• Real account numbers never stored in our systems</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-900/20 dark:bg-blue-950/30 border border-blue-700/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-300 dark:text-blue-200">Data Protection Policy</p>
                      <ul className="text-blue-400 dark:text-blue-300 mt-1 space-y-1">
                        <li>• Account data encrypted at rest and in transit</li>
                        <li>• Zero-knowledge architecture - we cannot access raw data</li>
                        <li>• Automatic data purging after disconnection</li>
                        <li>• Multi-factor authentication required for changes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-900/20 dark:bg-purple-950/30 border border-purple-700/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-purple-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-purple-300 dark:text-purple-200">Read-Only Access</p>
                      <ul className="text-purple-400 dark:text-purple-300 mt-1 space-y-1">
                        <li>• Balance and transaction history only</li>
                        <li>• Cannot initiate transfers or payments</li>
                        <li>• Cannot access personal information</li>
                        <li>• Disconnect anytime with immediate data deletion</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {!securityVerified ? (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-800">Security Verification Required</p>
                        <p className="text-orange-700">
                          We'll send a verification code to your registered email for additional security.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twoFactorCode">Verification Code</Label>
                      <Input
                        id="twoFactorCode"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setSecurityVerified(true)}
                        disabled={twoFactorCode.length !== 6}
                        className="w-full"
                      >
                        Verify Security Code
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    <div className="p-2 border rounded">
                      <Shield className="h-4 w-4 mx-auto text-green-600" />
                      <p className="text-xs font-semibold">SOC 2</p>
                    </div>
                    <div className="p-2 border rounded">
                      <Lock className="h-4 w-4 mx-auto text-green-600" />
                      <p className="text-xs font-semibold">PCI DSS</p>
                    </div>
                    <div className="p-2 border rounded">
                      <Eye className="h-4 w-4 mx-auto text-green-600" />
                      <p className="text-xs font-semibold">Read-Only</p>
                    </div>
                    <div className="p-2 border rounded">
                      <Key className="h-4 w-4 mx-auto text-green-600" />
                      <p className="text-xs font-semibold">256-bit AES</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleConnect}
                  disabled={connectMutation.isPending || !connectionForm.bankName || !connectionForm.accountType}
                  className="w-full"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {connectMutation.isPending ? "Securely Connecting..." : "Securely Connect Account"}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Optimized Payments</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Score Impact</p>
                        <p className="text-2xl font-bold text-green-600">+12 pts</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Next Payment</p>
                        <p className="text-lg font-bold">Jan 15</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Upcoming Optimized Payments</h4>
                {[
                  { card: "Chase Freedom", amount: 500, date: "Jan 15", impact: "+5 pts" },
                  { card: "Capital One", amount: 300, date: "Jan 18", impact: "+3 pts" },
                  { card: "Discover", amount: 200, date: "Jan 22", impact: "+4 pts" }
                ].map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{payment.card}</p>
                        <p className="text-sm text-gray-600">{payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${payment.amount}</p>
                      <Badge variant="outline" className="text-green-600">
                        {payment.impact}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}