import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PodcastAnalysis } from "@shared/schema";

interface TimelineContextModalProps {
  analysis: PodcastAnalysis;
  timestamp: number;
  isOpen: boolean;
  onClose: () => void;
  onEntityClick?: (entity: { entity: any; mentions: any[] }) => void;
}

export function TimelineContextModal({ analysis, timestamp, isOpen, onClose, onEntityClick }: TimelineContextModalProps) {
  const [currentTime, setCurrentTime] = useState(timestamp);

  if (!isOpen) return null;

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get mentions within a 15-second window around the current time
  const timeWindow = 15;
  const allMentions = (analysis.entityAnalysis || []).flatMap(ea => 
    ea.mentions.map(mention => ({
      ...mention,
      entity: ea.entity,
      entityAnalysis: ea
    }))
  );

  const contextualMentions = allMentions.filter(mention => 
    Math.abs(mention.timestamp - currentTime) <= timeWindow
  ).sort((a, b) => a.timestamp - b.timestamp);

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
      regional: "bg-lime-100 text-lime-800",
      cultural: "bg-teal-100 text-teal-800",
      social: "bg-cyan-100 text-cyan-800",
      political: "bg-rose-100 text-rose-800",
      musical: "bg-purple-100 text-purple-800",
      media: "bg-slate-100 text-slate-800",
      family: "bg-pink-100 text-pink-800",
      artistic: "bg-indigo-100 text-indigo-800",
      personal: "bg-gray-100 text-gray-800",
      recognition: "bg-yellow-100 text-yellow-800",
      incident: "bg-red-100 text-red-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getSentimentBadgeColor = (sentiment: string) => {
    const colors = {
      positive: "bg-green-100 text-green-800",
      negative: "bg-red-100 text-red-800", 
      neutral: "bg-gray-100 text-gray-800",
      reverent: "bg-blue-100 text-blue-800",
      collaborative: "bg-teal-100 text-teal-800",
      professional: "bg-indigo-100 text-indigo-800",
      formative: "bg-purple-100 text-purple-800",
      bittersweet: "bg-orange-100 text-orange-800",
    };
    return colors[sentiment as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-modal="timeline-context-white">
      <div 
        className="rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-xl border"
        style={{ 
          backgroundColor: '#ffffff !important',
          borderColor: '#e5e7eb',
          background: 'white'
        }}
        data-testid="white-context-modal"
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ 
            backgroundColor: '#ffffff',
            borderBottomColor: '#e5e7eb'
          }}
        >
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Current Context (WHITE MODAL)
            </h2>
            <Badge variant="secondary">{contextualMentions.length} mentions</Badge>
            <Badge variant="outline" className="bg-gray-100">webview</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              ← View Full Analysis
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Context Mentions */}
        <div 
          className="p-6 overflow-y-auto max-h-[60vh]"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contextualMentions.map((mention, index) => (
              <div
                key={`context-${mention.entityId}-${mention.timestamp}-${index}`}
                className="cursor-pointer hover:bg-gray-50 rounded-lg p-4 transition-colors"
                onClick={() => onEntityClick?.({
                  entity: mention.entity,
                  mentions: mention.entityAnalysis.mentions
                })}
                data-testid={`context-mention-${mention.entity.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                        {mention.entity.name}
                      </h3>
                      <Badge className={getCategoryBadgeColor(mention.entity.category)}>
                        {mention.entity.category}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {mention.entity.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">
                        <span className="font-medium">{mention.entityAnalysis.mentions.length} mentions</span>
                      </span>
                      <Badge className={getSentimentBadgeColor(mention.sentiment || mention.entityAnalysis.sentiment)}>
                        {mention.sentiment || mention.entityAnalysis.sentiment}
                      </Badge>
                      <span className="text-gray-500">
                        <span className="font-medium">{mention.entityAnalysis.importance}% importance</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {contextualMentions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No entities mentioned within 15 seconds of {formatTimestamp(currentTime)}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}