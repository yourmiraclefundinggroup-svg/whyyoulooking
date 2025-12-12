import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TrendingUp, Gavel, ArrowUp, Clock, Search, Percent, CalendarCheck, Eye, History } from "lucide-react";
import type { EducationalContent } from "@shared/schema";

export default function Education() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: educationalContent = [], isLoading } = useQuery<EducationalContent[]>({
    queryKey: ['/api/educational-content'],
  });

  const categories = [
    { id: "CREDIT_SCORES", label: "Credit Scores", icon: TrendingUp, color: "bg-blue-500" },
    { id: "DISPUTE_PROCESS", label: "Dispute Process", icon: Gavel, color: "bg-red-500" },
    { id: "CREDIT_BUILDING", label: "Credit Building", icon: ArrowUp, color: "bg-green-500" },
  ];

  const filteredContent = educationalContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || content.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getContentByCategory = (category: string) => {
    return educationalContent.filter(content => content.category === category);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Learning Center</h1>
        <p className="mt-2 text-gray-600">
          Educational resources to help you understand and improve your credit health.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-trust-blue hover:bg-blue-700" : ""}
            >
              All Topics
            </Button>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center space-x-2",
                    selectedCategory === category.id ? "bg-trust-blue hover:bg-blue-700" : ""
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Articles</TabsTrigger>
          <TabsTrigger value="credit-scores">Credit Scores</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="building">Building Credit</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {/* Featured Articles */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredContent.slice(0, 2).map((content) => (
                <Card key={content.id} className="overflow-hidden">
                  {content.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={content.imageUrl}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {categories.find(cat => cat.id === content.category)?.label || content.category}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {content.readTime} min read
                      </span>
                    </div>
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{content.description}</p>
                    <Button className="bg-trust-blue hover:bg-blue-700">
                      Read Article
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Articles Grid */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((content) => (
                <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {content.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={content.imageUrl}
                        alt={content.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "text-white",
                          content.category === "CREDIT_SCORES" && "bg-blue-500",
                          content.category === "DISPUTE_PROCESS" && "bg-red-500",
                          content.category === "CREDIT_BUILDING" && "bg-green-500"
                        )}
                      >
                        {categories.find(cat => cat.id === content.category)?.label || content.category}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {content.readTime} min
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{content.description}</p>
                    <Button variant="outline" className="w-full">
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredContent.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Articles Found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse different categories.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="credit-scores">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getContentByCategory("CREDIT_SCORES").map((content) => (
              <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {content.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={content.imageUrl}
                      alt={content.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-500 text-white">Credit Scores</Badge>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {content.readTime} min read
                    </span>
                  </div>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{content.description}</p>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="disputes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getContentByCategory("DISPUTE_PROCESS").map((content) => (
              <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {content.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={content.imageUrl}
                      alt={content.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-red-500 text-white">Dispute Process</Badge>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {content.readTime} min read
                    </span>
                  </div>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{content.description}</p>
                  <Button className="bg-red-500 hover:bg-red-600 text-white w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="building">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getContentByCategory("CREDIT_BUILDING").map((content) => (
              <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {content.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={content.imageUrl}
                      alt={content.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-500 text-white">Credit Building</Badge>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {content.readTime} min read
                    </span>
                  </div>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{content.description}</p>
                  <Button className="bg-green-500 hover:bg-green-600 text-white w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Tips Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Credit Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Percent className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Keep Utilization Low</h3>
            <p className="text-sm text-gray-600">
              Aim to keep your credit utilization below 30% of your available credit limit.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Pay On Time</h3>
            <p className="text-sm text-gray-600">
              Payment history is the most important factor in your credit score calculation.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Monitor Regularly</h3>
            <p className="text-sm text-gray-600">
              Check your credit report regularly for errors and signs of identity theft.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Build History</h3>
            <p className="text-sm text-gray-600">
              Keep old accounts open to maintain a longer average account age.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
