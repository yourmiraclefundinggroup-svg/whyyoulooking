import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, CheckCircle, AlertTriangle, Shield, FileText, Calendar, DollarSign, Upload } from "lucide-react";

interface EmploymentVerificationProps {
  userId: number;
}

export function EmploymentVerification({ userId }: EmploymentVerificationProps) {
  const [verificationForm, setVerificationForm] = useState({
    employer: "",
    jobTitle: "",
    employmentType: "",
    startDate: "",
    endDate: "",
    verificationMethod: "",
    annualSalary: ""
  });

  const queryClient = useQueryClient();

  const { data: verifications, isLoading } = useQuery({
    queryKey: [`/api/employment-verifications/${userId}`],
    enabled: !!userId
  });

  const addVerificationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await fetch(`/api/employment-verifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/employment-verifications/${userId}`] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED": return "default";
      case "PENDING": return "secondary";
      case "FAILED": return "destructive";
      default: return "outline";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "HR_SYSTEM": return <Building2 className="h-4 w-4" />;
      case "PAYSTUB": return <FileText className="h-4 w-4" />;
      case "TAX_RETURN": return <DollarSign className="h-4 w-4" />;
      case "MANUAL": return <User className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const demoVerifications = verifications || [
    {
      id: 1,
      employer: "Tech Solutions Inc",
      jobTitle: "Senior Software Developer",
      employmentType: "FULL_TIME",
      startDate: "2020-03-15",
      endDate: null,
      verificationMethod: "HR_SYSTEM",
      verificationStatus: "VERIFIED",
      annualSalary: 85000,
      lastVerified: "2024-01-06T18:00:00Z",
      documents: [
        { type: "EMPLOYMENT_LETTER", status: "VERIFIED" },
        { type: "PAYSTUB", status: "VERIFIED" }
      ],
      hrSystemConnection: {
        provider: "Workday",
        status: "CONNECTED",
        lastSync: "2024-01-06T18:00:00Z"
      }
    },
    {
      id: 2,
      employer: "Freelance Consulting",
      jobTitle: "Independent Consultant",
      employmentType: "SELF_EMPLOYED",
      startDate: "2018-01-01",
      endDate: "2020-03-14",
      verificationMethod: "TAX_RETURN",
      verificationStatus: "VERIFIED",
      annualSalary: 45000,
      lastVerified: "2024-01-05T18:00:00Z"
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="verifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verifications">Employment History</TabsTrigger>
          <TabsTrigger value="add-employment">Add Employment</TabsTrigger>
          <TabsTrigger value="hr-systems">HR Systems</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="verifications" className="space-y-4">
          {demoVerifications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Employment Records</h3>
                <p className="text-gray-600 mb-4">Add your employment history to strengthen loan applications</p>
                <Button>Add Employment</Button>
              </CardContent>
            </Card>
          ) : (
            demoVerifications.map((verification: any) => (
              <Card key={verification.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5" />
                      <div>
                        <span>{verification.employer}</span>
                        <p className="text-sm font-normal text-gray-600">{verification.jobTitle}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(verification.verificationStatus)}>
                      {verification.verificationStatus}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Employment Type</p>
                      <p className="font-semibold">{verification.employmentType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Start Date</p>
                      <p className="font-semibold">{new Date(verification.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">End Date</p>
                      <p className="font-semibold">{verification.endDate ? new Date(verification.endDate).toLocaleDateString() : "Current"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Annual Salary</p>
                      <p className="font-semibold">${verification.annualSalary?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(verification.verificationMethod)}
                      <span className="text-sm">Verified via {verification.verificationMethod.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Last verified: {new Date(verification.lastVerified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {verification.hrSystemConnection && (
                    <div className="p-3 border rounded-lg bg-green-50">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="font-medium">HR System Connected</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Connected to {verification.hrSystemConnection.provider} - Auto-sync enabled
                      </p>
                    </div>
                  )}

                  {verification.documents && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Verification Documents</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {verification.documents.map((doc: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs">{doc.type.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Re-verify
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="add-employment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Add Employment Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employer">Employer Name</Label>
                  <Input
                    id="employer"
                    value={verificationForm.employer}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, employer: e.target.value }))}
                    placeholder="Tech Solutions Inc"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={verificationForm.jobTitle}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="Senior Software Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select value={verificationForm.employmentType} onValueChange={(value) => 
                    setVerificationForm(prev => ({ ...prev, employmentType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full-Time</SelectItem>
                      <SelectItem value="PART_TIME">Part-Time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="SELF_EMPLOYED">Self-Employed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualSalary">Annual Salary</Label>
                  <Input
                    id="annualSalary"
                    type="number"
                    value={verificationForm.annualSalary}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, annualSalary: e.target.value }))}
                    placeholder="75000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={verificationForm.startDate}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (if applicable)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={verificationForm.endDate}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationMethod">Verification Method</Label>
                <Select value={verificationForm.verificationMethod} onValueChange={(value) => 
                  setVerificationForm(prev => ({ ...prev, verificationMethod: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="How would you like to verify this employment?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR_SYSTEM">HR System Integration</SelectItem>
                    <SelectItem value="PAYSTUB">Upload Pay Stubs</SelectItem>
                    <SelectItem value="TAX_RETURN">Tax Return Verification</SelectItem>
                    <SelectItem value="MANUAL">Manual Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Secure Verification Process</p>
                    <ul className="text-blue-700 mt-1 space-y-1">
                      <li>• All employment data encrypted with AES-256</li>
                      <li>• Direct verification with employer HR systems when possible</li>
                      <li>• Documents securely stored and automatically purged</li>
                      <li>• GDPR and CCPA compliant data handling</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => addVerificationMutation.mutate(verificationForm)}
                disabled={addVerificationMutation.isPending || !verificationForm.employer || !verificationForm.jobTitle}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                {addVerificationMutation.isPending ? "Adding..." : "Add Employment Record"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hr-systems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HR System Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Workday", logo: "🔷", status: "CONNECTED" },
                  { name: "ADP", logo: "🟦", status: "AVAILABLE" },
                  { name: "BambooHR", logo: "🎋", status: "AVAILABLE" },
                  { name: "Gusto", logo: "💚", status: "AVAILABLE" },
                  { name: "Paychex", logo: "📊", status: "AVAILABLE" },
                  { name: "UltiPro", logo: "🔵", status: "AVAILABLE" }
                ].map((system, idx) => (
                  <Card key={idx} className={system.status === "CONNECTED" ? "border-green-200 bg-green-50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{system.logo}</span>
                        <span className="font-semibold">{system.name}</span>
                      </div>
                      <Badge variant={system.status === "CONNECTED" ? "default" : "outline"}>
                        {system.status}
                      </Badge>
                      {system.status === "CONNECTED" && (
                        <p className="text-xs text-green-700 mt-2">Auto-sync enabled</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Employment Documents</h3>
                <p className="text-gray-600 mb-4">
                  Upload pay stubs, employment letters, or other verification documents
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Accepted Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Employment offer letters
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Recent pay stubs (last 3 months)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        W-2 forms
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Employment verification letters
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Security & Privacy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-blue-600" />
                        Bank-level encryption
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-blue-600" />
                        Automatic document deletion
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-blue-600" />
                        SOC 2 compliant storage
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-blue-600" />
                        Access logging and monitoring
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}