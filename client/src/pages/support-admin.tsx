import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Ticket, 
  TrendingUp, 
  Clock, 
  User, 
  Bot, 
  Star,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Phone,
  Mail
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: number;
  sessionId: string;
  userId?: number;
  status: "ACTIVE" | "RESOLVED" | "ESCALATED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category?: string;
  escalated: boolean;
  customerSatisfaction?: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: string;
}

interface SupportTicket {
  id: number;
  ticketNumber: string;
  conversationId: number;
  userId?: number;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedTo?: string;
  customerInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface SupportMetrics {
  totalConversations: number;
  activeConversations: number;
  averageResponseTime: number;
  satisfactionRating: number;
  escalationRate: number;
  resolutionRate: number;
  topCategories: { category: string; count: number }[];
  dailyVolume: { date: string; count: number }[];
}

export default function SupportAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch support metrics
  const { data: metrics } = useQuery<SupportMetrics>({
    queryKey: ["/api/support/admin/metrics"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/support/admin/conversations", { search: searchTerm, status: statusFilter, priority: priorityFilter }],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Fetch tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support/admin/tickets", { search: searchTerm, status: statusFilter, priority: priorityFilter }],
    refetchInterval: 10000
  });

  // Update conversation mutation
  const updateConversationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Conversation> }) => {
      const response = await apiRequest("PUT", `/api/support/conversations/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/admin/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/admin/metrics"] });
      toast({
        title: "Conversation Updated",
        description: "The conversation has been updated successfully.",
      });
    }
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<SupportTicket> }) => {
      const response = await apiRequest("PUT", `/api/support/tickets/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/admin/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/admin/metrics"] });
      toast({
        title: "Ticket Updated",
        description: "The support ticket has been updated successfully.",
      });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "destructive";
      case "HIGH": return "destructive";
      case "MEDIUM": return "default";
      case "LOW": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": case "OPEN": return "default";
      case "IN_PROGRESS": return "default";
      case "ESCALATED": return "destructive";
      case "RESOLVED": case "CLOSED": return "secondary";
      case "WAITING_CUSTOMER": return "outline";
      default: return "secondary";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getResponseTimeColor = (minutes: number) => {
    if (minutes <= 5) return "text-green-600";
    if (minutes <= 15) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support Center Admin</h1>
        <Badge variant="outline" className="text-sm">
          <Clock className="h-4 w-4 mr-1" />
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                  <p className="text-2xl font-bold">{metrics.totalConversations}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.activeConversations} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <p className={`text-2xl font-bold ${getResponseTimeColor(metrics.averageResponseTime)}`}>
                    {metrics.averageResponseTime}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Target: {"<"} 5 minutes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                  <p className="text-2xl font-bold flex items-center">
                    {metrics.satisfactionRating.toFixed(1)}
                    <Star className="h-5 w-5 text-yellow-500 ml-1" />
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Out of 5.0 rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(metrics.resolutionRate)}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(metrics.escalationRate)}% escalation rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations and tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ESCALATED">Escalated</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
        </TabsList>

        {/* Conversations Tab */}
        <TabsContent value="conversations">
          <Card>
            <CardHeader>
              <CardTitle>Active Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              {conversationsLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations?.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Session {conversation.sessionId.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {conversation.lastMessage ? conversation.lastMessage.substring(0, 60) + "..." : "No messages"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(conversation.status)}>
                          {conversation.status}
                        </Badge>
                        <Badge variant={getPriorityColor(conversation.priority)}>
                          {conversation.priority}
                        </Badge>
                        {conversation.customerSatisfaction && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{conversation.customerSatisfaction}</span>
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatTime(conversation.updatedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {conversations?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No conversations found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tickets Tab */}
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets?.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium">#{ticket.ticketNumber}</p>
                            <p className="text-lg">{ticket.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {ticket.customerInfo.name} • {ticket.customerInfo.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(ticket.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {tickets?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No tickets found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Knowledge base management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Conversation Detail Modal */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Conversation Details - {selectedConversation?.sessionId}
            </DialogTitle>
          </DialogHeader>
          
          {selectedConversation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedConversation.status}
                    onValueChange={(value) => 
                      updateConversationMutation.mutate({
                        id: selectedConversation.id,
                        updates: { status: value as any }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="ESCALATED">Escalated</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={selectedConversation.priority}
                    onValueChange={(value) => 
                      updateConversationMutation.mutate({
                        id: selectedConversation.id,
                        updates: { priority: value as any }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Summary</Label>
                <Textarea
                  value={selectedConversation.summary || ""}
                  onChange={(e) => setSelectedConversation(prev => 
                    prev ? { ...prev, summary: e.target.value } : null
                  )}
                  placeholder="Add conversation summary..."
                />
              </div>
              
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Created: {formatTime(selectedConversation.createdAt)}
                </div>
                <Button
                  onClick={() => {
                    if (selectedConversation.summary !== undefined) {
                      updateConversationMutation.mutate({
                        id: selectedConversation.id,
                        updates: { summary: selectedConversation.summary }
                      });
                    }
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Ticket #{selectedTicket?.ticketNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <p className="text-lg">{selectedTicket.title}</p>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => 
                      updateTicketMutation.mutate({
                        id: selectedTicket.id,
                        updates: { status: value as any }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="WAITING_CUSTOMER">Waiting Customer</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={selectedTicket.priority}
                    onValueChange={(value) => 
                      updateTicketMutation.mutate({
                        id: selectedTicket.id,
                        updates: { priority: value as any }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Customer Information</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{selectedTicket.customerInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{selectedTicket.customerInfo.email}</span>
                  </div>
                  {selectedTicket.customerInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{selectedTicket.customerInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Created: {formatTime(selectedTicket.createdAt)}
                </div>
                <Button
                  onClick={() => 
                    updateTicketMutation.mutate({
                      id: selectedTicket.id,
                      updates: selectedTicket
                    })
                  }
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}