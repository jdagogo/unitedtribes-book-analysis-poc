import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EntityDetailModal } from "@/components/entity-detail-modal";
import { authenticMerleAnalysis } from "@/data/authentic-merle-analysis";
import { 
  ArrowRight, 
  Zap, 
  Music, 
  Film, 
  Book, 
  MapPin, 
  Clock, 
  TrendingUp,
  Play,
  Search,
  Sparkles,
  Globe,
  Shield,
  DollarSign,
  Link2,
  Users,
  Target,
  Headphones,
  CheckCircle,
  BookOpen,
  PlayCircle
} from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [activeHub, setActiveHub] = useState<"merle" | "patti">("merle");

  // Get all entities from the analysis
  const allEntities = authenticMerleAnalysis.entityAnalysis;

  // Filter and sort entities based on search query
  const filteredEntities = searchQuery ? allEntities
    .filter(entityData => 
      entityData.entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entityData.entity.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entityData.entity.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Remove duplicates by entity ID
    .filter((entityData, index, self) => 
      self.findIndex(e => e.entity.id === entityData.entity.id) === index
    )
    // Sort by relevance: exact name match first, then by importance, then by mention count
    .sort((a, b) => {
      const aName = a.entity.name.toLowerCase();
      const bName = b.entity.name.toLowerCase();
      const query = searchQuery.toLowerCase();
      
      // Exact name match gets highest priority
      const aExactMatch = aName === query;
      const bExactMatch = bName === query;
      if (aExactMatch && !bExactMatch) return -1;
      if (bExactMatch && !aExactMatch) return 1;
      
      // Name starts with query gets second priority
      const aStartsWith = aName.startsWith(query);
      const bStartsWith = bName.startsWith(query);
      if (aStartsWith && !bStartsWith) return -1;
      if (bStartsWith && !aStartsWith) return 1;
      
      // Then sort by importance (if available)
      const aImportance = a.entity.importance || 0;
      const bImportance = b.entity.importance || 0;
      if (aImportance !== bImportance) return bImportance - aImportance;
      
      // Finally sort by mention count
      const aMentions = a.mentions?.length || 0;
      const bMentions = b.mentions?.length || 0;
      return bMentions - aMentions;
    })
    .slice(0, 6) // Show top 6 results
    : [];

  const handleEntityClick = (entityData: any) => {
    setSelectedEntity(entityData.entity);
    setIsEntityModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEntityModalOpen(false);
    setSelectedEntity(null);
  };

  // Get mentions for the selected entity
  const selectedEntityMentions = selectedEntity 
    ? allEntities.find(e => e.entity.id === selectedEntity.id)?.mentions || []
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            The Missing Layer Bridging Media × AI
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
            UnitedTribes
          </h1>
          
          <p className="text-2xl text-slate-700 dark:text-slate-200 max-w-4xl mx-auto mb-4 leading-relaxed font-medium">
            A billion people ask AI about the media they love.
          </p>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-6">
            Today's AI fails fans, creators, developers... Dead ends, bad data, and no direct path to consumption.
          </p>
          
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8">
            We're fixing it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/chapters">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <PlayCircle className="mr-2 h-5 w-5" />
                NEW: Listen with Perfect Sync
              </Button>
            </Link>
            <Link href="/discover">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Play className="mr-2 h-5 w-5" />
                Try the Demo
              </Button>
            </Link>
            <Link href="/cross-media">
              <Button size="lg" variant="outline">
                <Link2 className="mr-2 h-5 w-5" />
                Cross-Media Discovery
              </Button>
            </Link>
          </div>
        </div>

        {/* NEW: Perfect Audiobook Sync Feature */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300">
            <CardContent className="py-8">
              <div className="text-center mb-6">
                <Badge className="mx-auto mb-3 bg-green-600 text-white px-4 py-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  NEW FEATURE - WORKING NOW
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  🎧 Perfect Audio-Text Synchronization
                </h2>
                <p className="text-lg text-gray-700">
                  Experience Merle Haggard's autobiography with revolutionary word-level sync
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-6">
                <div className="text-center">
                  <Headphones className="h-10 w-10 mx-auto mb-2 text-emerald-600" />
                  <p className="font-bold text-xl">4.6 Hours</p>
                  <p className="text-gray-600">Narrated by Merle himself</p>
                </div>
                <div className="text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 text-emerald-600" />
                  <p className="font-bold text-xl">19 Chapters</p>
                  <p className="text-gray-600">Navigate by life events</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-600" />
                  <p className="font-bold text-xl">43,263 Words</p>
                  <p className="text-gray-600">Every word perfectly synced</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="font-bold text-lg mb-3">✨ What Makes This Special:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Click Any Word to Jump</p>
                      <p className="text-sm text-gray-600">Instant navigation to any point in the audio</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Chapter Navigation</p>
                      <p className="text-sm text-gray-600">Jump between life events and stories</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Real-Time Highlighting</p>
                      <p className="text-sm text-gray-600">Words highlight as they're spoken</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">100% Accurate</p>
                      <p className="text-sm text-gray-600">Using YouTube's official transcription</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Link href="/chapters">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start Listening Now
                  </Button>
                </Link>
                <Link href="/auto-sync">
                  <Button size="lg" variant="outline">
                    View Technical Demo
                  </Button>
                </Link>
              </div>

              <p className="text-center text-sm text-gray-600 mt-4">
                This demonstrates UnitedTribes' capability to perfectly synchronize any audio content with its transcript
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Media Hub - Direct Access */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
            <CardContent className="py-8">
              {/* Hub Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-lg border-2 border-amber-300 p-1.5 bg-white">
                  <Button
                    onClick={() => setActiveHub("merle")}
                    variant={activeHub === "merle" ? "default" : "ghost"}
                    className={activeHub === "merle" ? "bg-amber-500 hover:bg-amber-600 text-lg px-6 py-3" : "text-lg px-6 py-3"}
                    size="lg"
                  >
                    <span className="text-2xl mr-2">🎵</span> Merle Haggard
                  </Button>
                  <Button
                    onClick={() => setActiveHub("patti")}
                    variant={activeHub === "patti" ? "default" : "ghost"}
                    className={activeHub === "patti" ? "bg-purple-500 hover:bg-purple-600 text-lg px-6 py-3" : "text-lg px-6 py-3"}
                    size="lg"
                  >
                    <span className="text-2xl mr-2">🎸</span> Patti Smith
                  </Button>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {activeHub === "merle" ? "🎵 Merle Haggard Media Hub" : "🎸 Patti Smith Media Hub"}
                </h2>
                <p className="text-lg text-gray-700">
                  {activeHub === "merle" 
                    ? "One-click access to all authentic content and analysis"
                    : "Explore Patti Smith's literary and musical journey"}
                </p>
              </div>
              
              {activeHub === "merle" ? (
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Podcast Analysis */}
                <Link href="/analyze">
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-white border-2 border-blue-200 hover:border-blue-400">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Fresh Air Interview</h3>
                      <p className="text-gray-600 text-sm mb-3">NPR podcast with real audio, entity analysis & cross-media connections</p>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Live Analysis</Badge>
                    </CardContent>
                  </Card>
                </Link>

                {/* Book */}
                <Link href="/book">
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-white border-2 border-green-200 hover:border-green-400">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Book className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">My House of Memories</h3>
                      <p className="text-gray-600 text-sm mb-3">Full 43,229-word autobiography with chapter navigation & entity highlighting</p>
                      <Badge className="bg-green-100 text-green-800 text-xs">Interactive Reader</Badge>
                    </CardContent>
                  </Card>
                </Link>

                {/* Cross-Media Discovery */}
                <Link href="/cross-media">
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-white border-2 border-purple-200 hover:border-purple-400">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Link2 className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Cross-Media Discovery</h3>
                      <p className="text-gray-600 text-sm mb-3">Navigate between podcast, book, and videos through shared entities</p>
                      <Badge className="bg-purple-100 text-purple-800 text-xs">Smart Navigation</Badge>
                    </CardContent>
                  </Card>
                </Link>
              </div>
              ) : (
                /* Patti Smith Media Hub */
                <div className="grid md:grid-cols-1 gap-6 max-w-md mx-auto">
                  {/* Just Kids Book */}
                  <Link href="/paginated">
                    <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-white border-2 border-purple-200 hover:border-purple-400">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Book className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          <em>Just Kids</em>
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Patti Smith's National Book Award-winning memoir of her relationship with Robert Mapplethorpe
                        </p>
                        <Badge className="bg-purple-100 text-purple-800 text-xs">Paginated Reader</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )}

              {/* Entity Search - Only show for Merle hub */}
              {activeHub === "merle" && (
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">🔍 Entity Explorer</h3>
                  <p className="text-gray-600">Search and explore entities from the Merle Haggard analysis</p>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder=" "
                    className="pl-10 py-3 text-lg bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-sm hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-colors font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-entity-search"
                  />
                  {!searchQuery && (
                    <div className="absolute left-10 top-1/2 transform -translate-y-1/2 pointer-events-none text-lg">
                      <span className="font-bold text-blue-600 dark:text-blue-400">Search entities</span>
                      <span className="text-gray-500 dark:text-gray-400"> (e.g., San Quentin, Johnny Cash, Mama Tried...)</span>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchQuery && filteredEntities.length > 0 && (
                  <div className="mt-4 grid gap-2 max-h-80 overflow-y-auto">
                    {filteredEntities.map((entityData) => (
                      <Button
                        key={entityData.entity.id}
                        variant="outline"
                        className="p-4 h-auto text-left justify-start hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => handleEntityClick(entityData)}
                        data-testid={`button-entity-${entityData.entity.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{entityData.entity.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {entityData.entity.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {entityData.mentions?.length || 0} mentions
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {entityData.entity.description}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}

                {searchQuery && filteredEntities.length === 0 && (
                  <div className="mt-4 text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No entities found for "{searchQuery}"</p>
                    <p className="text-sm mt-1">Try searching for: Merle Haggard, San Quentin, Johnny Cash, Farm Aid</p>
                  </div>
                )}
              </div>
              )}

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  {activeHub === "merle" 
                    ? "All content uses authentic sources with full entity extraction and cross-referencing"
                    : "Experience Patti Smith's groundbreaking memoir in an interactive format"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Value Proposition */}
        <Card className="mb-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-6">
              With UnitedTribes, billions of pieces of media are intelligently connected and instantly accessible.
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <Music className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <p className="text-lg">Songs to superfan experiences</p>
              </div>
              <div className="text-center">
                <Film className="h-12 w-12 mx-auto mb-4 text-purple-200" />
                <p className="text-lg">Movies to books</p>
              </div>
              <div className="text-center">
                <Link2 className="h-12 w-12 mx-auto mb-4 text-pink-200" />
                <p className="text-lg">Podcasts to playlists</p>
              </div>
            </div>
            <p className="text-xl mt-8 text-blue-100">
              Direct to consumption. Legal. Authorized. Tracked. No silos.
            </p>
          </CardContent>
        </Card>

        {/* AI Comparison */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                What You Get with GPT Today:
              </CardTitle>
              <CardDescription className="text-lg">
                "Tell me about Chappell Roan — I love Olivia Rodrigo." (Try it!)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>A generic regurgitated Wikipedia remix</span>
              </div>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>No direct links, no consumption, no monetization</span>
              </div>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>A DEAD END for fans and the business</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">
                What You Get with UnitedTribes:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Direct links to official music, video, and playlists</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Cross-media connections (TV syncs, Tiny Desk, cultural moments)</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Context-aware journeys (Hot To Go → TikTok → Olivia tour clips)</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Attribution & consumption tracked. Revenue captured. Creators paid. Fans thrilled.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Features */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Industry's First Authorized AI Platform</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100">
                First industry-backed specialized AI model & canonical cross-media dataset, 
                continuously updated with authorized media data from leading publishers.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Rights-Protecting API Business Model</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100">
                Accessible to AI products, developers, and services through API, 
                powering cross-media discovery without allowing training on publishers' assets.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Leading Media Companies Committed</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-pink-100">
                Major media partners already joining UnitedTribes, 
                building the foundation for universal media discovery.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Demo Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Experience the Technology Today</CardTitle>
            <CardDescription className="text-center text-lg">
              Phase 1: Podcast Analysis Demo - See contextual media discovery in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Navigation Trigger Extraction
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="font-medium">"San Quentin" mentioned in podcast</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      → Instant links to Johnny Cash's "San Quentin" album, prison documentaries, related protest songs
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="font-medium">"British Invasion" cultural reference</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      → Beatles discography, Rolling Stones catalog, 1960s cultural impact documentaries
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  Cross-Media Discovery
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="font-medium">80-150+ triggers per content piece</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Every mention becomes a pathway to authorized media consumption
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="font-medium">Legal, tracked, monetizable</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Attribution preserved, creators compensated, fans connected
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/discover">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Zap className="mr-2 h-5 w-5" />
                  Try the Discovery Engine Demo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Business Value */}
        <Card className="mb-16 bg-slate-900 text-white border-0">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-6">
              UnitedTribes is the business layer AI is missing.
            </h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-2">Accurate</div>
                <p className="text-slate-300">Authorized data from media partners</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 mb-2">Rights-cleared</div>
                <p className="text-slate-300">Legal, tracked, attribution preserved</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-400 mb-2">API-delivered</div>
                <p className="text-slate-300">Seamless integration for developers</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 mb-2">Revenue-generating</div>
                <p className="text-slate-300">Direct path to monetization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 mb-16">
          <CardContent className="py-12">
            <h2 className="text-4xl font-bold mb-4">
              The Revolution Starts Now.
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Built in collaboration with the world's leading media companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Play className="mr-2 h-5 w-5" />
                  Experience the Demo
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Users className="mr-2 h-5 w-5" />
                Join as Media Partner
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entity Detail Modal */}
      <EntityDetailModal
        entity={selectedEntity}
        mentions={selectedEntityMentions}
        isOpen={isEntityModalOpen}
        onClose={handleCloseModal}
        analysis={authenticMerleAnalysis}
      />
    </div>
  );
}