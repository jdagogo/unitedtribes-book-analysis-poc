import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, User, MapPin, Music } from "lucide-react";

interface SimpleResultsProps {
  podcastId: string;
}

export function SimpleResults({ podcastId }: SimpleResultsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/podcast", podcastId],
    enabled: !!podcastId,
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'musician': return <User className="h-4 w-4" />;
      case 'place': 
      case 'city': 
      case 'prison': return <MapPin className="h-4 w-4" />;
      case 'song':
      case 'music festival': 
      case 'music genre': return <Music className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Failed to load analysis</p>
          <p className="text-sm text-gray-500 mt-2">Error: {error?.message || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const entityAnalysis = data.entityAnalysis || [];
  const allMentions = entityAnalysis.flatMap(ea => ea.mentions || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {data.podcast?.title || 'Analysis Results'}
          </CardTitle>
          <p className="text-muted-foreground">{data.podcast?.showName}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{entityAnalysis.length}</div>
              <div className="text-sm text-muted-foreground">Entities</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{allMentions.length}</div>
              <div className="text-sm text-muted-foreground">Mentions</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {entityAnalysis.filter(ea => ea.entity?.importance >= 70).length}
              </div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(entityAnalysis.map(ea => ea.entity?.category)).size}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity List */}
      <Card>
        <CardHeader>
          <CardTitle>Contextual Navigation Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entityAnalysis.map((entityData) => {
              const entity = entityData.entity;
              const mentions = entityData.mentions || [];
              
              return (
                <div key={entity?.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(entity?.category || '')}
                      <div>
                        <h3 className="font-semibold text-lg">{entity?.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{entity?.category}</Badge>
                          <Badge variant="outline">{entity?.type}</Badge>
                          {entity?.importance && (
                            <Badge className={
                              entity.importance >= 80 ? 'bg-red-100 text-red-800' :
                              entity.importance >= 60 ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {entity.importance}% importance
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{mentions.length}</div>
                      <div className="text-sm text-muted-foreground">mentions</div>
                    </div>
                  </div>

                  {entity?.description && (
                    <p className="text-sm text-muted-foreground mb-3">{entity.description}</p>
                  )}

                  {/* Mentions Timeline */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Mentions:</h4>
                    {mentions.map((mention, index) => (
                      <div key={mention.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">@{formatTime(mention.timestamp || 0)}</span>
                            {mention.confidence && (
                              <Badge variant="secondary" className="text-xs">
                                {mention.confidence}%
                              </Badge>
                            )}
                            {mention.sentiment && (
                              <Badge className={`text-xs ${
                                mention.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                mention.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {mention.sentiment}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{mention.context}</p>
                        </div>
                        <Button size="sm" variant="outline" className="ml-2">
                          <Play className="h-3 w-3 mr-1" />
                          Jump
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}