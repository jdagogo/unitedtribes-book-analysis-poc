import { useState, useMemo, useEffect } from 'react';
import { EnhancedBookReader } from '@/components/enhanced-book-reader';
import { EntityDetailModal } from '@/components/entity-detail-modal';
import { authenticBookAnalysis, authenticEntitiesMap } from '@/data/merle-haggard-book';
import { authenticMerleAnalysis } from '@/data/authentic-merle-analysis';
import type { Entity, EntityMention } from '../../../shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Book, Link2, Search, Home } from 'lucide-react';
import { Link } from 'wouter';

export function BookPage() {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedMention, setSelectedMention] = useState<EntityMention | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for entity modal requests from nested modals (Farm Aid, etc.)
  useEffect(() => {
    const handleEntityModalRequest = (event: any) => {
      console.log('📖 Received entity modal request:', event.detail);
      const entityAnalysis = event.detail;
      const entity = entityAnalysis?.entity || entityAnalysis;
      
      if (entity) {
        console.log('📖 Opening modal for entity:', entity.name);
        setSelectedEntity(entity);
        setSelectedMention(null);
        setIsModalOpen(true);
      }
    };

    window.addEventListener('entityModalRequest', handleEntityModalRequest);
    return () => window.removeEventListener('entityModalRequest', handleEntityModalRequest);
  }, []);

  // Use authentic entities map
  const entitiesMap = authenticEntitiesMap;

  // Get all mentions for cross-reference from podcast analysis
  const allMentions = useMemo(() => {
    const mentions: EntityMention[] = [];
    
    // Add mentions from podcast analysis (convert to proper EntityMention format)
    if (authenticMerleAnalysis?.entityAnalysis) {
      authenticMerleAnalysis.entityAnalysis.forEach(entityData => {
        if (entityData.mentions) {
          entityData.mentions.forEach(mention => {
            mentions.push({
              id: mention.id,
              sentiment: mention.sentiment || null,
              podcastId: mention.podcastId,
              entityId: mention.entityId,
              timestamp: mention.timestamp,
              context: mention.context,
              confidence: mention.confidence || null,
              emotions: mention.emotions || [],
              relationshipType: null // Not available in podcast analysis format
            });
          });
        }
      });
    }
    
    return mentions;
  }, []);

  // Filter entities based on search query for Entity Explorer
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

  const handleEntityClick = (entity: Entity | undefined, mention?: EntityMention) => {
    if (entity) {
      console.log('📖 BookPage handleEntityClick called with:', entity, mention);
      console.log('📖 Looking for podcast matches for entity:', entity.name);
      
      // Find ALL matching entities in podcast analysis for richer data
      const podcastEntities = authenticMerleAnalysis?.entityAnalysis?.filter(ea => {
        const podcastEnt = ea.entity;
        const matches = (
          podcastEnt.id === entity.id ||
          podcastEnt.name.toLowerCase() === entity.name.toLowerCase() ||
          (entity.name === "Mama Tried" && podcastEnt.id === "mama-tried") ||
          (entity.name === "Bakersfield Sound" && podcastEnt.id === "bakersfield-sound") ||
          (entity.name === "Buck Owens" && podcastEnt.id === "buck-owens") ||
          (entity.name === "Johnny Cash" && podcastEnt.id === "johnny-cash")
        );
        if (matches) {
          console.log('📖 Found podcast match:', podcastEnt.name, 'id:', podcastEnt.id, 'mentions:', ea.mentions?.length || 0);
        }
        return matches;
      }) || [];
      
      // Use the first podcast entity if found (has richer data), otherwise use book entity
      const entityToUse = podcastEntities.length > 0 ? podcastEntities[0].entity : entity;
      
      console.log('📖 Using entity:', entityToUse.name, 'podcast matches found:', podcastEntities.length);
      
      setSelectedEntity(entityToUse);
      setSelectedMention(mention || null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntity(null);
    setSelectedMention(null);
  };

  const handleModalEntityClick = (entityAnalysis: any, mention?: EntityMention) => {
    console.log('📖 handleModalEntityClick called with:', entityAnalysis);
    
    // Handle both entity objects and entity analysis objects
    const entity = entityAnalysis?.entity || entityAnalysis;
    
    if (entity) {
      console.log('📖 Setting new entity:', entity.name);
      setSelectedEntity(entity);
      setSelectedMention(mention || null);
      // Modal stays open with new entity
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Quick Media Navigation */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800 mb-3 text-center font-medium">🎵 Quick Access to All Merle Haggard Content</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-white border-amber-300 hover:bg-amber-50">
              <Home className="mr-2 h-4 w-4" />
              Back to Media Hub
            </Button>
          </Link>
          <Link href="/analyze">
            <Button variant="outline" size="sm" className="bg-white border-blue-300 hover:bg-blue-50">
              <Play className="mr-2 h-4 w-4" />
              Podcast Analysis
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="bg-white border-green-300 hover:bg-green-50">
            <Book className="mr-2 h-4 w-4" />
            Book Reader (Current)
          </Button>
          <Link href="/cross-media">
            <Button variant="outline" size="sm" className="bg-white border-purple-300 hover:bg-purple-50">
              <Link2 className="mr-2 h-4 w-4" />
              Cross-Media
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cross-Media Book Analysis</h1>
        <p className="text-muted-foreground">
          Explore Merle Haggard's autobiography with intelligent cross-references to podcast content and entity navigation.
        </p>
      </div>

      {/* Entity Explorer - Compact and Centered */}
      <div className="mb-6">
        <div className="flex justify-center">
          <div className="relative w-full max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search entities (Willie Nelson, Farm Aid, Bakersfield Sound...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-sm hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                data-testid="input-entity-search"
              />
            </div>
            
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 z-10">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {filteredEntities.slice(0, 6).map((ea) => {
                        const entity = ea.entity;
                        const mentions = ea.mentions || [];
                        
                        return (
                          <button
                            key={entity.id}
                            className="text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                            onClick={() => {
                              setSelectedEntity(entity);
                              setIsModalOpen(true);
                              setSearchQuery(''); // Clear search after selection
                            }}
                            data-testid={`button-entity-${entity.id}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {entity.name}
                              </span>
                              {entity.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {entity.category}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {mentions.length} mentions
                              {entity.importance && ` • ${entity.importance}% importance`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {filteredEntities.length === 0 && (
                      <div className="text-center text-gray-500 py-6 text-sm">
                        No entities found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EnhancedBookReader
        bookAnalysis={authenticBookAnalysis}
        entitiesMap={entitiesMap}
        onEntityClick={handleEntityClick}
      />

      {selectedEntity && (
        <EntityDetailModal
          entity={selectedEntity}
          mentions={allMentions.filter(m => 
            m.entityId === selectedEntity.id || 
            (selectedEntity.name === "Bakersfield Sound" && m.entityId === "bakersfield-sound") ||
            (selectedEntity.name === "Mama Tried" && m.entityId === "mama-tried") ||
            (selectedEntity.name === "Buck Owens" && m.entityId === "buck-owens") ||
            (selectedEntity.name === "Johnny Cash" && m.entityId === "johnny-cash")
          )}
          analysis={authenticMerleAnalysis}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onBack={handleCloseModal}
          onCategoryClick={() => {}}
          onTimestampClick={() => {}}
          onEntityClick={handleModalEntityClick}
        />
      )}
    </div>
  );
}