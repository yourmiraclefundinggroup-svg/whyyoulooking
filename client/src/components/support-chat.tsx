import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send, Bot, User, Phone, Mail, Clock, AlertCircle, CheckCircle, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  sender: "USER" | "AI" | "AGENT";
  message: string;
  createdAt: string;
  confidence?: number;
  sentiment?: string;
}

interface SupportChatProps {
  userId?: number;
  embedded?: boolean;
}

export function SupportChat({ userId, embedded = false }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [conversationStatus, setConversationStatus] = useState<"ACTIVE" | "RESOLVED" | "ESCALATED">("ACTIVE");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize chat session
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = async () => {
    try {
      const response = await apiRequest("POST", "/api/support/chat/start", {
        userId: userId || null
      });
      const data = await response.json();
      setSessionId(data.sessionId);
      
      // Add welcome message
      setMessages([{
        id: 1,
        sender: "AI",
        message: "Hi! I'm your ScoreShift support assistant. I can help you with credit repair questions, app navigation, dispute tracking, and more. How can I assist you today?",
        createdAt: new Date().toISOString(),
        confidence: 0.95,
        sentiment: "POSITIVE"
      }]);
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      toast({
        title: "Chat Error",
        description: "Failed to start chat session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "USER",
      message: newMessage,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/support/chat/message", {
        sessionId,
        message: newMessage,
        userId: userId || null
      });
      
      const data = await response.json();
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: "AI",
        message: data.response,
        createdAt: new Date().toISOString(),
        confidence: data.confidence,
        sentiment: data.sentiment
      };

      setMessages(prev => [...prev, aiMessage]);

      // Check if escalation is suggested
      if (data.escalationSuggested) {
        setTimeout(() => {
          setShowTicketForm(true);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Message Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async (ticketData: any) => {
    try {
      const response = await apiRequest("POST", "/api/support/tickets", {
        ...ticketData,
        sessionId,
        userId: userId || null
      });
      
      const data = await response.json();
      
      toast({
        title: "Support Ticket Created",
        description: `Ticket #${data.ticketNumber} has been created. You'll hear from our team soon.`,
      });
      
      setShowTicketForm(false);
      setConversationStatus("ESCALATED");
    } catch (error) {
      console.error("Failed to create ticket:", error);
      toast({
        title: "Ticket Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive"
      });
    }
  };

  const rateSatisfaction = async (rating: number) => {
    try {
      await apiRequest("POST", "/api/support/chat/satisfaction", {
        sessionId,
        rating
      });
      
      toast({
        title: "Thank You",
        description: "Your feedback helps us improve our support.",
      });
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
  };

  if (embedded) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            ScoreShift Support
            <Badge variant={conversationStatus === "ACTIVE" ? "default" : conversationStatus === "ESCALATED" ? "destructive" : "secondary"}>
              {conversationStatus}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChatInterface 
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            showTicketForm={showTicketForm}
            setShowTicketForm={setShowTicketForm}
            createTicket={createTicket}
            rateSatisfaction={rateSatisfaction}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Chat Widget Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              ScoreShift Support
              <Badge variant={conversationStatus === "ACTIVE" ? "default" : conversationStatus === "ESCALATED" ? "destructive" : "secondary"}>
                {conversationStatus}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <ChatInterface 
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            showTicketForm={showTicketForm}
            setShowTicketForm={setShowTicketForm}
            createTicket={createTicket}
            rateSatisfaction={rateSatisfaction}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ChatInterfaceProps {
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  showTicketForm: boolean;
  setShowTicketForm: (show: boolean) => void;
  createTicket: (data: any) => void;
  rateSatisfaction: (rating: number) => void;
}

function ChatInterface({
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  isLoading,
  messagesEndRef,
  showTicketForm,
  setShowTicketForm,
  createTicket,
  rateSatisfaction
}: ChatInterfaceProps) {
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "GENERAL",
    customerInfo: {
      name: "",
      email: "",
      phone: ""
    }
  });

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "USER" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === "USER"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.sender === "USER" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-xs opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
                {message.confidence && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round(message.confidence * 100)}%
                  </Badge>
                )}
              </div>
              <p className="text-sm">{message.message}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 p-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTicketForm(true)}
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          Get Human Help
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => rateSatisfaction(5)}
        >
          <Star className="h-4 w-4 mr-1" />
          Rate Chat
        </Button>
      </div>

      {/* Message Input */}
      <div className="flex gap-2 p-4 border-t">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          disabled={isLoading}
        />
        <Button onClick={sendMessage} disabled={isLoading || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Ticket Form Modal */}
      <Dialog open={showTicketForm} onOpenChange={setShowTicketForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Human Support</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                value={ticketForm.title}
                onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of your issue"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide more details about your issue"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={ticketForm.priority}
                  onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}
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
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREDIT_REPAIR">Credit Repair</SelectItem>
                    <SelectItem value="DISPUTE_HELP">Dispute Help</SelectItem>
                    <SelectItem value="APP_NAVIGATION">App Navigation</SelectItem>
                    <SelectItem value="BILLING">Billing</SelectItem>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Contact Information</Label>
              <Input
                placeholder="Your name"
                value={ticketForm.customerInfo.name}
                onChange={(e) => setTicketForm(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, name: e.target.value }
                }))}
              />
              <Input
                placeholder="Your email"
                value={ticketForm.customerInfo.email}
                onChange={(e) => setTicketForm(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, email: e.target.value }
                }))}
              />
              <Input
                placeholder="Your phone (optional)"
                value={ticketForm.customerInfo.phone}
                onChange={(e) => setTicketForm(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, phone: e.target.value }
                }))}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => createTicket(ticketForm)}
                disabled={!ticketForm.title || !ticketForm.description || !ticketForm.customerInfo.name || !ticketForm.customerInfo.email}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTicketForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}