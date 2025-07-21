import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ExperianConnect() {
  const { toast } = useToast();
  const [experianForm, setExperianForm] = useState({
    firstName: '',
    lastName: '',
    ssn: '',
    dateOfBirth: '',
    address: {
      line1: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const connectExperianMutation = useMutation({
    mutationFn: async (personalInfo: typeof experianForm) => {
      const response = await apiRequest("POST", `/api/experian/connect`, { personalInfo });
      return response.json();
    },
    onSuccess: () => {
      setExperianForm({
        firstName: '',
        lastName: '',
        ssn: '',
        dateOfBirth: '',
        address: {
          line1: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
      toast({
        title: "Successfully Connected",
        description: "Your Experian credit monitoring is now active",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Experian",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const required = [
      { field: experianForm.firstName, name: 'First Name' },
      { field: experianForm.lastName, name: 'Last Name' },
      { field: experianForm.ssn, name: 'SSN' },
      { field: experianForm.dateOfBirth, name: 'Date of Birth' },
      { field: experianForm.address.line1, name: 'Address' },
      { field: experianForm.address.city, name: 'City' },
      { field: experianForm.address.state, name: 'State' },
      { field: experianForm.address.zipCode, name: 'ZIP Code' }
    ];
    
    const missingFields = required.filter(req => !req.field.trim());
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    connectExperianMutation.mutate(experianForm);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
            <i className="fas fa-shield-alt text-red-600 text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Connect to Experian</h1>
            <p className="mt-2 text-gray-600">
              Link your Experian account for real-time credit monitoring and automated credit report updates.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-check text-green-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-green-900">Real-Time Updates</h3>
              <p className="text-sm text-green-700">Automatic credit report syncing</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-blue-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Score Monitoring</h3>
              <p className="text-sm text-blue-700">Track credit score changes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-bell text-purple-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-purple-900">Alerts</h3>
              <p className="text-sm text-purple-700">Get notified of changes</p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Personal Information</span>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Secure & Encrypted
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            This information is used to securely connect to your Experian credit report. 
            All data is encrypted and stored securely.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={experianForm.firstName}
                  onChange={(e) => setExperianForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={experianForm.lastName}
                  onChange={(e) => setExperianForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ssn">Social Security Number *</Label>
              <Input
                id="ssn"
                type="password"
                placeholder="XXX-XX-XXXX"
                value={experianForm.ssn}
                onChange={(e) => setExperianForm(prev => ({ ...prev, ssn: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your SSN is encrypted and used only for identity verification with Experian
              </p>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={experianForm.dateOfBirth}
                onChange={(e) => setExperianForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={experianForm.address.line1}
                  onChange={(e) => setExperianForm(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, line1: e.target.value }
                  }))}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={experianForm.address.city}
                    onChange={(e) => setExperianForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="CA"
                    maxLength={2}
                    value={experianForm.address.state}
                    onChange={(e) => setExperianForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, state: e.target.value.toUpperCase() }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={experianForm.address.zipCode}
                    onChange={(e) => setExperianForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                type="submit"
                size="lg"
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                disabled={connectExperianMutation.isPending}
              >
                {connectExperianMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Connecting to Experian...
                  </>
                ) : (
                  <>
                    <i className="fas fa-shield-alt mr-2"></i>
                    Connect to Experian
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="fas fa-info-circle text-yellow-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Security & Privacy Notice</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• All personal information is encrypted using bank-level security</p>
                <p>• Your data is only used to connect to your Experian credit report</p>
                <p>• We never store your SSN in plain text</p>
                <p>• You can disconnect at any time from your account settings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}