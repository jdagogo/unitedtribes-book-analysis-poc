import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Search, 
  TrendingUp, 
  Music, 
  Film, 
  Book, 
  Mic, 
  MapPin, 
  Clock,
  Zap,
  ArrowRight,
  ExternalLink,
  Database,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";
import { partnerBooks } from "@/data/partner-media";
import { dataSourcesConfig, navigationPathways } from "@/data/data-sources";
import { EntityDetailModal } from "@/components/entity-detail-modal";
import { authenticMerleAnalysis } from "@/data/authentic-merle-analysis";

type NavigationTrigger = {
  id: string;
  name: string;
  type: 'song' | 'album' | 'artist' | 'movie' | 'book' | 'place' | 'era' | 'genre' | 'concept';
  context: string;
  confidence: number;
  relatedMedia: string[];
  timestamp?: string;
};

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<NavigationTrigger | null>(null);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [parentEntity, setParentEntity] = useState<any>(null); // Track parent entity for back navigation
  const [savedScrollPosition, setSavedScrollPosition] = useState<number>(0); // Track scroll position for parent modal

  // Listen for entity modal requests from nested modals (Farm Aid, etc.)
  useEffect(() => {
    const handleEntityModalRequest = (event: any) => {
      console.log('🎯 Discover page received entity modal request:', event.detail);
      const entityAnalysis = event.detail;
      const entity = entityAnalysis?.entity || entityAnalysis;
      const parent = entityAnalysis?.parentEntity;
      
      if (entity) {
        console.log('🎯 Opening modal for entity:', entity.name);
        console.log('🎯 Parent entity:', parent?.name || 'none');
        
        // If we have a parent, save the current scroll position
        if (parent) {
          const modalContent = document.querySelector('[data-modal-content]');
          if (modalContent) {
            const scrollTop = modalContent.scrollTop;
            console.log('🎯 Saving scroll position:', scrollTop);
            setSavedScrollPosition(scrollTop);
          }
        }
        
        setSelectedEntity(entity);
        setParentEntity(parent); // Store parent for back navigation
        setShowEntityModal(true);
        setSelectedTrigger(null); // Close any existing trigger modal
      }
    };

    window.addEventListener('entityModalRequest', handleEntityModalRequest);
    return () => window.removeEventListener('entityModalRequest', handleEntityModalRequest);
  }, []);
  
  // Handle clicking on Related Media items
  const handleRelatedMediaClick = (mediaTitle: string) => {
    // Map media titles to UnitedTribes entity modals with embedded content
    if (mediaTitle === "Johnny Cash - At San Quentin (Live)") {
      // Open Johnny Cash entity with embedded San Quentin concert video
      const johnnyEntity = {
        id: "johnny-cash",
        name: "Johnny Cash",
        type: "person",
        category: "musician",
        description: "Country music legend whose San Quentin performance deeply inspired the young Merle Haggard",
        aliases: ["The Man in Black"],
        sentiment: "reverential",
        importance: 85
      };
      setSelectedEntity(johnnyEntity);
      setShowEntityModal(true);
      setSelectedTrigger(null); // Close the trigger modal
    } else if (mediaTitle === "Cash: The Autobiography (HarperCollins)") {
      // Show Cash autobiography details within the app
      console.log("Opening Cash autobiography details");
    } else if (mediaTitle === "Prison reform documentaries") {
      // Show prison reform content
      console.log("Opening prison reform documentaries");
    } else if (mediaTitle === "Folsom Prison Blues") {
      // Open Folsom Prison Blues song entity
      const folsomEntity = {
        id: "folsom-prison-blues",
        name: "Folsom Prison Blues",
        type: "song",
        category: "music",
        description: "Johnny Cash's iconic prison song that established his outlaw country persona",
        aliases: [],
        sentiment: "gritty",
        importance: 88
      };
      setSelectedEntity(folsomEntity);
      setShowEntityModal(true);
      setSelectedTrigger(null);
    } else {
      // Generic handler for other media
      console.log(`Opening ${mediaTitle}`);
    }
  };

  // Standardize entity categories for consistent UI experience  
  const standardizeEntityType = (entity: any): "song" | "album" | "artist" | "movie" | "book" | "place" | "era" | "genre" | "concept" => {
    // Map categories to consistent types
    const categoryMap: Record<string, "song" | "album" | "artist" | "movie" | "book" | "place" | "era" | "genre" | "concept"> = {
      'musician': 'artist',
      'location': 'place', 
      'music': 'song',
      'historical event': 'era',
      'music festival': 'era',
      'concept': 'concept',
      'person': 'artist', // Treat persons as artists for music context
      'song': 'song',
      'album': 'album',
      'prison': 'place',
      'train': 'concept',
      'railway': 'concept'
    };

    return categoryMap[entity.category] || categoryMap[entity.type] || 'concept';
  };

  // Convert analyzed entities to navigation triggers
  const entityToTrigger = (entityAnalysis: any): NavigationTrigger => {
    const entity = entityAnalysis.entity;
    return {
      id: entity.id,
      name: entity.name,
      type: standardizeEntityType(entity),
      context: `From Merle Haggard interview - ${entityAnalysis.summary}`,
      confidence: entityAnalysis.importance / 100,
      relatedMedia: entityAnalysis.mentions.map((m: any) => m.context),
      timestamp: entityAnalysis.mentions[0]?.timestamp ? `${Math.floor(entityAnalysis.mentions[0].timestamp / 60)}:${(entityAnalysis.mentions[0].timestamp % 60).toString().padStart(2, '0')}` : undefined
    };
  };

  // Get ALL entities from authentic analysis and convert to triggers
  const entityTriggers = authenticMerleAnalysis.entityAnalysis.map(entityToTrigger);

  // Combine with partner data triggers
  const partnerTriggers: NavigationTrigger[] = [
    {
      id: "1",
      name: "San Quentin",
      type: "place",
      context: "From Johnny Cash autobiography - prison concerts and social justice",
      confidence: 0.95,
      relatedMedia: [
        "Johnny Cash - At San Quentin (Live)", 
        "Cash: The Autobiography (HarperCollins)",
        "Prison reform documentaries",
        "Folsom Prison Blues"
      ],
      timestamp: "12:34"
    },
    {
      id: "2", 
      name: "British Invasion",
      type: "era",
      context: "From Bernie Marsden memoir - 1960s UK rock conquest of America",
      confidence: 0.98,
      relatedMedia: [
        "Where's My Guitar? (HarperCollins)",
        "Beatles discography", 
        "Rolling Stones catalog",
        "British rock history"
      ],
      timestamp: "8:15"
    },
    {
      id: "3",
      name: "Soul Train",
      type: "concept",
      context: "From Questlove book - cultural phenomenon launching careers",
      confidence: 0.92,
      relatedMedia: [
        "Soul Train: The Music, Dance, and Style (HarperCollins)",
        "Don Cornelius biography",
        "1970s soul music",
        "Whitney Houston early appearances"
      ],
      timestamp: "23:42"
    },
    {
      id: "4",
      name: "Hip-hop origins",
      type: "era", 
      context: "From Questlove's Music is History - 1970s Bronx cultural movement",
      confidence: 0.96,
      relatedMedia: [
        "Music is History (HarperCollins)",
        "Grandmaster Flash",
        "Afrika Bambaataa", 
        "DJ Kool Herc"
      ],
      timestamp: "18:22"
    }
  ];

  // All available triggers for search
  const featuredTriggers = [...entityTriggers, ...partnerTriggers];

  // Filter triggers based on search query
  const filteredTriggers = featuredTriggers.filter(trigger => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      trigger.name.toLowerCase().includes(query) ||
      trigger.type.toLowerCase().includes(query) ||
      trigger.context.toLowerCase().includes(query) ||
      trigger.relatedMedia.some(media => media.toLowerCase().includes(query))
    );
  });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'song':
      case 'album': 
      case 'artist': return <Music className="h-4 w-4" />;
      case 'movie': return <Film className="h-4 w-4" />;
      case 'book': return <Book className="h-4 w-4" />;
      case 'place': return <MapPin className="h-4 w-4" />;
      case 'era': 
      case 'event': return <Clock className="h-4 w-4" />;
      case 'concept': return <Zap className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'song':
      case 'album':
      case 'artist': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'movie': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'book': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'place': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'era': 
      case 'event': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'concept': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Media Discovery Engine
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Navigate seamlessly between any media mention. From "San Quentin" to Johnny Cash albums, 
            from "Nashville" to country music discovery.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search navigation triggers: places, artists, eras, concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="analyze">Analyze Content</TabsTrigger>
            <TabsTrigger value="network">Media Network</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Featured Navigation Triggers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Featured Navigation Triggers
                </CardTitle>
                <CardDescription>
                  Recent discoveries from analyzed content - click any trigger to explore related media
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTriggers.length === 0 && searchQuery ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">
                      No navigation triggers found for "{searchQuery}"
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                      Try searching for: places, artists, eras, concepts, or related media
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTriggers.map((trigger, index) => (
                    <Card 
                      key={`trigger-${trigger.id}-${trigger.type}-${index}`}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
                      onClick={() => {
                        // Find the full entity analysis data
                        const entityAnalysis = authenticMerleAnalysis.entityAnalysis.find(ea => ea.entity.id === trigger.id);
                        
                        if (entityAnalysis) {
                          // Open the entity detail modal with full analysis data including mentions
                          const entityWithMentions = {
                            ...entityAnalysis.entity,
                            mentions: entityAnalysis.mentions,
                            analysis: entityAnalysis
                          };
                          setSelectedEntity(entityWithMentions);
                          setShowEntityModal(true);
                        } else {
                          // Fallback for partner triggers without full entity data
                          setSelectedTrigger(trigger);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(trigger.type)}
                            <h3 className="font-semibold">{trigger.name}</h3>
                          </div>
                          <Badge 
                            className={`${getTypeColor(trigger.type)} cursor-pointer hover:opacity-80 transition-opacity`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation(); // Prevent card click
                              setSearchQuery(trigger.type); // Filter by this category
                            }}
                          >
                            {trigger.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                          {trigger.context}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {trigger.relatedMedia.length} related items
                          </span>
                          {trigger.timestamp && (
                            <span className="text-slate-500">
                              @{trigger.timestamp}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              Confidence: {Math.round(trigger.confidence * 100)}%
                            </span>
                            <ArrowRight className="h-3 w-3 text-slate-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media Categories */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Music Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span>Songs & Albums</span>
                    <Badge>47 triggers</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span>Artists & Bands</span>
                    <Badge>32 triggers</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span>Genres & Styles</span>
                    <Badge>28 triggers</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Cultural Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span>Places & Scenes</span>
                    <Badge>23 triggers</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span>Time Periods</span>
                    <Badge>18 triggers</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span>Movements</span>
                    <Badge>15 triggers</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyze New Content</CardTitle>
                <CardDescription>
                  Extract navigation triggers from podcasts, videos, articles, or any media content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow p-6 text-center">
                    <Mic className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="font-semibold mb-2">Podcast Analysis</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Extract 80-150+ navigation triggers from podcast episodes
                    </p>
                    <div className="space-y-2">
                      <Link href="/analyze">
                        <Button size="sm" variant="outline" className="w-full">
                          Start Analysis
                        </Button>
                      </Link>
                    </div>
                  </Card>
                  
                  <Card className="p-6 text-center opacity-50">
                    <Film className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="font-semibold mb-2">Video Content</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Coming in Phase 2 - YouTube and streaming analysis
                    </p>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </Card>
                  
                  <Card className="p-6 text-center">
                    <Book className="h-12 w-12 mx-auto mb-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-semibold mb-2">Book & Audiobook</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      Extract 80-150+ navigation triggers from book content and audiobooks
                    </p>
                    <div className="space-y-2">
                      <Link href="/audiobook">
                        <Button size="sm" className="w-full">
                          🎧 Listen to Full Audiobook
                        </Button>
                      </Link>
                      <Link href="/book">
                        <Button size="sm" variant="outline" className="w-full">
                          Read Current Book
                        </Button>
                      </Link>
                      <Link href="/process-audiobook">
                        <Button size="sm" variant="outline" className="w-full">
                          Process New Content
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Authentic Data Sources */}
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Powered by Partner Data Sources</h3>
            <p className="text-muted-foreground">Real connections across industry platforms and cultural signals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSourcesConfig.tasteAndCultural.map((source, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-sm">{source.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{source.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {source.category.replace('_', ' ')}
                    </Badge>
                    {source.apiUrl && (
                      <Badge variant="outline" className="text-xs">API Ready</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {source.example}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Partner Books Integration */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                HarperCollins Partner Books ({partnerBooks.length} titles)
              </CardTitle>
              <CardDescription>
                Music books with rich navigation trigger potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {partnerBooks.slice(0, 6).map((book, index) => (
                  <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">{book.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">by {book.author}</p>
                    <div className="flex flex-wrap gap-1">
                      {book.navigationTriggers.slice(0, 3).map((trigger, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                      {book.navigationTriggers.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{book.navigationTriggers.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Badge variant="secondary">
                  {partnerBooks.reduce((total, book) => total + book.navigationTriggers.length, 0)} total navigation triggers
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Trigger Detail Modal */}
        {selectedTrigger && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(selectedTrigger.type)}
                    <CardTitle>{selectedTrigger.name}</CardTitle>
                    <Badge className={getTypeColor(selectedTrigger.type)}>
                      {selectedTrigger.type}
                    </Badge>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedTrigger(null)}>
                    ×
                  </Button>
                </div>
                <CardDescription>{selectedTrigger.context}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Related Media</h4>
                  <div className="space-y-2">
                    {selectedTrigger.relatedMedia.map((media, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors" 
                           onClick={() => handleRelatedMediaClick(media)}>
                        <span className="font-medium">{media}</span>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Entity Detail Modal */}
        {showEntityModal && selectedEntity && (
          <EntityDetailModal
            entity={selectedEntity}
            mentions={selectedEntity.mentions || []}
            isOpen={showEntityModal}
            onClose={() => {
              console.log('🎯 Discover onClose called, parentEntity:', parentEntity?.name || 'none');
              if (parentEntity) {
                console.log('🎯 Close button - navigating back to parent entity:', parentEntity.name);
                // Navigate back to parent entity instead of closing completely
                setSelectedEntity(parentEntity);
                setParentEntity(null);
                
                // Restore scroll position after a brief delay for DOM update
                setTimeout(() => {
                  const modalContent = document.querySelector('[data-modal-content]');
                  if (modalContent && savedScrollPosition > 0) {
                    console.log('🎯 Restoring scroll position:', savedScrollPosition);
                    modalContent.scrollTop = savedScrollPosition;
                    setSavedScrollPosition(0); // Clear saved position
                  }
                }, 100);
              } else {
                console.log('🎯 Close button - no parent entity, closing modal');
                // No parent, close modal completely
                setShowEntityModal(false);
                setSelectedEntity(null);
                setParentEntity(null);
              }
            }}
            onBack={() => {
              console.log('🎯 Discover onBack called, parentEntity:', parentEntity?.name || 'none');
              if (parentEntity) {
                console.log('🎯 Navigating back to parent entity:', parentEntity.name);
                // Navigate back to parent entity
                setSelectedEntity(parentEntity);
                setParentEntity(null);
                
                // Restore scroll position after a brief delay for DOM update
                setTimeout(() => {
                  const modalContent = document.querySelector('[data-modal-content]');
                  if (modalContent && savedScrollPosition > 0) {
                    console.log('🎯 Restoring scroll position:', savedScrollPosition);
                    modalContent.scrollTop = savedScrollPosition;
                    setSavedScrollPosition(0); // Clear saved position
                  }
                }, 100);
              } else {
                console.log('🎯 No parent entity, closing modal');
                // No parent, close modal completely
                setShowEntityModal(false);
                setSelectedEntity(null);
              }
            }}
            onCategoryClick={(category) => {
              setSearchQuery(category);
              setShowEntityModal(false);
              setSelectedEntity(null);
              setParentEntity(null);
            }}
            onTimestampClick={(timestamp) => {
              // Close modal and navigate to results page with timestamp
              setShowEntityModal(false);
              setSelectedEntity(null);
              setParentEntity(null);
              // Use react router navigation instead of opening new tab
              window.location.href = `/results?t=${Math.max(0, timestamp - 5)}`;
            }}
            analysis={authenticMerleAnalysis as any}
          />
        )}
      </div>
    </div>
  );
}