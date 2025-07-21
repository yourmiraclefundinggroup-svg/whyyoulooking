import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, RefreshCw, Eye, AlertTriangle, TrendingUp } from "lucide-react";

interface CreditConnection {
  id: number;
  userId: number;
  provider: string;
  accountEmail: string;
  isActive: boolean;
  lastSyncDate: string;
  syncFrequency: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface CreditData {
  score: number;
  reportDate: string;
  accounts: Array<{
    accountName: string;
    accountType: string;
    balance: number;
    paymentStatus: string;
    creditLimit: number;
  }>;
  inquiries: Array<{
    creditor: string;
    inquiryDate: string;
    inquiryType: string;
  }>;
  publicRecords: Array<{
    recordType: string;
    amount: number;
    status: string;
    filedDate: string;
  }>;
}

export function ClientCreditProfilesView() {
  // Fetch all credit monitoring connections with user info
  const { data: creditConnections = [], isLoading: connectionsLoading } = useQuery<CreditConnection[]>({
    queryKey: ['/api/admin/credit-connections'],
  });

  // Function to fetch credit data for a specific user
  const fetchCreditData = async (userId: number): Promise<CreditData> => {
    const response = await fetch(`/api/admin/credit-data/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch credit data');
    return response.json();
  };

  if (connectionsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600">Loading client credit profiles...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (creditConnections.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Connections Yet</h3>
          <p className="text-gray-600 mb-4">
            No clients have connected their credit monitoring accounts yet.
          </p>
          <p className="text-sm text-gray-500">
            When clients connect their Experian accounts, their credit profiles will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Client Credit Profiles</span>
              <Badge variant="secondary">{creditConnections.length} Connected</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {creditConnections.map((connection) => (
              <ClientCreditCard key={connection.id} connection={connection} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientCreditCard({ connection }: { connection: CreditConnection }) {
  const { data: creditData, isLoading: creditLoading } = useQuery<CreditData>({
    queryKey: ['/api/admin/credit-data', connection.userId],
    enabled: connection.isActive,
  });

  const clientName = connection.user 
    ? `${connection.user.firstName} ${connection.user.lastName}`
    : 'Unknown Client';

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{clientName}</h3>
            <p className="text-sm text-gray-600">{connection.accountEmail}</p>
          </div>
          <div className="text-right">
            <Badge 
              variant={connection.isActive ? "default" : "secondary"}
              className="mb-2"
            >
              {connection.provider} {connection.isActive ? "Active" : "Inactive"}
            </Badge>
            <p className="text-xs text-gray-500">
              Last sync: {new Date(connection.lastSyncDate).toLocaleDateString()}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {creditLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span className="text-gray-600">Loading credit data...</span>
          </div>
        ) : creditData ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{creditData.score}</div>
                  <div className="text-sm text-blue-800">Credit Score</div>
                  <div className="text-xs text-gray-600">
                    as of {new Date(creditData.reportDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{creditData.accounts.length}</div>
                  <div className="text-sm text-green-800">Total Accounts</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{creditData.inquiries.length}</div>
                  <div className="text-sm text-orange-800">Recent Inquiries</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <div className="space-y-3">
                {creditData.accounts.map((account, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{account.accountName}</p>
                      <p className="text-sm text-gray-600">{account.accountType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${account.balance.toLocaleString()}</p>
                      <Badge 
                        variant={account.paymentStatus === 'Current' ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {account.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="inquiries" className="space-y-4">
              <div className="space-y-3">
                {creditData.inquiries.map((inquiry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{inquiry.creditor}</p>
                      <p className="text-sm text-gray-600">{inquiry.inquiryType}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(inquiry.inquiryDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="records" className="space-y-4">
              <div className="space-y-3">
                {creditData.publicRecords.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.recordType}</p>
                      <p className="text-sm text-gray-600">
                        Filed: {new Date(record.filedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${record.amount.toLocaleString()}</p>
                      <Badge variant="secondary" className="text-xs">
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Credit Data Unavailable</h3>
            <p className="text-gray-600 mb-4">
              Unable to retrieve credit data for this client.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}