import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Tags, 
  Plus, 
  Filter, 
  FileText, 
  Image, 
  CreditCard, 
  AlertTriangle, 
  Clock,
  Shield,
  Star,
  X,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentTag {
  id: number;
  name: string;
  category: string;
  color: string;
  description?: string;
  isSystemTag: boolean;
  usageCount: number;
  createdAt: string;
}

interface ChatDocument {
  id: number;
  fileName: string;
  fileType: string;
  documentType: string;
  smartTags?: string[];
  customTags?: string[];
  extractedText?: string;
  confidence?: number;
  needsReview?: boolean;
  createdAt: string;
}

interface SmartDocumentTagsProps {
  documents: ChatDocument[];
  onRefresh?: () => void;
}

const categoryIcons = {
  CONTENT: FileText,
  FORMAT: Image,
  PURPOSE: CreditCard,
  URGENCY: AlertTriangle,
  COMPLIANCE: Shield
};

const categoryColors = {
  CONTENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  FORMAT: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  PURPOSE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  URGENCY: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  COMPLIANCE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
};

export function SmartDocumentTags({ documents, onRefresh }: SmartDocumentTagsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<ChatDocument | null>(null);
  const [newCustomTag, setNewCustomTag] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available tags
  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ["/api/documents/tags"],
    queryFn: () => apiRequest("GET", "/api/documents/tags").then(res => res.json())
  });

  // Search documents with tags
  const { data: searchResults = [], refetch: refetchSearch } = useQuery({
    queryKey: ["/api/documents/search", searchQuery, selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      return apiRequest("GET", `/api/documents/search?${params.toString()}`).then(res => res.json());
    },
    enabled: false
  });

  // Mutation to update document custom tags
  const updateTagsMutation = useMutation({
    mutationFn: ({ documentId, customTags }: { documentId: number, customTags: string[] }) => 
      apiRequest("PATCH", `/api/documents/${documentId}/tags`, { customTags }),
    onSuccess: () => {
      toast({ title: "Success", description: "Document tags updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/search"] });
      onRefresh?.();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update document tags", variant: "destructive" });
    }
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.extractedText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      [...(doc.smartTags || []), ...(doc.customTags || [])].some(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (selectedCategory === "all") return matchesSearch;
    
    const categoryTags = tags
      .filter((tag: DocumentTag) => tag.category === selectedCategory)
      .map((tag: DocumentTag) => tag.name);
    
    const hasMatchingTag = [...(doc.smartTags || []), ...(doc.customTags || [])].some(tag => 
      categoryTags.includes(tag)
    );
    
    return matchesSearch && hasMatchingTag;
  });

  const addCustomTag = (document: ChatDocument) => {
    if (!newCustomTag.trim()) return;
    
    const currentTags = document.customTags || [];
    if (currentTags.includes(newCustomTag.trim())) {
      toast({ title: "Info", description: "Tag already exists", variant: "default" });
      return;
    }

    const updatedTags = [...currentTags, newCustomTag.trim()];
    updateTagsMutation.mutate({ documentId: document.id, customTags: updatedTags });
    setNewCustomTag("");
  };

  const removeCustomTag = (document: ChatDocument, tagToRemove: string) => {
    const updatedTags = (document.customTags || []).filter(tag => tag !== tagToRemove);
    updateTagsMutation.mutate({ documentId: document.id, customTags: updatedTags });
  };

  const getTagInfo = (tagName: string) => {
    return tags.find((tag: DocumentTag) => tag.name === tagName);
  };

  const renderTag = (tagName: string, isCustom: boolean = false, document?: ChatDocument) => {
    const tagInfo = getTagInfo(tagName);
    const category = tagInfo?.category || "CONTENT";
    const Icon = categoryIcons[category as keyof typeof categoryIcons];

    return (
      <Badge
        key={tagName}
        variant="secondary"
        className={`${categoryColors[category as keyof typeof categoryColors]} flex items-center gap-1 text-xs`}
        style={{ backgroundColor: tagInfo?.color ? `${tagInfo.color}20` : undefined }}
      >
        <Icon className="h-3 w-3" />
        {tagName}
        {isCustom && tagInfo?.isSystemTag && (
          <Star className="h-3 w-3" />
        )}
        {isCustom && document && (
          <X
            className="h-3 w-3 cursor-pointer hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              removeCustomTag(document, tagName);
            }}
          />
        )}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          Smart Document Tagging System
        </CardTitle>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents by name, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="CONTENT">Content Tags</SelectItem>
              <SelectItem value="FORMAT">Format Tags</SelectItem>
              <SelectItem value="PURPOSE">Purpose Tags</SelectItem>
              <SelectItem value="URGENCY">Urgency Tags</SelectItem>
              <SelectItem value="COMPLIANCE">Compliance Tags</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">Tagged Documents</TabsTrigger>
            <TabsTrigger value="tags">Tag Management</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredDocuments.map((document) => (
                  <Card key={document.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{document.fileName}</h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {document.documentType} • {new Date(document.createdAt).toLocaleDateString()}
                        </p>
                        
                        {/* AI Smart Tags */}
                        {document.smartTags && document.smartTags.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">AI Tags:</p>
                            <div className="flex flex-wrap gap-1">
                              {document.smartTags.map(tag => renderTag(tag))}
                            </div>
                          </div>
                        )}

                        {/* Custom Tags */}
                        {document.customTags && document.customTags.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Tags:</p>
                            <div className="flex flex-wrap gap-1">
                              {document.customTags.map(tag => renderTag(tag, true, document))}
                            </div>
                          </div>
                        )}

                        {/* Add Custom Tag Input */}
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            placeholder="Add custom tag..."
                            value={selectedDocument?.id === document.id ? newCustomTag : ""}
                            onChange={(e) => {
                              setSelectedDocument(document);
                              setNewCustomTag(e.target.value);
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addCustomTag(document);
                              }
                            }}
                            className="flex-1 h-8 text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => addCustomTag(document)}
                            disabled={updateTagsMutation.isPending}
                            className="h-8 px-3"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Confidence Score and Review Status */}
                      <div className="flex flex-col items-end gap-1">
                        {document.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(document.confidence * 100)}% confident
                          </Badge>
                        )}
                        {document.needsReview && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Review Needed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery || selectedCategory !== "all" 
                      ? "No documents match your search criteria"
                      : "No documents available"
                    }
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tags" className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {Object.entries(categoryColors).map(([category, colorClass]) => {
                  const categoryTags = tags.filter((tag: DocumentTag) => tag.category === category);
                  if (categoryTags.length === 0) return null;

                  const Icon = categoryIcons[category as keyof typeof categoryIcons];

                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" />
                        <h4 className="font-medium text-sm">{category.replace('_', ' ')} Tags</h4>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {categoryTags.map((tag: DocumentTag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className={`${colorClass} flex items-center gap-1`}
                          >
                            <Icon className="h-3 w-3" />
                            {tag.name}
                            <span className="text-xs opacity-60">({tag.usageCount})</span>
                          </Badge>
                        ))}
                      </div>
                      <Separator />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default SmartDocumentTags;