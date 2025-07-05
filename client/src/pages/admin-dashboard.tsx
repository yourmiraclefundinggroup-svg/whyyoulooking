import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { useUserContext } from "@/hooks/use-user-context";
import { AlertCircle, Users, TestTube, MessageSquare, Plus, Key, UserPlus, Eye, Trash2 } from "lucide-react";
import type { User, TestingFeedback, BetaAccess, InsertBetaAccess, InsertUser } from "@shared/schema";

// Client Profile Form Component
function ClientProfileForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [creditScore, setCreditScore] = useState(650);
  const [notes, setNotes] = useState("");

  const createClientMutation = useMutation({
    mutationFn: async (clientData: InsertUser & { creditScore: number }) => {
      // Create user
      const userResponse = await apiRequest("POST", "/api/users", JSON.stringify({
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        accessLevel: "CLIENT_VIEWER",
        isTestUser: false,
        testingNotes: clientData.testingNotes,
      }));
      
      const user = await userResponse.json();
      
      // Create credit report for the user
      await apiRequest("POST", "/api/credit-reports", JSON.stringify({
        userId: user.id,
        creditScore: clientData.creditScore,
        creditRating: getCreditRating(clientData.creditScore),
        utilizationRate: 0.3,
        accountAge: 36,
      }));
      
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/client-profiles'] });
      setFirstName("");
      setLastName("");
      setEmail("");
      setCreditScore(650);
      setNotes("");
    },
  });

  const getCreditRating = (score: number) => {
    if (score >= 750) return "EXCELLENT";
    if (score >= 700) return "GOOD";
    if (score >= 650) return "FAIR";
    return "POOR";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate({
      firstName,
      lastName,
      email,
      creditScore,
      testingNotes: notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john.doe@example.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="creditScore">Starting Credit Score</Label>
        <div className="flex items-center space-x-4">
          <Input
            id="creditScore"
            type="number"
            min="300"
            max="850"
            value={creditScore}
            onChange={(e) => setCreditScore(parseInt(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-gray-500">
            ({getCreditRating(creditScore)})
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Testing Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes about this client profile for testing..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={createClientMutation.isPending} className="w-full">
        {createClientMutation.isPending ? "Creating..." : "Create Client Profile"}
      </Button>
    </form>
  );
}

// Client Profile List Component
function ClientProfileList() {
  const { data: clientProfiles = [], isLoading } = useQuery({
    queryKey: ['/api/admin/client-profiles'],
  });

  const { setCurrentUserId } = useUserContext();

  const switchToProfileMutation = useMutation({
    mutationFn: async (userId: number) => {
      // Switch the current user context to this client
      setCurrentUserId(userId);
      return userId;
    },
    onSuccess: (userId) => {
      // Show success message and refresh the page components
      window.location.reload(); // Simple way to refresh all components with new user context
    },
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-16 bg-gray-200 rounded"></div>
      <div className="h-16 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      {clientProfiles.map((profile: User) => (
        <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div>
                <h4 className="font-medium text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h4>
                <p className="text-sm text-gray-500">{profile.email}</p>
                {profile.testingNotes && (
                  <p className="text-xs text-blue-600 mt-1">{profile.testingNotes}</p>
                )}
              </div>
              <Badge variant={profile.accessLevel === "CLIENT_VIEWER" ? "outline" : "default"}>
                {profile.accessLevel === "CLIENT_VIEWER" ? "Client Profile" : profile.accessLevel}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => switchToProfileMutation.mutate(profile.id)}
              disabled={switchToProfileMutation.isPending}
            >
              <Eye className="h-4 w-4 mr-1" />
              Test as Client
            </Button>
          </div>
        </div>
      ))}
      
      {clientProfiles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Client Profiles</h3>
          <p className="text-gray-600">
            Create client profiles to test the application features without giving clients direct access.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newAccessCode, setNewAccessCode] = useState("");
  const [accessFeatures, setAccessFeatures] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch test users
  const { data: testUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/test-users'],
  });

  // Fetch testing feedback
  const { data: feedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['/api/admin/feedback'],
  });

  // Fetch beta access codes
  const { data: betaAccess = [], isLoading: accessLoading } = useQuery({
    queryKey: ['/api/admin/beta-access'],
  });

  // Create access code mutation
  const createAccessMutation = useMutation({
    mutationFn: async (data: InsertBetaAccess) => {
      return await apiRequest("/api/admin/beta-access", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/beta-access'] });
      setIsCreateModalOpen(false);
      setNewAccessCode("");
      setAccessFeatures([]);
    },
  });

  // Update user access level
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, accessLevel }: { userId: number, accessLevel: string }) => {
      return await apiRequest(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ accessLevel }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/test-users'] });
    },
  });

  const handleCreateAccess = () => {
    if (!newAccessCode.trim() || accessFeatures.length === 0) return;

    createAccessMutation.mutate({
      userId: 1, // Default admin user
      accessCode: newAccessCode,
      features: accessFeatures,
    });
  };

  const availableFeatures = [
    "AI_DISPUTE_LETTERS",
    "USPS_TRACKING", 
    "CREDIT_SIMULATION",
    "ADVANCED_ANALYTICS",
    "PRIORITY_SUPPORT",
    "BETA_FEATURES"
  ];

  const generateAccessCode = () => {
    const code = Math.random().toString(36).substring(2, 15).toUpperCase();
    setNewAccessCode(code);
  };

  if (usersLoading || feedbackLoading || accessLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage beta testing and client access</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Access Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Beta Access Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="access-code"
                    value={newAccessCode}
                    onChange={(e) => setNewAccessCode(e.target.value)}
                    placeholder="Enter custom code or generate"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateAccessCode}
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Features Access</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={feature}
                        checked={accessFeatures.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAccessFeatures([...accessFeatures, feature]);
                          } else {
                            setAccessFeatures(accessFeatures.filter(f => f !== feature));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor={feature} className="text-sm">
                        {feature.replace(/_/g, ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleCreateAccess}
                disabled={createAccessMutation.isPending || !newAccessCode.trim()}
                className="w-full"
              >
                {createAccessMutation.isPending ? "Creating..." : "Create Access Code"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Test Users</p>
                <p className="text-2xl font-bold text-blue-600">{testUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Feedback Items</p>
                <p className="text-2xl font-bold text-green-600">{feedback.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Key className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Access Codes</p>
                <p className="text-2xl font-bold text-purple-600">{betaAccess.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Bug Reports</p>
                <p className="text-2xl font-bold text-orange-600">
                  {feedback.filter(f => f.bugReport).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="access-codes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="client-profiles">Client Profiles</TabsTrigger>
          <TabsTrigger value="access-codes">Access Codes</TabsTrigger>
          <TabsTrigger value="test-users">Test Users</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="client-profiles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Client Test Profiles</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Client Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Client Profile</DialogTitle>
                    </DialogHeader>
                    <ClientProfileForm />
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientProfileList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-codes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Beta Access Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {betaAccess.map((access: BetaAccess) => (
                  <div
                    key={access.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono">
                          {access.accessCode}
                        </code>
                        <Badge variant="outline">
                          {access.features.length} features
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {access.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Created {formatRelativeDate(access.createdAt)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Copy Code
                    </Button>
                  </div>
                ))}
                {betaAccess.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No access codes created yet. Create one to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test-users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Beta Test Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testUsers.map((user: User) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={user.accessLevel === 'BETA_TESTER' ? 'default' : 'secondary'}
                        >
                          {user.accessLevel}
                        </Badge>
                        {user.isTestUser && (
                          <Badge variant="outline">Test User</Badge>
                        )}
                      </div>
                    </div>
                    <Select
                      value={user.accessLevel}
                      onValueChange={(value) => 
                        updateUserMutation.mutate({ userId: user.id, accessLevel: value })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="BETA_TESTER">Beta Tester</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {testUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No test users registered yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Testing Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.map((item: TestingFeedback) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge>{item.feature}</Badge>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < item.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatRelativeDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{item.feedback}</p>
                    {item.bugReport && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800"><strong>Bug Report:</strong> {item.bugReport}</p>
                      </div>
                    )}
                    {item.suggestions && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800"><strong>Suggestions:</strong> {item.suggestions}</p>
                      </div>
                    )}
                  </div>
                ))}
                {feedback.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No feedback received yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableFeatures.map((feature) => {
                    const usageCount = feedback.filter(f => f.feature === feature).length;
                    return (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm">{feature.replace(/_/g, ' ')}</span>
                        <Badge variant="outline">{usageCount} tests</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableFeatures.map((feature) => {
                    const featureFeedback = feedback.filter(f => f.feature === feature);
                    const avgRating = featureFeedback.length > 0 
                      ? featureFeedback.reduce((sum, f) => sum + f.rating, 0) / featureFeedback.length
                      : 0;
                    
                    return (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm">{feature.replace(/_/g, ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < avgRating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {avgRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}