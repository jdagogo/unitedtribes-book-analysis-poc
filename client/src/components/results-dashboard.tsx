import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Clock, FileText, Download, TrendingUp, Network, Play } from "lucide-react";
import { EntityAnalysis } from "./entity-analysis.tsx";
import { TimelineView } from "./timeline-view.tsx";
import { ExportModal } from "./export-modal.tsx";
import { RelationshipNetwork } from "./relationship-network.tsx";
import { SentimentAnalysis } from "./sentiment-analysis.tsx";
import { PodcastPlayer } from "./podcast-player.tsx";
import { EntityDeepDive } from "./entity-deep-dive.tsx";
import { EntityQuickView } from "./entity-quick-view.tsx";
import { EntityDetailModal } from "./entity-detail-modal.tsx";
import { TimelineContextModal } from "./timeline-context-modal-white.tsx";
import { EntitySearch } from "./entity-search.tsx";
import { SmartEntityText } from "./smart-entity-text.tsx";

import type { PodcastAnalysis, Entity, EntityMention } from "@shared/schema";

interface ResultsDashboardProps {
  podcastId?: string;
  analysis?: any; // Allow passing analysis directly
  initialTimestamp?: number;
}

export function ResultsDashboard({ podcastId, analysis: providedAnalysis, initialTimestamp }: ResultsDashboardProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTimelineContext, setShowTimelineContext] = useState(false);

  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(0);
  const [selectedEntity, setSelectedEntity] = useState<{ entity: Entity; mentions: EntityMention[] } | null>(null);
  const [activeTab, setActiveTab] = useState("player");
  const [entityFilter, setEntityFilter] = useState<string | null>(null);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [modalEntityType, setModalEntityType] = useState<string>("");
  const [showEntityDetail, setShowEntityDetail] = useState(false);
  const [selectedEntityDetail, setSelectedEntityDetail] = useState<{ entity: any; mentions: any[] } | null>(null);





  const { data: fetchedAnalysis, isLoading, error } = useQuery<PodcastAnalysis>({
    queryKey: ["/api/podcast", podcastId],
    enabled: !!podcastId && !providedAnalysis,
  });

  const analysis = providedAnalysis || fetchedAnalysis;

  // Set up global entity click handler for expanded entities
  useEffect(() => {
    (window as any).openEntityDetail = (entity: any) => {
      setSelectedEntityDetail(entity);
      setShowEntityDetail(true);
    };
    
    return () => {
      delete (window as any).openEntityDetail;
    };
  }, []);

  // Debug logging
  if (analysis?.entityAnalysis) {
    console.log(`🎯 ANALYSIS LOADED: ${analysis.entityAnalysis.length} entities extracted`);
    console.log(`📊 Entity breakdown:`, analysis.entityAnalysis.map((ea: any) => ({ 
      name: ea.entity.name, 
      category: ea.entity.category, 
      mentions: ea.mentions.length 
    })));
  }

  if (isLoading && !providedAnalysis) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analysis && !isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Failed to load analysis results.</p>
          <p className="text-sm text-gray-500 mt-2">
            Podcast ID: {podcastId}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Loading: {isLoading ? 'Yes' : 'No'} | Error: {error ? 'Yes' : 'No'}
          </p>
          {error && (
            <p className="text-sm text-red-500 mt-1">
              Error: {error instanceof Error ? error.message : String(error)}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Still loading
  if (isLoading || !analysis) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle entity click - opens EntityDetailModal  
  const handleEntityClick = (entityOrData: any, mention?: EntityMention) => {
    console.log('🔗 ResultsDashboard handleEntityClick called with:', entityOrData, mention);
    console.log('🔗 Current analysis:', !!analysis);
    
    if (mention) {
      // Called from transcript with Entity and mention
      const entityMentions = analysis.entityAnalysis?.find((ea: any) => ea.entity.id === entityOrData.id)?.mentions || [];
      setSelectedEntityDetail({ entity: entityOrData, mentions: entityMentions });
    } else {
      // Called from EntityDetailModal with entity data object
      setSelectedEntityDetail(entityOrData);
    }
    setShowEntityDetail(true);
  };

  // Create a stable function reference using useCallback
  const stableEntityClickHandler = useCallback((entityOrData: any, mention?: EntityMention) => {
    console.log('🔗 stableEntityClickHandler called with:', entityOrData, mention);
    
    if (mention) {
      // Called from transcript with Entity and mention
      const entityMentions = analysis.entityAnalysis?.find((ea: any) => ea.entity.id === entityOrData.id)?.mentions || [];
      setSelectedEntityDetail({ entity: entityOrData, mentions: entityMentions });
    } else {
      // Called from EntityDetailModal with entity data object
      setSelectedEntityDetail(entityOrData);
    }
    setShowEntityDetail(true);
  }, [analysis]);

  // Listen for custom entity modal requests from child components
  useEffect(() => {
    const handleEntityModalRequest = (event: CustomEvent) => {
      console.log('🔗 Custom entity modal request received for:', event.detail?.entity?.name);
      console.log('🔗 Full event detail:', event.detail);
      // Use the stable handler to properly route the entity
      stableEntityClickHandler(event.detail);
    };

    console.log('🔗 Setting up event listener for entityModalRequest');
    window.addEventListener('entityModalRequest', handleEntityModalRequest as EventListener);
    
    // Test that the listener is actually working
    setTimeout(() => {
      console.log('🔗 Testing event listener...');
      window.dispatchEvent(new CustomEvent('entityModalRequest', { 
        detail: { test: 'listener test' }
      }));
    }, 1000);
    
    return () => {
      console.log('🔗 Removing event listener for entityModalRequest');
      window.removeEventListener('entityModalRequest', handleEntityModalRequest as EventListener);
    };
  }, [stableEntityClickHandler]);

  console.log('🔗 ResultsDashboard rendering - stableEntityClickHandler defined:', typeof stableEntityClickHandler);

  const handleJumpToMention = (timestamp: number) => {
    // This will be handled by the podcast player
    console.log('Jump to timestamp:', timestamp);
  };

  // Function to render transcript with clickable entity mentions
  const renderInteractiveTranscript = (text: string) => {
    if (!text || !analysis.entityAnalysis) return text;

    // Just return the text with entity names replaced by clickable buttons
    let processedText = text;
    
    // Create entity replacement map
    const entityReplacements: Array<{name: string, id: string, replacement: string}> = [];
    
    analysis.entityAnalysis.forEach((entityData: any) => {
      const entity = entityData.entity;
      const entityId = entity.id;
      
      // Add main entity name
      entityReplacements.push({
        name: entity.name,
        id: entityId,
        replacement: `<ENTITY_${entityId}_${entity.name}_ENTITY>`
      });
      
      // Add aliases
      entity.aliases?.forEach((alias: string) => {
        entityReplacements.push({
          name: alias,
          id: entityId,
          replacement: `<ENTITY_${entityId}_${alias}_ENTITY>`
        });
      });
    });

    // Sort by length (longest first) to avoid partial matches
    entityReplacements.sort((a, b) => b.name.length - a.name.length);

    // Replace entity names with placeholders
    entityReplacements.forEach(({name, replacement}) => {
      const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      processedText = processedText.replace(regex, replacement);
    });

    // Split into parts and render
    const parts = processedText.split(/(<ENTITY_[^>]+>)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('<ENTITY_') && part.endsWith('_ENTITY>')) {
        // Extract entity info from placeholder
        const match = part.match(/<ENTITY_([^_]+)_(.+)_ENTITY>/);
        if (match) {
          const [, entityId, entityName] = match;
          const entityData = analysis.entityAnalysis.find((e: any) => e.entity.id === entityId);
          
          if (entityData) {
            return (
              <button
                key={`entity-${index}-${entityId}`}
                onClick={() => handleEntityClick(entityData.entity, entityData.mentions[0])}
                className="font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-1 py-0.5 rounded transition-colors cursor-pointer underline decoration-blue-300"
                title={`Click to explore ${entityData.entity.name}`}
              >
                {entityName}
              </button>
            );
          }
        }
      }
      
      return part;
    });
  };

  // If showing entity deep dive, render that instead
  if (selectedEntity) {
    return (
      <EntityDeepDive
        entity={selectedEntity.entity}
        mentions={selectedEntity.mentions}
        onJumpToMention={handleJumpToMention}
        onBack={() => setSelectedEntity(null)}
        analysis={analysis}
        onEntityClick={(entityData) => {
          setSelectedEntityDetail({ entity: entityData.entity, mentions: entityData.mentions || [] });
          setShowEntityDetail(true);
        }}
      />
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="space-y-8">
      {/* Podcast Overview */}
      <Card className="shadow-sm border overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="w-24 h-24 bg-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center">
              {analysis.podcast.artworkUrl ? (
                <img 
                  src={analysis.podcast.artworkUrl} 
                  alt={analysis.podcast.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-col" style={{display: analysis.podcast.artworkUrl ? 'none' : 'flex'}}>
                <div className="text-lg font-black">FRESH</div>
                <div className="text-lg font-black -mt-1">AIR</div>
                <div className="text-xs font-medium mt-1">NPR</div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{analysis.podcast.title}</h2>
              <p className="text-gray-600">{analysis.podcast.showName}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {analysis.podcast.duration && (
                  <span>{formatDuration(analysis.podcast.duration)}</span>
                )}
                {analysis.podcast.publishedDate && (
                  <span>{new Date(analysis.podcast.publishedDate).toLocaleDateString()}</span>
                )}
                <Badge className="bg-green-100 text-green-800">Analysis Complete</Badge>
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded" 
                 onClick={() => {
                   setModalEntityType('all');
                   setShowEntityModal(true);
                 }}
                 data-testid="button-entities-found">
              <div className="text-2xl font-bold text-primary">{analysis.entityAnalysis?.length || 0}</div>
              <div className="text-sm text-gray-600">Entities Found</div>
            </div>
            <div className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded" 
                 onClick={() => {
                   setModalEntityType('people');
                   setShowEntityModal(true);
                 }}
                 data-testid="button-people-mentioned">
              <div className="text-2xl font-bold text-primary">
                {analysis.entityAnalysis?.filter((ea: any) => ea.entity.category === 'musician' || ea.entity.category === 'person' || ea.entity.category === 'journalist').length || 0}
              </div>
              <div className="text-sm text-gray-600">People Mentioned</div>
            </div>
            <div className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded" 
                 onClick={() => {
                   setModalEntityType('music');
                   setShowEntityModal(true);
                 }}
                 data-testid="button-music-mentioned">
              <div className="text-2xl font-bold text-primary">
                {analysis.entityAnalysis?.filter((ea: any) => ea.entity.category === 'music' || ea.entity.category === 'music festival').length || 0}
              </div>
              <div className="text-sm text-gray-600">Music Mentioned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analysis.transcription?.accuracy || 95}%</div>
              <div className="text-sm text-gray-600">Transcription Accuracy</div>
            </div>
            <div className="text-center">
              <Badge className={`text-lg px-3 py-1 ${
                analysis.insights?.overallSentiment === 'positive' ? 'bg-green-100 text-green-800' :
                analysis.insights?.overallSentiment === 'negative' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {analysis.insights?.overallSentiment || 'reflective'}
              </Badge>
              <div className="text-sm text-gray-600">Overall Sentiment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {analysis.entityAnalysis?.reduce((acc: number, ea: any) => acc + ea.mentions.length, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Total Mentions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Search - Compact and Centered */}
      <div className="mb-6">
        <div className="flex justify-center">
          <div className="relative w-full max-w-lg">
            <EntitySearch
              entities={analysis.entityAnalysis?.map((ea: any) => ea.entity) || []}
              onEntitySelect={(entity) => {
                const entityData = analysis.entityAnalysis?.find((ea: any) => ea.entity.id === entity.id);
                if (entityData) {
                  setSelectedEntityDetail({ entity: entityData.entity, mentions: entityData.mentions });
                  setShowEntityDetail(true);
                }
              }}
              placeholder="Search entities (Willie Nelson, Farm Aid, Bakersfield Sound...)"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Card className="shadow-sm border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="grid w-full grid-cols-7 h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="player" 
                className="py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none text-sm"
              >
                <Play className="mr-2 h-4 w-4" />
                Player
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className="py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none text-sm"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Entities
              </TabsTrigger>
              <TabsTrigger 
                value="sentiment"
                className="py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none text-sm"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Sentiment
              </TabsTrigger>
              <TabsTrigger 
                value="network"
                className="py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none text-sm"
              >
                <Network className="mr-2 h-4 w-4" />
                Network
              </TabsTrigger>
              <TabsTrigger 
                value="timeline"
                className="py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none text-sm"
              >
                <Clock className="mr-2 h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger 
                value="transcript"
                className="py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none text-sm"
              >
                <FileText className="mr-2 h-4 w-4" />
                Transcript
              </TabsTrigger>
              <TabsTrigger 
                value="export"
                className="py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none text-sm"
                onClick={() => setShowExportModal(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="player" className="p-6">
            <PodcastPlayer
              audioUrl={analysis.podcast.audioUrl}
              duration={analysis.podcast.duration || 3600} // Default to 1 hour if no duration
              entityMentions={analysis.entityAnalysis?.flatMap((ea: any) => ea.mentions) || []}
              entities={analysis.entityAnalysis?.map((ea: any) => ea.entity) || []}
              transcript={analysis.transcription?.fullText || ""}
              onEntityClick={handleEntityClick}
              onCategoryClick={(category) => {
                setModalEntityType(category);
                setShowEntityModal(true);
              }}
              initialTimestamp={initialTimestamp}
            />
          </TabsContent>

          <TabsContent value="analysis" className="p-6">
            <EntityAnalysis 
              analysis={analysis} 
              initialFilter={entityFilter}
              onEntityClick={(entity) => {
                setSelectedEntityDetail(entity);
                setShowEntityDetail(true);
              }}
              onCategoryClick={(category) => {
                setModalEntityType(category);
                setShowEntityModal(true);
              }}
            />
          </TabsContent>

          <TabsContent value="sentiment" className="p-6">
            <SentimentAnalysis analysis={analysis} />
          </TabsContent>

          <TabsContent value="network" className="p-6">
            <RelationshipNetwork analysis={analysis} />
          </TabsContent>

          <TabsContent value="timeline" className="p-6">
            <TimelineView 
              analysis={analysis}
              onEntityClick={(entity) => {
                setSelectedEntityDetail(entity);
                setShowEntityDetail(true);
              }}
              onCategoryClick={(category) => {
                setModalEntityType(category);
                setShowEntityModal(true);
              }}
              onTimelineClick={(timestamp) => {
                setSelectedTimestamp(timestamp);
                setShowTimelineContext(true);
              }}
            />
          </TabsContent>

          <TabsContent value="transcript" className="p-6">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Transcript</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-black leading-relaxed whitespace-pre-wrap">
                  {renderInteractiveTranscript(analysis.transcription?.fullText || "Transcript not available")}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        analysis={analysis}
      />

      <EntityQuickView
        analysis={analysis}
        entityType={modalEntityType}
        isOpen={showEntityModal}
        onClose={() => setShowEntityModal(false)}
        onViewAll={() => {
          setShowEntityModal(false);
          setEntityFilter(modalEntityType === 'all' ? null : modalEntityType);
          setActiveTab('analysis');
        }}
        onEntityClick={(entity) => {
          setSelectedEntityDetail(entity);
          setShowEntityDetail(true);
        }}
        onCategoryClick={(category) => {
          setModalEntityType(category);
        }}
      />

      <EntityDetailModal
        entity={selectedEntityDetail?.entity}
        mentions={selectedEntityDetail?.mentions || []}
        isOpen={showEntityDetail}
        onClose={() => {
          setShowEntityDetail(false);
          setSelectedEntityDetail(null);
        }}
        onBack={showEntityModal ? () => {
          setShowEntityDetail(false);
          setSelectedEntityDetail(null);
          setShowEntityModal(true);
        } : undefined}
        onCategoryClick={(category) => {
          setShowEntityDetail(false);
          setSelectedEntityDetail(null);
          setModalEntityType(category);
          setShowEntityModal(true);
        }}
        onEntityClick={stableEntityClickHandler}
        onTimestampClick={(timestamp) => {
          if (typeof timestamp === 'number') {
            window.location.href = `/results?t=${timestamp}`;
          }
        }}
        analysis={analysis}
      />

      <TimelineContextModal
        analysis={analysis}
        timestamp={selectedTimestamp}
        isOpen={showTimelineContext}
        onClose={() => setShowTimelineContext(false)}
        onEntityClick={(entity) => {
          setShowTimelineContext(false);
          setSelectedEntityDetail(entity);
          setShowEntityDetail(true);
        }}
      />
    </div>
  );
}
