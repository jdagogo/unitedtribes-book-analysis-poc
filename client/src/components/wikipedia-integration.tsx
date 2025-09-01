import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, BookOpen, Globe, Network, Brain } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import KnowledgeExpansion from './knowledge-expansion';

interface WikipediaContext {
  summary: string;
  url: string;
  relatedEntities: string[];
}

interface WikipediaIntegrationProps {
  entityName: string;
  entityCategory: string;
  isOpen: boolean;
  onClose: () => void;
  onEntityClick?: (entityName: string) => void;
  existingEntities?: any[];
  onKnowledgeExpanded?: (newEntities: any[], relationships: any[]) => void;
}

export function WikipediaIntegration({ 
  entityName, 
  entityCategory, 
  isOpen, 
  onClose,
  onEntityClick,
  existingEntities = [],
  onKnowledgeExpanded
}: WikipediaIntegrationProps) {
  const [wikipediaData, setWikipediaData] = useState<WikipediaContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKnowledgeExpansion, setShowKnowledgeExpansion] = useState(false);

  const fetchWikipediaData = async () => {
    if (!entityName || !isOpen) return;

    setIsLoading(true);
    setError(null);

    try {
      // Direct Wikipedia API call for demo purposes
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(entityName)}&srlimit=1&origin=*`
      );
      
      if (!searchResponse.ok) {
        throw new Error('Failed to search Wikipedia');
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.query?.search?.length) {
        setError('No Wikipedia page found');
        return;
      }

      const pageTitle = searchData.query.search[0].title;
      
      // Get page summary
      const summaryResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
      );
      
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch Wikipedia summary');
      }

      const summaryData = await summaryResponse.json();
      
      // Get page links for related entities
      const linksResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=links&titles=${encodeURIComponent(pageTitle)}&pllimit=20&origin=*`
      );
      
      const linksData = await linksResponse.json();
      const pageId = Object.keys(linksData.query?.pages || {})[0];
      const links = linksData.query?.pages?.[pageId]?.links?.map((link: any) => link.title) || [];

      setWikipediaData({
        summary: summaryData.extract || 'No summary available.',
        url: summaryData.content_urls?.desktop?.page || '',
        relatedEntities: links.slice(0, 10) // Top 10 related entities
      });

    } catch (err) {
      console.error('Wikipedia fetch error:', err);
      setError('Failed to fetch Wikipedia data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWikipediaData();
    }
  }, [entityName, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Wikipedia Context: {entityName}
              </h2>
            </div>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Fetching Wikipedia data...</span>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {wikipediaData && !isLoading && (
            <div className="space-y-6">
              {/* Wikipedia Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Wikipedia Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {wikipediaData.summary}
                  </p>
                  {wikipediaData.url && (
                    <a
                      href={wikipediaData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View full Wikipedia page
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Related Entities */}
              {wikipediaData.relatedEntities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5 text-purple-600" />
                      Related Entities from Wikipedia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {wikipediaData.relatedEntities.map((entity, index) => {
                        // Check if entity exists in our current dataset
                        const entityExists = existingEntities.some((existing: any) => {
                          const existingEntity = existing.entity || existing;
                          return existingEntity.name?.toLowerCase() === entity.toLowerCase() ||
                                 existingEntity.aliases?.some((alias: string) => 
                                   alias.toLowerCase() === entity.toLowerCase()
                                 );
                        });
                        
                        return (
                          <Badge
                            key={index}
                            variant="secondary"
                            className={`text-sm py-2 px-3 cursor-pointer transition-colors flex items-center gap-1 ${
                              entityExists 
                                ? 'hover:bg-green-100 hover:text-green-800 bg-green-50 text-green-700 border-green-200' 
                                : 'hover:bg-blue-100 hover:text-blue-800 bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                            onClick={() => {
                              console.log('Navigate to:', entity);
                              if (onEntityClick) {
                                onEntityClick(entity);
                              }
                            }}
                          >
                            {entityExists ? '✓' : '+'} {entity}
                          </Badge>
                        );
                      })}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-3">
                        These entities are linked from {entityName}'s Wikipedia page, showing potential connections in your knowledge base.
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
                            ✓ In Analysis
                          </span>
                          <span>Found in current dataset</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            + Expand Knowledge
                          </span>
                          <span>Could be added to knowledge base</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Knowledge Expansion Action */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        AI Knowledge Expansion
                      </h3>
                      <p className="text-sm text-gray-600">
                        Automatically analyze and add {wikipediaData.relatedEntities.filter(entity => 
                          !existingEntities.some((existing: any) => {
                            const existingEntity = existing.entity || existing;
                            return existingEntity.name?.toLowerCase() === entity.toLowerCase();
                          })
                        ).length} new entities to your knowledge base
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowKnowledgeExpansion(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={wikipediaData.relatedEntities.filter(entity => 
                        !existingEntities.some((existing: any) => {
                          const existingEntity = existing.entity || existing;
                          return existingEntity.name?.toLowerCase() === entity.toLowerCase();
                        })
                      ).length === 0}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Expand Knowledge
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Entity Category:</span>
                      <p className="text-gray-600">{entityCategory}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Related Links:</span>
                      <p className="text-gray-600">{wikipediaData.relatedEntities.length} found</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Expansion Potential:</span>
                      <p className="text-purple-600 font-medium">
                        {wikipediaData.relatedEntities.filter(entity => 
                          !existingEntities.some((existing: any) => {
                            const existingEntity = existing.entity || existing;
                            return existingEntity.name?.toLowerCase() === entity.toLowerCase();
                          })
                        ).length} new entities
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Knowledge Expansion Modal */}
      {showKnowledgeExpansion && wikipediaData && (
        <KnowledgeExpansion
          sourceEntity={entityName}
          relatedEntities={wikipediaData.relatedEntities}
          existingEntities={existingEntities}
          onEntitiesExpanded={(newEntities) => {
            if (onKnowledgeExpanded) {
              onKnowledgeExpanded(newEntities, []);
            }
          }}
          onRelationshipsCreated={(relationships) => {
            if (onKnowledgeExpanded) {
              onKnowledgeExpanded([], relationships);
            }
          }}
          isOpen={showKnowledgeExpansion}
          onClose={() => setShowKnowledgeExpansion(false)}
          onEntityClick={onEntityClick}
        />
      )}
    </div>
  );
}

export default WikipediaIntegration;