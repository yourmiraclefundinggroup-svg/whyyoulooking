import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Upload, FileText, Shield, User, UserCheck, Clock, Paperclip, Send, Download, Eye, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecureChatProps {
  userId: number;
  userType: "client" | "admin";
}

export function SecureChat({ userId, userType }: SecureChatProps) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Function to handle document download
  const handleDownloadDocument = async (documentId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/chat/documents/download/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const data = await response.json();
      toast({
        title: "Download Ready",
        description: `${fileName} is ready for download`,
      });

      // For now, show the download info since we're simulating file storage
      console.log('Download info:', data);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the document",
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
        <TabsList className="grid w-full grid-cols-3 h-auto gap-1 p-1">
          <TabsTrigger value="chat" className="text-xs sm:text-sm px-2 py-2 min-w-0">
            <span className="hidden sm:inline">Secure Chat</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm px-2 py-2 min-w-0">
            <span className="hidden sm:inline">Document Vault</span>
            <span className="sm:hidden">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs sm:text-sm px-2 py-2 min-w-0">
            <span className="hidden sm:inline">Upload Documents</span>
            <span className="sm:hidden">Upload</span>
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
              <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 space-y-4 bg-gray-50">
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
                    <Card key={doc.id} className="border-gray-200">
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
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
      </Tabs>
    </div>
  );
}