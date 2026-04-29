import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    { id: "CREDIT_SCORES", label: "Credit Scores", icon: TrendingUp },
    { id: "DISPUTE_PROCESS", label: "Dispute Process", icon: Gavel },
    { id: "CREDIT_BUILDING", label: "Credit Building", icon: ArrowUp },
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

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "CREDIT_SCORES": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "DISPUTE_PROCESS": return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      case "CREDIT_BUILDING": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-1 font-medium">Resources</div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Learning Center</h1>
          <p className="mt-2 text-muted-foreground">
            Educational resources to help you understand and improve your credit health.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={selectedCategory === null ? "bg-amber-500 hover:bg-amber-400 text-black font-bold" : ""}
                size="sm"
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
                    size="sm"
                    className={cn(
                      "flex items-center gap-1.5",
                      selectedCategory === category.id ? "bg-amber-500 hover:bg-amber-400 text-black font-bold" : ""
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
            {filteredContent.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-foreground mb-4">Featured Articles</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredContent.slice(0, 2).map((content) => (
                    <Card key={content.id} className="overflow-hidden hover:border-amber-500/30 transition-colors">
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
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getCategoryBadgeClass(content.category)}`}>
                            {categories.find(cat => cat.id === content.category)?.label || content.category}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {content.readTime} min read
                          </span>
                        </div>
                        <CardTitle className="text-lg text-foreground">{content.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-4">{content.description}</p>
                        <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
                          Read Article
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Articles Grid */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">All Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((content) => (
                  <Card key={content.id} className="overflow-hidden hover:border-amber-500/30 transition-colors group">
                    {content.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={content.imageUrl}
                          alt={content.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getCategoryBadgeClass(content.category)}`}>
                          {categories.find(cat => cat.id === content.category)?.label || content.category}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {content.readTime} min
                        </span>
                      </div>
                      <CardTitle className="text-base line-clamp-2 text-foreground">{content.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{content.description}</p>
                      <Button variant="outline" className="w-full hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-400">
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Articles Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse different categories.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="credit-scores">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getContentByCategory("CREDIT_SCORES").map((content) => (
                <Card key={content.id} className="overflow-hidden hover:border-amber-500/30 transition-colors group">
                  {content.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={content.imageUrl}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Credit Scores
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {content.readTime} min
                      </span>
                    </div>
                    <CardTitle className="text-base text-foreground">{content.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">{content.description}</p>
                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {getContentByCategory("CREDIT_SCORES").length === 0 && (
                <div className="col-span-3 text-center py-12 text-muted-foreground">No articles in this category yet.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="disputes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getContentByCategory("DISPUTE_PROCESS").map((content) => (
                <Card key={content.id} className="overflow-hidden hover:border-amber-500/30 transition-colors group">
                  {content.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={content.imageUrl}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        Dispute Process
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {content.readTime} min
                      </span>
                    </div>
                    <CardTitle className="text-base text-foreground">{content.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">{content.description}</p>
                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {getContentByCategory("DISPUTE_PROCESS").length === 0 && (
                <div className="col-span-3 text-center py-12 text-muted-foreground">No articles in this category yet.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="building">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getContentByCategory("CREDIT_BUILDING").map((content) => (
                <Card key={content.id} className="overflow-hidden hover:border-amber-500/30 transition-colors group">
                  {content.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={content.imageUrl}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Credit Building
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {content.readTime} min
                      </span>
                    </div>
                    <CardTitle className="text-base text-foreground">{content.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">{content.description}</p>
                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {getContentByCategory("CREDIT_BUILDING").length === 0 && (
                <div className="col-span-3 text-center py-12 text-muted-foreground">No articles in this category yet.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Tips Section */}
        <div className="mt-12">
          <div className="text-xs uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-1 font-medium">Pro Tips</div>
          <h2 className="text-xl font-bold text-foreground mb-6">Quick Credit Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6 hover:border-amber-500/30 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Percent className="h-6 w-6 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Keep Utilization Low</h3>
              <p className="text-sm text-muted-foreground">
                Aim to keep your credit utilization below 30% of your available credit limit.
              </p>
            </Card>

            <Card className="text-center p-6 hover:border-amber-500/30 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Pay On Time</h3>
              <p className="text-sm text-muted-foreground">
                Payment history is the most important factor in your credit score calculation.
              </p>
            </Card>

            <Card className="text-center p-6 hover:border-amber-500/30 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Monitor Regularly</h3>
              <p className="text-sm text-muted-foreground">
                Check your credit report regularly for errors and signs of identity theft.
              </p>
            </Card>

            <Card className="text-center p-6 hover:border-amber-500/30 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <History className="h-6 w-6 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Build History</h3>
              <p className="text-sm text-muted-foreground">
                Keep old accounts open to maintain a longer average account age.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
