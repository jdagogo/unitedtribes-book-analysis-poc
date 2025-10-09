import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import type { PodcastAnalysis } from "@shared/schema";

interface EntityAnalysisProps {
  analysis: PodcastAnalysis;
  initialFilter?: string | null;
  onEntityClick?: (entity: { entity: any; mentions: any[] }) => void;
  onCategoryClick?: (category: string) => void;
}

export function EntityAnalysis({ analysis, initialFilter, onEntityClick, onCategoryClick }: EntityAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (initialFilter === 'people') return 'musician';
    if (initialFilter === 'music') return 'music';
    return "all";
  });

  // Group entities by category
  const entityCategories = (analysis.entityAnalysis || []).reduce((acc, entityAnalysis) => {
    const category = entityAnalysis.entity.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter entities based on selected category
  const filteredEntities = (analysis.entityAnalysis || []).filter(ea => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "people") {
      return ea.entity.category === 'musician' || ea.entity.category === 'person' || ea.entity.category === 'journalist';
    }
    if (selectedCategory === "music") {
      return ea.entity.category === 'music' || ea.entity.category === 'music festival';
    }
    return ea.entity.category === selectedCategory;
  });

  // Sort by mention count
  const sortedEntities = filteredEntities.sort((a, b) => b.mentionCount - a.mentionCount);

  const getCategoryColor = (category: string) => {
    const colors = {
      person: "bg-blue-500",
      musician: "bg-blue-500",
      journalist: "bg-blue-500",
      place: "bg-green-500",
      location: "bg-green-500",
      music: "bg-purple-500",
      "music festival": "bg-purple-500",
      entertainment: "bg-purple-500",
      technology: "bg-red-500",
      historical: "bg-yellow-500",
      organization: "bg-indigo-500",
      transportation: "bg-orange-500",
    };
    return colors[category as keyof typeof colors] || "bg-teal-500";
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      person: "bg-blue-100 text-blue-800",
      musician: "bg-blue-100 text-blue-800",
      journalist: "bg-blue-100 text-blue-800",
      place: "bg-green-100 text-green-800",
      location: "bg-green-100 text-green-800",
      music: "bg-purple-100 text-purple-800",
      "music festival": "bg-purple-100 text-purple-800",
      entertainment: "bg-purple-100 text-purple-800",
      technology: "bg-red-100 text-red-800",
      historical: "bg-yellow-100 text-yellow-800",
      organization: "bg-indigo-100 text-indigo-800",
      transportation: "bg-orange-100 text-orange-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const maxMentions = Math.max(...sortedEntities.map(ea => ea.mentionCount));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="entities-section">
      {/* Entity Categories */}
      <div className="lg:col-span-1">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Entity Categories</h3>
        <div className="space-y-3">
          <div
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedCategory === "all" ? "bg-primary bg-opacity-10 border-primary" : "hover:bg-gray-50"
            }`}
            onClick={() => {
              setSelectedCategory("all");
              onCategoryClick?.("all");
            }}
            data-testid="category-all"
          >
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
              <span className="font-medium text-lg">All Categories</span>
            </div>
            <span className="text-base text-gray-600 hover:text-blue-600 font-medium">{analysis.entityAnalysis.length}</span>
          </div>

          {/* Special filter categories */}
          <div
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedCategory === "people" ? "bg-primary bg-opacity-10 border-primary" : "hover:bg-gray-50"
            }`}
            onClick={() => {
              setSelectedCategory("people");
              onCategoryClick?.("people");
            }}
            data-testid="category-people"
          >
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-lg">People</span>
            </div>
            <span className="text-base text-gray-600 hover:text-blue-600 font-medium">
              {analysis.entityAnalysis.filter(ea => ea.entity.category === 'musician' || ea.entity.category === 'person' || ea.entity.category === 'journalist').length}
            </span>
          </div>

          <div
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedCategory === "music" ? "bg-primary bg-opacity-10 border-primary" : "hover:bg-gray-50"
            }`}
            onClick={() => {
              setSelectedCategory("music");
              onCategoryClick?.("music");
            }}
            data-testid="category-music"
          >
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="font-medium text-lg">Music</span>
            </div>
            <span className="text-base text-gray-600 hover:text-blue-600 font-medium">
              {analysis.entityAnalysis.filter(ea => ea.entity.category === 'music' || ea.entity.category === 'music festival').length}
            </span>
          </div>
          
          {Object.entries(entityCategories)
            .filter(([category]) => category !== 'music' && category !== 'music festival' && category !== 'musician' && category !== 'person' && category !== 'journalist')
            .map(([category, count]) => (
            <div
              key={category}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedCategory === category ? "bg-primary bg-opacity-10 border-primary" : "hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedCategory(category);
                onCategoryClick?.(category);
              }}
              data-testid={`category-${category}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getCategoryColor(category)}`}></div>
                <span className="font-medium capitalize text-lg">{category}</span>
              </div>
              <span className="text-base text-gray-600 hover:text-blue-600 font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Entities */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-900">Top Entities by Mentions</h3>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(entityCategories).map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          {sortedEntities.slice(0, 10).map((entityAnalysis) => (
            <Card 
              key={entityAnalysis.entity.id} 
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onEntityClick?.({
                entity: entityAnalysis.entity,
                mentions: entityAnalysis.mentions || []
              })}
              data-testid={`entity-card-${entityAnalysis.entity.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-900 text-xl">{entityAnalysis.entity.name}</span>
                      <Badge className={`${getCategoryBadgeColor(entityAnalysis.entity.category)} text-base px-3 py-1`}>
                        {entityAnalysis.entity.category}
                      </Badge>
                    </div>
                    <div className="text-base text-gray-600 mb-3">
                      {entityAnalysis.entity.description || `${entityAnalysis.entity.type} entity`}
                    </div>
                    <Progress
                      value={(entityAnalysis.mentionCount / maxMentions) * 100}
                      className="h-3"
                    />
                  </div>
                  <div
                    className="text-right ml-4 hover:bg-blue-50 rounded p-3 transition-colors"
                    data-testid={`mention-count-${entityAnalysis.entity.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="text-2xl font-semibold text-primary hover:text-blue-700">{entityAnalysis.mentionCount}</div>
                    <div className="text-base text-gray-500">mentions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {sortedEntities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No entities found for the selected category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
