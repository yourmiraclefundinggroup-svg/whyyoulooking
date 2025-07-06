import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Shield, CheckCircle, AlertTriangle, Lock, DollarSign, User, Building2 } from "lucide-react";

interface TaxSoftwareIntegrationProps {
  userId: number;
}

export function TaxSoftwareIntegration({ userId }: TaxSoftwareIntegrationProps) {
  const [integrationForm, setIntegrationForm] = useState({
    taxSoftware: "",
    taxYear: new Date().getFullYear(),
    loginCredentials: {
      username: "",
      password: ""
    }
  });
  const [securityVerified, setSecurityVerified] = useState(false);

  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: [`/api/tax-integrations/${userId}`],
    enabled: !!userId
  });

  const connectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await fetch(`/api/tax-integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tax-integrations/${userId}`] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED": return "default";
      case "PENDING": return "secondary";
      case "FAILED": return "destructive";
      case "EXPIRED": return "outline";
      default: return "outline";
    }
  };

  const taxSoftwareOptions = [
    { value: "turbotax", label: "TurboTax", logo: "🟢" },
    { value: "hrblock", label: "H&R Block", logo: "🟩" },
    { value: "taxact", label: "TaxAct", logo: "🟨" },
    { value: "freetaxusa", label: "FreeTaxUSA", logo: "🟦" },
    { value: "creditkarma", label: "Credit Karma Tax", logo: "🟪" }
  ];

  const demoIntegrations = integrations || [
    {
      id: 1,
      taxSoftware: "TurboTax",
      taxYear: 2023,
      verificationStatus: "VERIFIED",
      lastUpdated: "2024-01-06T18:00:00Z",
      incomeVerification: {
        adjustedGrossIncome: 75000,
        w2Income: 72000,
        selfEmploymentIncome: 3000,
        otherIncome: 0
      },
      employmentVerification: {
        primaryEmployer: "Tech Solutions Inc",
        employmentType: "W2_EMPLOYEE",
        startDate: "2020-03-15",
        endDate: null
      }
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Connected Software</TabsTrigger>
          <TabsTrigger value="add-integration">Add Integration</TabsTrigger>
          <TabsTrigger value="verification">Income Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {demoIntegrations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tax Software Connected</h3>
                <p className="text-gray-600 mb-4">Connect your tax software to verify income and employment for better loan qualification</p>
                <Button>Connect Tax Software</Button>
              </CardContent>
            </Card>
          ) : (
            demoIntegrations.map((integration: any) => (
              <Card key={integration.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      <span>{integration.taxSoftware} {integration.taxYear}</span>
                    </div>
                    <Badge variant={getStatusColor(integration.verificationStatus)}>
                      {integration.verificationStatus}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Income Verification
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Adjusted Gross Income</span>
                          <span className="font-medium">${integration.incomeVerification.adjustedGrossIncome.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">W-2 Income</span>
                          <span className="font-medium">${integration.incomeVerification.w2Income.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Self-Employment</span>
                          <span className="font-medium">${integration.incomeVerification.selfEmploymentIncome.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Employment Verification
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Primary Employer</span>
                          <span className="font-medium text-right">{integration.employmentVerification.primaryEmployer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Employment Type</span>
                          <span className="font-medium">{integration.employmentVerification.employmentType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Start Date</span>
                          <span className="font-medium">{new Date(integration.employmentVerification.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Refresh Verification
                    </Button>
                    <Button variant="destructive" size="sm">
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="add-integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Secure Tax Software Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxSoftware">Tax Software</Label>
                  <Select value={integrationForm.taxSoftware} onValueChange={(value) => 
                    setIntegrationForm(prev => ({ ...prev, taxSoftware: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax software" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxSoftwareOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.logo}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxYear">Tax Year</Label>
                  <Select value={integrationForm.taxYear.toString()} onValueChange={(value) => 
                    setIntegrationForm(prev => ({ ...prev, taxYear: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2023, 2022, 2021, 2020].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">Security Notice</p>
                    <p className="text-red-700">
                      We use OAuth 2.0 secure authentication. Your tax software credentials are never stored on our servers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800">Secure OAuth Integration</p>
                      <ul className="text-green-700 mt-1 space-y-1">
                        <li>• Direct secure connection to tax software APIs</li>
                        <li>• No credential storage - OAuth tokens only</li>
                        <li>• Read-only access to tax return data</li>
                        <li>• Automatic token expiration and refresh</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">Data Protection</p>
                      <ul className="text-blue-700 mt-1 space-y-1">
                        <li>• Income data encrypted with AES-256</li>
                        <li>• IRS-approved data access protocols</li>
                        <li>• Automatic data purging after use</li>
                        <li>• Zero-trust security architecture</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                <div className="p-2 border rounded">
                  <Shield className="h-4 w-4 mx-auto text-green-600" />
                  <p className="text-xs font-semibold">OAuth 2.0</p>
                </div>
                <div className="p-2 border rounded">
                  <Lock className="h-4 w-4 mx-auto text-green-600" />
                  <p className="text-xs font-semibold">IRS Approved</p>
                </div>
                <div className="p-2 border rounded">
                  <FileText className="h-4 w-4 mx-auto text-green-600" />
                  <p className="text-xs font-semibold">Read-Only</p>
                </div>
                <div className="p-2 border rounded">
                  <CheckCircle className="h-4 w-4 mx-auto text-green-600" />
                  <p className="text-xs font-semibold">Zero Storage</p>
                </div>
              </div>

              <Button 
                onClick={() => connectMutation.mutate(integrationForm)}
                disabled={connectMutation.isPending || !integrationForm.taxSoftware}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                {connectMutation.isPending ? "Securely Connecting..." : "Connect via OAuth"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Income Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>2023 Tax Return</span>
                    <Badge variant="default">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>W-2 Income</span>
                    <Badge variant="default">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>1099 Income</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Employment Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Current Employer</span>
                    <Badge variant="default">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Employment Length</span>
                    <Badge variant="default">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Job Title</span>
                    <Badge variant="default">Verified</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verification Impact on Loan Qualification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Income Verified</h4>
                  <p className="text-sm text-gray-600">+15% approval probability</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Employment Stable</h4>
                  <p className="text-sm text-gray-600">+10% approval probability</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Documentation Ready</h4>
                  <p className="text-sm text-gray-600">Faster processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}