import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Clock, TrendingUp, Network, ArrowLeft, Play } from "lucide-react";
import type { Entity, EntityMention } from "@shared/schema";
import { SmartEntityText } from "./smart-entity-text.tsx";

interface EntityDeepDiveProps {
  entity: Entity;
  mentions: EntityMention[];
  onJumpToMention: (timestamp: number) => void;
  onBack: () => void;
  analysis?: any;
  onEntityClick?: (entity: any) => void;
}

export function EntityDeepDive({ entity, mentions, onJumpToMention, onBack, analysis, onEntityClick }: EntityDeepDiveProps) {
  const [selectedMention, setSelectedMention] = useState<EntityMention | null>(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Sort mentions by timestamp
  const sortedMentions = [...mentions].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Player
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{entity.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{entity.category}</Badge>
            <Badge variant="outline">{entity.type}</Badge>
            {entity.sentiment && (
              <Badge className={getSentimentColor(entity.sentiment)}>
                {entity.sentiment}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Entity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Entity Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {entity.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">
                <SmartEntityText 
                  text={entity.description}
                  analysis={analysis}
                  onEntityClick={onEntityClick}
                />
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{mentions.length}</div>
              <div className="text-sm text-muted-foreground">Total Mentions</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{entity.importance}%</div>
              <div className="text-sm text-muted-foreground">Importance</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(mentions.reduce((acc, m) => acc + (m.confidence || 0), 0) / mentions.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(mentions.map(m => m.sentiment)).size}
              </div>
              <div className="text-sm text-muted-foreground">Sentiment Variations</div>
            </div>
          </div>

          {entity.aliases && Array.isArray(entity.aliases) && entity.aliases.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Also Known As</h4>
              <div className="flex flex-wrap gap-1">
                {entity.aliases.map((alias: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {alias}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mention Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Mention Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedMentions.map((mention, index) => (
              <div
                key={mention.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMention?.id === mention.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedMention(selectedMention?.id === mention.id ? null : mention)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{formatTime(mention.timestamp)}</span>
                      {mention.confidence && (
                        <span className={`text-sm ${getConfidenceColor(mention.confidence)}`}>
                          {mention.confidence}% confidence
                        </span>
                      )}
                      {mention.sentiment && (
                        <Badge className={getSentimentColor(mention.sentiment)}>
                          {mention.sentiment}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mention.context}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onJumpToMention(mention.timestamp);
                    }}
                    className="ml-4"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Play
                  </Button>
                </div>

                {/* Expanded Details */}
                {selectedMention?.id === mention.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {mention.emotions && Array.isArray(mention.emotions) && mention.emotions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Detected Emotions</h5>
                        <div className="flex flex-wrap gap-1">
                          {mention.emotions.map((emotion: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {mention.relationshipType && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">Relationship Type</h5>
                        <Badge variant="outline">{mention.relationshipType}</Badge>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      This mention provides contextual navigation opportunities to related media, 
                      artists, places, and cultural concepts.
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Media Navigation Suggestions */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Cross-Media Discovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Suggested Navigation</h4>
              <p className="text-sm text-muted-foreground">
                Explore related {entity.category} content, discover similar artists, 
                or dive into the cultural context around "{entity.name}".
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" size="sm" className="justify-start">
                <TrendingUp className="h-3 w-3 mr-2" />
                Similar {entity.category}s
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Network className="h-3 w-3 mr-2" />
                Related Content
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <ExternalLink className="h-3 w-3 mr-2" />
                Cultural Context
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}