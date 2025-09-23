import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Plus, Network, Brain, Zap, CheckCircle } from 'lucide-react';

interface KnowledgeExpansionProps {
  sourceEntity: string;
  relatedEntities: string[];
  existingEntities: any[];
  onEntitiesExpanded: (newEntities: any[]) => void;
  onRelationshipsCreated: (relationships: any[]) => void;
  isOpen: boolean;
  onClose: () => void;
  onEntityClick?: (entity: any) => void;
}

interface ExpandedEntity {
  id: string;
  name: string;
  category: string;
  type: string;
  description: string;
  importance: number;
  aliases: string[];
  wikipediaUrl?: string;
  relationships: Array<{
    targetEntity: string;
    type: string;
    strength: number;
    description: string;
  }>;
}

export default function KnowledgeExpansion({
  sourceEntity,
  relatedEntities,
  existingEntities,
  onEntitiesExpanded,
  onRelationshipsCreated,
  isOpen,
  onClose,
  onEntityClick
}: KnowledgeExpansionProps) {
  const [isExpanding, setIsExpanding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [expandedEntities, setExpandedEntities] = useState<ExpandedEntity[]>([]);
  const [newRelationships, setNewRelationships] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Filter entities that don't exist in our current dataset
  const newEntities = relatedEntities.filter(entity => 
    !existingEntities.some((existing: any) => {
      const existingEntity = existing.entity || existing;
      return existingEntity.name?.toLowerCase() === entity.toLowerCase() ||
             existingEntity.aliases?.some((alias: string) => 
               alias.toLowerCase() === entity.toLowerCase()
             );
    })
  );

  const expandKnowledgeBase = async () => {
    if (newEntities.length === 0) return;
    
    setIsExpanding(true);
    setProgress(0);
    setCurrentStep('Initializing knowledge expansion...');
    
    try {
      // Use server-side API for knowledge expansion instead of client-side Anthropic calls
      // This is more secure and doesn't expose API keys to the client

      const allNewEntities: ExpandedEntity[] = [];
      const allNewRelationships: any[] = [];
      
      // Process entities in batches
      const batchSize = 3;
      for (let i = 0; i < newEntities.length; i += batchSize) {
        const batch = newEntities.slice(i, i + batchSize);
        setCurrentStep(`Expanding entities ${i + 1}-${Math.min(i + batchSize, newEntities.length)} of ${newEntities.length}...`);
        
        for (const entityName of batch) {
          setProgress(((i + batch.indexOf(entityName)) / newEntities.length) * 80);
          
          // Get Wikipedia context for each entity
          const wikipediaData = await fetchWikipediaContext(entityName);
          
          // Use server API to analyze and categorize the entity
          const entityAnalysis = await analyzeEntityWithAPI(entityName, wikipediaData, sourceEntity);
          
          if (entityAnalysis) {
            allNewEntities.push(entityAnalysis);
          }
        }
      }
      
      setProgress(85);
      setCurrentStep('Creating entity relationships...');
      
      // Analyze relationships between all entities (existing + new)
      const allEntities = [...existingEntities.map(e => e.entity || e), ...allNewEntities];
      const relationships = await analyzeEntityRelationshipsWithAPI(allEntities, sourceEntity);
      
      setProgress(95);
      setCurrentStep('Finalizing knowledge graph...');
      
      setExpandedEntities(allNewEntities);
      setNewRelationships(relationships);
      
      setProgress(100);
      setCurrentStep('Knowledge expansion complete!');
      setIsComplete(true);
      
      // Call callbacks to update parent state
      onEntitiesExpanded(allNewEntities);
      onRelationshipsCreated(relationships);
      
    } catch (error) {
      console.error('Knowledge expansion failed:', error);
      setCurrentStep('Expansion failed. Please try again.');
    } finally {
      setIsExpanding(false);
    }
  };

  const fetchWikipediaContext = async (entityName: string) => {
    try {
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(entityName)}&srlimit=1&origin=*`
      );
      
      if (!searchResponse.ok) return null;
      const searchData = await searchResponse.json();
      
      if (!searchData.query?.search?.length) return null;
      
      const pageTitle = searchData.query.search[0].title;
      const summaryResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
      );
      
      if (!summaryResponse.ok) return null;
      const summaryData = await summaryResponse.json();
      
      return {
        title: pageTitle,
        extract: summaryData.extract || '',
        url: summaryData.content_urls?.desktop?.page || ''
      };
    } catch (error) {
      console.error('Wikipedia fetch failed:', error);
      return null;
    }
  };

  const analyzeEntityWithAPI = async (entityName: string, wikipediaData: any, sourceEntity: string) => {
    try {
      const response = await fetch('/api/knowledge/analyze-entity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityName,
          wikipediaData,
          sourceEntity
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const analysis = await response.json();
      return {
        ...analysis,
        wikipediaUrl: wikipediaData?.url
      };
    } catch (error) {
      console.error('Entity analysis failed:', error);
    }
    return null;
  };

  const analyzeEntityRelationshipsWithAPI = async (allEntities: any[], sourceEntity: string) => {
    try {
      const response = await fetch('/api/knowledge/analyze-relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entities: allEntities,
          sourceEntity
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Relationship analysis failed:', error);
    }
    return [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Brain className="h-6 w-6 text-purple-600" />
                UnitedTribes Knowledge Expansion
              </h1>
              <p className="text-sm text-gray-600">
                Automatically expand your knowledge base with {newEntities.length} Wikipedia entities related to "{sourceEntity}"
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isExpanding && !isComplete && (
            <div className="space-y-6">
              {/* New Entities Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-green-600" />
                    Entities to Add ({newEntities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {newEntities.slice(0, 12).map((entity, index) => (
                      <Badge key={index} variant="outline" className="p-2 bg-blue-50 text-blue-800">
                        {entity}
                      </Badge>
                    ))}
                    {newEntities.length > 12 && (
                      <Badge variant="outline" className="p-2 bg-gray-100 text-gray-600">
                        +{newEntities.length - 12} more
                      </Badge>
                    )}
                  </div>
                  <Button 
                    onClick={expandKnowledgeBase}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={newEntities.length === 0}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Expand Knowledge Base with AI Analysis
                  </Button>
                </CardContent>
              </Card>

              {/* Process Description */}
              <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">🧠 AI-Powered Knowledge Expansion Process</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">1. Entity Analysis</h4>
                      <p className="text-gray-600">Claude analyzes each Wikipedia entity for music/cultural relevance</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">2. Categorization</h4>
                      <p className="text-gray-600">Intelligent categorization and importance scoring</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">3. Relationship Mapping</h4>
                      <p className="text-gray-600">Creates connections between all entities in knowledge graph</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Expansion Progress */}
          {isExpanding && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    Processing Knowledge Expansion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-600">{currentStep}</p>
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    Using Claude 4.0 Sonnet for intelligent entity analysis and relationship discovery
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Completion Results */}
          {isComplete && (
            <div className="space-y-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Knowledge Base Successfully Expanded!</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">New Entities Added:</span>
                      <p className="text-green-800">{expandedEntities.length}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">New Relationships:</span>
                      <p className="text-green-800">{newRelationships.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* New Entities Summary */}
              {expandedEntities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5 text-purple-600" />
                      Newly Added Entities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {expandedEntities.slice(0, 8).map((entity, index) => (
                        <button
                          key={index} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer text-left w-full"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(`🔗 Clicked expanded entity: ${entity.name}`);
                            
                            // Convert expanded entity to the format expected by EntityDetailModal
                            const formattedEntity = {
                              entity: {
                                id: entity.id,
                                name: entity.name,
                                category: entity.category,
                                type: entity.type,
                                description: entity.description,
                                importance: entity.importance,
                                aliases: entity.aliases,
                                wikipediaUrl: entity.wikipediaUrl
                              },
                              mentions: [] // Expanded entities don't have transcript mentions yet
                            };
                            
                            console.log('🔍 Formatted entity:', formattedEntity);
                            console.log('🔗 Entity click handler available:', !!onEntityClick);
                            
                            // Call the direct entity click handler
                            if (onEntityClick) {
                              console.log('📨 Calling onEntityClick directly...');
                              onEntityClick(formattedEntity);
                            } else {
                              console.error('❌ onEntityClick handler not provided');
                            }
                          }}
                        >
                          <div>
                            <h4 className="font-medium text-gray-900 hover:text-blue-700">{entity.name}</h4>
                            <p className="text-xs text-gray-600">{entity.category} • {entity.importance}% importance</p>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {entity.relationships.length} connections
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}