import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Link, ArrowRight, Book, Headphones, Radio, Network, Search, Home, ChevronLeft } from 'lucide-react';
import { merleHaggardBookAnalysis } from '@/data/merle-haggard-book';
import { authenticMerleAnalysis } from '@/data/authentic-merle-analysis';
import { EntityDetailModal } from '@/components/entity-detail-modal';
import type { CrossMediaDiscovery, Entity, EntityMention } from '../../../shared/schema';

export function CrossMediaDiscoveryPage() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEntity, setModalEntity] = useState<Entity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate cross-media discovery data
  const crossMediaData: CrossMediaDiscovery = useMemo(() => {
    const sharedEntities = merleHaggardBookAnalysis.crossMediaConnections.sharedEntities;
    
    return {
      sourceMedia: {
        type: 'book',
        id: 'merle-book-house-memories',
        title: 'My House of Memories: An Autobiography'
      },
      relatedMedia: [
        {
          type: 'podcast',
          id: 'merle-authentic-demo',
          title: 'Merle Haggard On Hopping Trains And Doing Time (Fresh Air)',
          connectionStrength: 92,
          sharedEntities: sharedEntities,
          contexts: [
            'Prison experience at San Quentin',
            'Early life in Oildale',
            'Musical influences and Bakersfield Sound',
            'Creation of "Mama Tried"'
          ]
        }
      ],
      discoveryPaths: [
        {
          entity: 'San Quentin State Prison',
          path: [
            {
              mediaType: 'book',
              title: 'My House of Memories',
              context: 'Chapter 3: Behind the Walls of San Quentin - Personal memoir of prison experience'
            },
            {
              mediaType: 'podcast',
              title: 'Fresh Air Interview',
              context: 'Terry Gross discusses Haggard\'s time in prison and its impact on his music'
            }
          ]
        },
        {
          entity: 'Oildale',
          path: [
            {
              mediaType: 'book',
              title: 'My House of Memories',
              context: 'Chapter 1: Growing Up in Oildale - Childhood in converted boxcar during Depression'
            },
            {
              mediaType: 'podcast',
              title: 'Fresh Air Interview',
              context: 'Discussion of humble beginnings and working-class roots'
            }
          ]
        },
        {
          entity: 'Mama Tried',
          path: [
            {
              mediaType: 'book',
              title: 'My House of Memories',
              context: 'Chapter 5: Personal story behind writing this autobiographical song'
            },
            {
              mediaType: 'podcast',
              title: 'Fresh Air Interview',
              context: 'Performance analysis and cultural significance discussion'
            }
          ]
        }
      ]
    };
  }, []);

  // Filter entities based on search query
  const filteredEntities = useMemo(() => {
    if (!authenticMerleAnalysis.entityAnalysis) return [];
    
    return authenticMerleAnalysis.entityAnalysis
      .filter(ea => {
        const entity = ea.entity;
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
          entity.name.toLowerCase().includes(query) ||
          entity.category?.toLowerCase().includes(query) ||
          entity.description?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        // Sort by importance score (higher first)
        const scoreA = a.entity.importance || 0;
        const scoreB = b.entity.importance || 0;
        return scoreB - scoreA;
      });
  }, [searchQuery]);

  const handleEntitySelect = (entityName: string) => {
    // Find the entity in the authentic analysis data
    const entityAnalysis = authenticMerleAnalysis.entityAnalysis?.find(ea => 
      ea.entity.name === entityName || 
      ea.entity.name.toLowerCase() === entityName.toLowerCase() ||
      (entityName === "Merle Haggard" && ea.entity.id === "merle-haggard") ||
      (entityName === "San Quentin State Prison" && ea.entity.id === "san-quentin") ||
      (entityName === "Johnny Cash" && ea.entity.id === "johnny-cash") ||
      (entityName === "Bakersfield Sound" && ea.entity.id === "bakersfield-sound") ||
      (entityName === "Mama Tried" && ea.entity.id === "mama-tried") ||
      (entityName === "Okie from Muskogee" && ea.entity.id === "okie-from-muskogee") ||
      (entityName === "Buck Owens" && ea.entity.id === "buck-owens") ||
      (entityName === "Lefty Frizzell" && ea.entity.id === "lefty-frizzell") ||
      (entityName === "Farm Aid" && ea.entity.id === "farm-aid") ||
      (entityName === "Country Music Association" && ea.entity.id === "country-music-association")
    );

    if (entityAnalysis) {
      console.log('🔗 Cross-media: Opening modal for entity:', entityAnalysis.entity.name);
      setModalEntity(entityAnalysis); // Pass the full analysis object
      setIsModalOpen(true);
      setSelectedEntity(null); // Reset selection
    } else {
      console.log('🔗 Cross-media: Entity not found in analysis:', entityName);
      // Fallback: toggle selection state for visual feedback
      setSelectedEntity(selectedEntity === entityName ? null : entityName);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalEntity(null);
  };

  const handleModalEntityClick = (entityAnalysis: any) => {
    const entity = entityAnalysis?.entity || entityAnalysis;
    if (entity) {
      setModalEntity(entity);
      // Modal stays open with new entity
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Navigation Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="sm" data-testid="button-back-home">
            <a href="/" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Media Hub
            </a>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Cross-Media Discovery Engine</h1>
        <p className="text-muted-foreground">
          Explore connections between different media types through shared entities and narrative pathways.
        </p>
      </div>

      {/* Media Connection Overview */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-6 w-6" />
            Media Network Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Media */}
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Book className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium">{crossMediaData.sourceMedia.title}</p>
                <p className="text-sm text-muted-foreground capitalize">{crossMediaData.sourceMedia.type}</p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Related Media */}
            {crossMediaData.relatedMedia.map((media) => (
              <div key={media.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Radio className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{media.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">{media.type}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {media.connectionStrength}% similarity
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {media.sharedEntities.length} shared entities
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entity Explorer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Entity Explorer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Search and explore entities from all analyzed content
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search entities by name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-entity-search"
              />
            </div>
            
            {searchQuery && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {filteredEntities.slice(0, 12).map((ea) => {
                  const entity = ea.entity;
                  const mentions = ea.mentions || [];
                  
                  return (
                    <Card
                      key={entity.id}
                      className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                      onClick={() => {
                        setModalEntity(ea);
                        setIsModalOpen(true);
                      }}
                      data-testid={`card-entity-${entity.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-sm leading-tight" data-testid={`text-entity-name-${entity.id}`}>
                              {entity.name}
                            </h3>
                            {entity.category && (
                              <Badge variant="outline" className="text-xs shrink-0 ml-2">
                                {entity.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {entity.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{mentions.length} mentions</span>
                            {entity.importance && (
                              <span>{entity.importance}% importance</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {filteredEntities.length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No entities found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
            
            {!searchQuery && (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start typing to search entities...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="entities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entities">Shared Entities</TabsTrigger>
          <TabsTrigger value="pathways">Discovery Pathways</TabsTrigger>
          <TabsTrigger value="contexts">Narrative Contexts</TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entity Cross-References</CardTitle>
              <p className="text-sm text-muted-foreground">
                Entities that appear in both the book and podcast, creating natural discovery pathways.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {crossMediaData.relatedMedia[0]?.sharedEntities.map((entity) => (
                  <button
                    key={entity}
                    onClick={() => handleEntitySelect(entity)}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      selectedEntity === entity
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm">{entity}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Click to see cross-references
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pathways" className="space-y-4">
          <div className="grid gap-4">
            {crossMediaData.discoveryPaths.map((path, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">"{path.entity}" Discovery Path</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {path.path.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          {step.mediaType === 'book' ? (
                            <Book className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Radio className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{step.title}</p>
                          <p className="text-sm text-muted-foreground">{step.context}</p>
                        </div>
                        {stepIndex < path.path.length - 1 && (
                          <ArrowRight className="h-5 w-5 text-muted-foreground mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contexts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Narrative Context Overlaps</CardTitle>
              <p className="text-sm text-muted-foreground">
                Similar themes and stories that appear across different media formats.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crossMediaData.relatedMedia[0]?.contexts.map((context, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Link className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">{context}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This narrative thread connects the personal memoir with the interview discussion,
                      providing different perspectives on the same life experiences.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation Actions */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="/">🏠 Media Hub</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/book">📖 Read Book</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/analyze">🎧 Listen to Podcast</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entity Detail Modal */}
      {modalEntity && (
        <EntityDetailModal
          entity={modalEntity.entity || modalEntity}
          mentions={modalEntity.mentions || authenticMerleAnalysis.entityAnalysis
            ?.find(ea => ea.entity.id === (modalEntity.entity?.id || modalEntity.id))
            ?.mentions || []
          }
          analysis={authenticMerleAnalysis}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onBack={handleCloseModal}
          onCategoryClick={() => {}}
          onEntityClick={handleModalEntityClick}
        />
      )}
    </div>
  );
}