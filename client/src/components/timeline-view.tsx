import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Maximize2 } from "lucide-react";
import type { PodcastAnalysis, EntityMention } from "@shared/schema";

interface TimelineViewProps {
  analysis: PodcastAnalysis;
  onEntityClick?: (entity: { entity: any; mentions: any[] }) => void;
  onCategoryClick?: (category: string) => void;
  onTimelineClick?: (timestamp: number) => void;
}

export function TimelineView({ analysis, onEntityClick, onCategoryClick, onTimelineClick }: TimelineViewProps) {
  const [selectedEntity, setSelectedEntity] = useState("all");
  


  // Get all mentions sorted by timestamp
  const allMentions = (analysis.entityAnalysis || []).flatMap(ea => 
    ea.mentions.map(mention => ({
      ...mention,
      entity: ea.entity,
    }))
  ).sort((a, b) => a.timestamp - b.timestamp);

  // Filter mentions based on selected entity
  const filteredMentions = selectedEntity === "all" 
    ? allMentions 
    : allMentions.filter(mention => mention.entity.id === selectedEntity);

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      person: "bg-blue-500",
      place: "bg-green-500",
      entertainment: "bg-purple-500",
      technology: "bg-red-500",
      historical: "bg-yellow-500",
      organization: "bg-indigo-500",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500";
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      person: "bg-blue-100 text-blue-800",
      place: "bg-green-100 text-green-800",
      entertainment: "bg-purple-100 text-purple-800",
      technology: "bg-red-100 text-red-800",
      historical: "bg-yellow-100 text-yellow-800",
      organization: "bg-indigo-100 text-indigo-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Calculate statistics
  const totalMentions = allMentions.length;
  const uniqueEntities = analysis.entityAnalysis?.length || 0;
  const highImportanceEntities = analysis.entityAnalysis?.filter(ea => ea.importance >= 80).length || 0;
  
  // Count categories
  const categoryGroups = analysis.entityAnalysis?.reduce((acc, ea) => {
    const category = ea.entity.category;
    if (!acc[category]) acc[category] = 0;
    acc[category]++;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalCategories = Object.keys(categoryGroups).length;

  // Create timeline visualization data
  const timelineSegments = allMentions.map(mention => ({
    timestamp: mention.timestamp,
    importance: analysis.entityAnalysis?.find(ea => ea.entity.id === mention.entity.id)?.importance || 50,
    category: mention.entity.category,
    entity: mention.entity
  }));

  const getImportanceColor = (importance: number) => {
    if (importance >= 80) return "bg-red-500";
    if (importance >= 60) return "bg-orange-500";
    return "bg-green-500";
  };

  const getCategoryClickableColor = (category: string) => {
    const colors = {
      "music festival": "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "location": "bg-green-100 text-green-800 hover:bg-green-200",
      "music": "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "musician": "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "transportation": "bg-orange-100 text-orange-800 hover:bg-orange-200",
      "journalist": "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "recognition": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      "incident": "bg-red-100 text-red-800 hover:bg-red-200",
      "personal": "bg-gray-100 text-gray-800 hover:bg-gray-200",
      "family": "bg-pink-100 text-pink-800 hover:bg-pink-200",
      "artistic": "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      "cultural": "bg-teal-100 text-teal-800 hover:bg-teal-200",
      "social": "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
      "regional": "bg-lime-100 text-lime-800 hover:bg-lime-200",
      "political": "bg-rose-100 text-rose-800 hover:bg-rose-200",
      "musical": "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "media": "bg-slate-100 text-slate-800 hover:bg-slate-200",
      "historical": "bg-amber-100 text-amber-800 hover:bg-amber-200",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Navigation Timeline Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Navigation Timeline ({totalMentions} contextual triggers)
        </h3>
        
        {/* Timeline Visualization */}
        <div className="relative mb-6">
          <div className="h-3 bg-gray-200 rounded-full relative overflow-hidden">
            {timelineSegments.map((segment, index) => {
              const position = (segment.timestamp / 3600) * 100; // Assuming 1 hour duration
              const width = Math.max(0.5, 2); // Minimum width for visibility
              return (
                <div
                  key={`timeline-${index}`}
                  className={`absolute top-0 h-full cursor-pointer hover:opacity-80 transition-opacity ${getImportanceColor(segment.importance)}`}
                  style={{
                    left: `${position}%`,
                    width: `${width}%`,
                  }}
                  onClick={() => onTimelineClick?.(segment.timestamp)}
                  data-testid={`timeline-segment-${segment.entity.name.toLowerCase().replace(/\s+/g, '-')}`}
                  title={`Click to view ${segment.entity.name} details (mentioned at ${formatTimestamp(segment.timestamp)})`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>0:00</span>
            <span>1:00:00</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{uniqueEntities}</div>
            <div className="text-sm text-gray-600">Unique Entities</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{totalMentions}</div>
            <div className="text-sm text-gray-600">Total Mentions</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{highImportanceEntities}</div>
            <div className="text-sm text-gray-600">High Importance</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{totalCategories}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Navigation Categories</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryGroups)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
                <div
                  key={category}
                  className="px-3 py-2 bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded cursor-pointer text-sm"
                  onClick={() => {
                    console.log("🟢 SIMPLE CLICK:", category);
                    alert(`Clicked: ${category}`);
                    if (onCategoryClick) {
                      onCategoryClick(category);
                    }
                  }}
                >
                  {category} ({count})
                </div>
              ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">High importance (80%+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-600">Medium importance (60-79%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Standard importance (&lt;60%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
