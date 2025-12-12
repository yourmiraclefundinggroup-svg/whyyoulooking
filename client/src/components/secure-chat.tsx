import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Upload, FileText, Shield, User, UserCheck, Clock, Paperclip, Send, Download, Eye, Lock, Tags, Brain, Bot, Sparkles, FileCheck, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SmartDocumentTags from "@/components/smart-document-tags";

interface SecureChatProps {
  userId: number;
  userType: "client" | "admin";
}

export function SecureChat({ userId, userType }: SecureChatProps) {
  const [message, setMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [aiFiles, setAiFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle viewing AI-generated letters with proper authentication
  const handleViewLetter = async (letterUrl: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch the letter content with authentication
      const response = await fetch(letterUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load dispute letter');
      }
      
      const letterContent = await response.text();
      
      // Create a new window/tab with the letter content
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>AI Generated Dispute Letter</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <h1>AI Generated Dispute Letter</h1>
            <pre>${letterContent}</pre>
          </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // Fallback for popup blockers - show in current page
        const blob = new Blob([letterContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dispute-letter.txt';
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Letter Downloaded",
          description: "Your dispute letter has been downloaded to your device",
        });
      }
    } catch (error) {
      console.error('Error viewing letter:', error);
      toast({
        title: "Error Loading Letter",
        description: "Failed to load the dispute letter. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle document download
  const handleDownloadDocument = async (documentId: number, fileName: string) => {
    try {
      toast({
        title: "Downloading File",
        description: `Getting ${fileName} ready for your device...`,
      });

      const downloadUrl = `/api/chat/documents/download/${documentId}`;
      
      // Fetch the file with authorization
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      
      // For mobile devices, use the File System Access API or fallback to traditional download
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile-specific download with better UX
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create a hidden link with download attribute
        const downloadLink = document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.href = blobUrl;
        downloadLink.download = fileName;
        
        // Add click handler to show instructions
        downloadLink.onclick = () => {
          toast({
            title: "File Ready to Save",
            description: `Tap "Download" or the share button to save ${fileName} to your device`,
            duration: 8000,
          });
        };
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Also try to trigger browser download
        setTimeout(() => {
          const fallbackLink = document.createElement('a');
          fallbackLink.href = blobUrl;
          fallbackLink.download = fileName;
          fallbackLink.target = '_blank';
          fallbackLink.rel = 'noopener noreferrer';
          document.body.appendChild(fallbackLink);
          fallbackLink.click();
          document.body.removeChild(fallbackLink);
          document.body.removeChild(downloadLink);
        }, 100);
        
        // Clean up after delay
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 10000);
        
      } else {
        // Desktop download
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        
        toast({
          title: "Download Complete",
          description: `${fileName} has been saved to your Downloads folder`,
        });
      }
      
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed", 
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle document viewing
  const handleViewDocument = async (documentId: number, fileName: string) => {
    try {
      toast({
        title: "Opening File",
        description: `Loading ${fileName} for viewing...`,
      });

      const token = localStorage.getItem('auth_token');
      const viewUrl = `/api/chat/documents/view/${documentId}`;
      
      console.log(`Fetching document ${documentId} (${fileName}) from ${viewUrl}`);
      
      // Fetch the file with authorization
      const response = await fetch(viewUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Document fetch response:', response.status, response.headers.get('Content-Type'));

      if (!response.ok) {
        console.error('Document fetch failed:', response.status, response.statusText);
        throw new Error(`Failed to load document: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('Blob created:', blob.size, 'bytes, type:', blob.type);
      
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Open in new tab
      const newTab = window.open(blobUrl, '_blank');
      if (!newTab) {
        // If popup blocked, try direct window location
        window.open(blobUrl, '_self');
      }
      
      // Clean up blob URL after some time
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
      
      toast({
        title: "File Opened",
        description: `${fileName} is now open`,
      });
      
    } catch (error) {
      console.error('View error:', error);
      toast({
        title: "View Failed",
        description: `Could not open ${fileName}. Please try downloading instead.`,
        variant: "destructive",
      });
    }
  };

  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: [`/api/chat/messages`, userId],
    enabled: !!userId,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/chat/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    }
  });

  const { data: documents } = useQuery({
    queryKey: [`/api/chat/documents`, userId],
    enabled: !!userId,
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/chat/documents/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    }
  });

  // AI conversation query
  const { data: aiConversation = [], isLoading: aiLoading } = useQuery({
    queryKey: [`/api/ai/conversation`, userId],
    enabled: !!userId,
    refetchInterval: 3000,
    queryFn: async () => {
      console.log('Fetching AI conversation for user:', userId);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/ai/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch AI conversation:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      console.log('AI conversation data:', data);
      return data;
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; files?: File[] }) => {
      const token = localStorage.getItem('auth_token');
      
      // First send the message
      const messageResponse = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          message: data.message,
          senderType: userType.toUpperCase()
        })
      });

      if (!messageResponse.ok) {
        throw new Error('Failed to send message');
      }

      // Handle file uploads if present
      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          await fetch('/api/chat/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              documentType: 'OTHER',
              uploadedBy: userType.toUpperCase()
            })
          });
        }
      }

      return messageResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/messages`, userId] });
      queryClient.invalidateQueries({ queryKey: [`/api/chat/documents`, userId] });
      setMessage("");
      setSelectedFiles([]);
    }
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const token = localStorage.getItem('auth_token');
      
      // Upload each file
      for (const file of files) {
        const response = await fetch('/api/chat/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            documentType: getDocumentType(file.name),
            uploadedBy: userType.toUpperCase()
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }
      
      return files;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/documents`, userId] });
      setUploadFiles([]);
    }
  });

  const handleSendMessage = () => {
    if (message.trim() || selectedFiles.length > 0) {
      sendMessageMutation.mutate({ message, files: selectedFiles });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadFiles(prev => [...prev, ...files]);
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = () => {
    if (uploadFiles.length > 0) {
      uploadDocumentMutation.mutate(uploadFiles);
    }
  };

  // AI message sending mutation
  const sendAIMessageMutation = useMutation({
    mutationFn: async (data: { message: string; files?: File[] }) => {
      console.log('Sending AI message:', { userId, message: data.message });
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          message: data.message,
          files: data.files?.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
          })) || []
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI chat error:', response.status, errorText);
        throw new Error(`Failed to send AI message: ${response.status} ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('AI response success:', data);
      queryClient.invalidateQueries({ queryKey: [`/api/ai/conversation`, userId] });
      setAiMessage("");
      setAiFiles([]);
    },
    onError: (error) => {
      console.error('AI message mutation error:', error);
      toast({
        title: "AI Assistant Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSendAIMessage = () => {
    if (aiMessage.trim() || aiFiles.length > 0) {
      sendAIMessageMutation.mutate({ message: aiMessage, files: aiFiles });
    }
  };

  const handleAIFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAiFiles(prev => [...prev, ...files]);
  };

  const removeAIFile = (index: number) => {
    setAiFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getDocumentType = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.includes('id') || name.includes('license') || name.includes('passport')) return 'ID_DOCUMENT';
    if (name.includes('ssn') || name.includes('social')) return 'SSN_DOCUMENT';
    if (name.includes('bank') || name.includes('statement')) return 'FINANCIAL_DOCUMENT';
    if (name.includes('bureau') || name.includes('response')) return 'BUREAU_RESPONSE';
    if (name.includes('utility') || name.includes('bill')) return 'UTILITY_BILL';
    if (name.includes('pay') || name.includes('stub')) return 'PAYSTUB';
    return 'OTHER';
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Use real messages from API or empty array if loading/none
  const chatMessages = messages || [];

  // Use real documents from API or empty array if loading/none
  const userDocuments = documents || [];

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-600" />;
    if (fileType.includes('image')) return <Eye className="h-4 w-4 text-blue-600" />;
    return <Paperclip className="h-4 w-4 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED": return "default";
      case "PENDING_REVIEW": return "secondary";
      case "REJECTED": return "destructive";
      default: return "outline";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "ID_DOCUMENT": return "ID Document";
      case "SSN_DOCUMENT": return "SSN Document";
      case "FINANCIAL_DOCUMENT": return "Financial Document";
      case "BUREAU_RESPONSE": return "Bureau Response";
      case "UTILITY_BILL": return "Utility Bill";
      case "PAYSTUB": return "Pay Stub";
      default: return "Document";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-auto gap-1 p-1">
          <TabsTrigger value="chat" className="text-xs sm:text-sm px-2 py-2 min-w-0">
            <span className="hidden sm:inline">Secure Chat</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="text-xs sm:text-sm px-2 py-2 min-w-0">
            <Brain className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm px-2 py-2 min-w-0">
            <span className="hidden sm:inline">Document Vault</span>
            <span className="sm:hidden">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs sm:text-sm px-2 py-2 min-w-0">
            <span className="hidden sm:inline">Upload Documents</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="text-xs sm:text-sm px-2 py-2 min-w-0">
            <Tags className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Smart Tags</span>
            <span className="sm:hidden">Tags</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Secure Communication
                <Badge variant="outline" className="ml-auto">
                  <Lock className="h-3 w-3 mr-1" />
                  Encrypted
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Messages Area */}
              <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading messages...</div>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === userType ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderType === userType
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.senderType === userType ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <UserCheck className="h-3 w-3" />
                        )}
                        <span className="text-xs font-medium">
                          {msg.senderType === userType ? "You" : (msg.senderType === "ADMIN" ? "Credit Specialist" : "Client")}
                        </span>
                        <Clock className="h-3 w-3 ml-auto" />
                        <span className="text-xs opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* File Attachments Preview */}
              {selectedFiles.length > 0 && (
                <div className="border rounded-lg p-3 mb-4 bg-blue-50">
                  <p className="text-sm font-medium mb-2">Attachments:</p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {getFileIcon(file.type)}
                        <span>{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(idx)}
                          className="ml-auto h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending || (!message.trim() && selectedFiles.length === 0)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Assistant
                <Badge variant="outline" className="ml-auto">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* AI Messages Area */}
              <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 space-y-4 bg-gradient-to-b from-purple-50 to-blue-50">
                {aiLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading AI conversation...</div>
                  </div>
                ) : aiConversation.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                      <h3 className="font-semibold text-lg mb-2">AI Credit Repair Assistant</h3>
                      <p className="mb-2">Ask me to help you with:</p>
                      <ul className="text-sm space-y-1 text-left max-w-md">
                        <li className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-blue-500" />
                          Generate dispute letters for credit issues
                        </li>
                        <li className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          Analyze uploaded credit reports and documents
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-orange-500" />
                          Create personalized credit improvement strategies
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          Review bureau responses and recommend next steps
                        </li>
                      </ul>
                      <p className="text-sm mt-4">Start by typing a message or uploading a document!</p>
                    </div>
                  </div>
                ) : (
                  aiConversation.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white border shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {msg.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4 text-purple-600" />
                          )}
                          <span className="text-sm font-medium">
                            {msg.role === 'user' ? "You" : "AI Assistant"}
                          </span>
                          <Clock className="h-3 w-3 ml-auto opacity-75" />
                          <span className="text-xs opacity-75">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                        
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-opacity-20">
                            <p className="text-xs opacity-75 mb-1">Attachments:</p>
                            {msg.attachments.map((file: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1 text-xs">
                                {getFileIcon(file.type)}
                                <span>{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {msg.letterGenerated && (
                          <div className="mt-2 pt-2 border-t border-opacity-20">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleViewLetter(msg.letterUrl!)}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              View Generated Letter
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={aiMessagesEndRef} />
              </div>

              {/* AI File Attachments Preview */}
              {aiFiles.length > 0 && (
                <div className="border rounded-lg p-3 mb-4 bg-purple-50">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    Files for AI Analysis:
                  </p>
                  <div className="space-y-2">
                    {aiFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {getFileIcon(file.type)}
                        <span>{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAIFile(idx)}
                          className="ml-auto h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Message Input */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="Ask the AI to generate letters, analyze documents, or provide credit advice..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendAIMessage()}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                <input
                  ref={aiFileInputRef}
                  type="file"
                  multiple
                  onChange={handleAIFileSelect}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => aiFileInputRef.current?.click()}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendAIMessage}
                  disabled={sendAIMessageMutation.isPending || (!aiMessage.trim() && aiFiles.length === 0)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {sendAIMessageMutation.isPending ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* AI Quick Actions */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiMessage("Generate a dispute letter for inaccurate collections account")}
                  className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <FileCheck className="h-3 w-3 mr-1" />
                  Dispute Letter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiMessage("Analyze my credit report and recommend improvement strategies")}
                  className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Credit Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Secure Document Vault
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No documents uploaded yet</p>
                  <p className="text-sm text-gray-400">Upload documents in the Upload tab to see them here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userDocuments.map((doc: any) => (
                    <Card key={doc.id} className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getFileIcon(doc.fileType)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.fileName}</p>
                          <p className="text-xs text-gray-600">{(doc.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                          <Badge variant={getStatusColor(doc.status || 'PENDING_REVIEW')} className="mt-1 text-xs">
                            {(doc.status || 'PENDING_REVIEW').replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                          <span>Category</span>
                          <span>{getCategoryLabel(doc.documentType || 'OTHER')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                          <span>Uploaded</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1">
                            <Lock className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Encrypted</span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs px-1"
                              onClick={() => handleViewDocument(doc.id, doc.fileName)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs px-1"
                              onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  ))
                }</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Secure Documents</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop files here or click to browse
                </p>
                <input
                  ref={uploadInputRef}
                  type="file"
                  multiple
                  onChange={handleUploadFileSelect}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <Button variant="outline" onClick={() => uploadInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  Supported: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
                </p>
              </div>

              {/* Selected Files Preview */}
              {uploadFiles.length > 0 && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Selected Files ({uploadFiles.length})</h4>
                    <Button 
                      onClick={handleDocumentUpload}
                      disabled={uploadDocumentMutation.isPending}
                      className="h-8"
                    >
                      {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload All'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {uploadFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm bg-white p-2 rounded">
                        {getFileIcon(file.type)}
                        <span className="flex-1 truncate">{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadFile(idx)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Required Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Government ID", status: "✓ Uploaded", color: "text-green-600" },
                        { name: "Social Security Card", status: "✓ Uploaded", color: "text-green-600" },
                        { name: "Bank Statements", status: "✓ Uploaded", color: "text-green-600" },
                        { name: "Bureau Responses", status: "✓ Uploaded", color: "text-green-600" },
                        { name: "Pay Stubs", status: "⚠ Needed", color: "text-yellow-600" },
                        { name: "Utility Bills", status: "⚠ Needed", color: "text-yellow-600" }
                      ].map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">{doc.name}</span>
                          <span className={`text-xs font-medium ${doc.color}`}>{doc.status}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Security & Privacy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm">256-bit AES encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">SOC 2 compliant storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Admin-only access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Automatic purging after case closure</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <SmartDocumentTags 
            documents={userDocuments} 
            onRefresh={() => queryClient.invalidateQueries({ queryKey: [`/api/chat/documents`, userId] })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}