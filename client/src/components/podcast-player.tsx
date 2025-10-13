import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, Clock } from "lucide-react";
import type { EntityMention, Entity } from "@shared/schema";
import { getEntitiesAtContentTime, getTranscriptAtContentTime } from "@/data/timestamped-transcript";
// Remove debug imports

interface PodcastPlayerProps {
  audioUrl?: string;
  duration: number;
  entityMentions: EntityMention[];
  entities: Entity[];
  transcript: string;
  onEntityClick: (entity: Entity, mention: EntityMention) => void;
  onCategoryClick?: (category: string) => void;
  initialTimestamp?: number;
  onPauseRefSet?: (pauseFn: () => void) => void;
}

export function PodcastPlayer({
  audioUrl,
  duration,
  entityMentions,
  entities,
  transcript,
  onEntityClick,
  onCategoryClick,
  initialTimestamp = 0,
  onPauseRefSet
}: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTimestamp);
  const [volume, setVolume] = useState(1);
  const [freshAirAudio, setFreshAirAudio] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState<string | null>(null);
  const [contentStartTime, setContentStartTime] = useState<number | null>(null);
  const [prerollDetected, setPrerollDetected] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch Fresh Air audio on component mount
  useEffect(() => {
    const fetchFreshAirAudio = async () => {
      try {
        console.log("🎙️ Fetching Fresh Air audio from RSS feed...");
        const response = await fetch('/api/fresh-air-audio');
        if (response.ok) {
          const data = await response.json();
          console.log("🎙️ Fresh Air audio found:", data.title);
          setFreshAirAudio(data.audioUrl);
          setAudioTitle(data.title);
          
          // Log successful audio load
          console.log("🎵 Precise audio-transcript mapper loaded");
        } else {
          console.warn("🎙️ Fresh Air audio not available, using demo audio");
        }
      } catch (error) {
        console.warn("🎙️ Failed to fetch Fresh Air audio:", error);
      }
    };
    
    fetchFreshAirAudio();
  }, []);

  // Set initial timestamp when audio loads
  useEffect(() => {
    if (audioRef.current && initialTimestamp > 0) {
      audioRef.current.currentTime = initialTimestamp;
      setCurrentTime(initialTimestamp);
    }
  }, [freshAirAudio, audioUrl, initialTimestamp]);

  // Provide pause function to parent
  useEffect(() => {
    if (onPauseRefSet) {
      const pauseFn = () => {
        console.log('🎵 Pause called from modal, audioRef:', !!audioRef.current);
        if (audioRef.current) {
          audioRef.current.pause();
          console.log('🎵 Audio paused successfully');
        }
        setIsPlaying(false);
      };
      onPauseRefSet(pauseFn);
    }
  }, [onPauseRefSet]);

  // Use Fresh Air audio if available, otherwise fall back to provided audio or demo
  const demoAudioUrl = "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3";
  const workingAudioUrl = freshAirAudio || audioUrl || demoAudioUrl;
  const hasValidAudioUrl = freshAirAudio || (audioUrl && audioUrl !== "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav");

  // Get entities map for quick lookup
  const entitiesMap = new Map(entities.map(e => [e.id, e]));

  // Content detection effect - monitors audio for actual content start
  useEffect(() => {
    if (!audioRef.current || prerollDetected) return;

    const audio = audioRef.current;
    let detectionTimeout: NodeJS.Timeout;

    const detectContentStart = () => {
      const currentPosition = audio.currentTime;
      
      // NPR Fresh Air typically starts with "This is Fresh Air" after preroll
      // We detect content start when we're past typical preroll duration (15-30 seconds)
      // and haven't yet detected the content start
      if (currentPosition > 15 && currentPosition < 60 && !contentStartTime) {
        console.log('🎵 Content detection: Assuming content started around', Math.max(15, currentPosition - 5));
        const detectedStart = Math.max(15, currentPosition - 5);
        setContentStartTime(detectedStart);
        setPrerollDetected(true);
        
        // Update the timestamp mapper with detected content start
        if (window.updateContentStartTime) {
          window.updateContentStartTime(detectedStart);
        }
      }
    };

    const handleTimeUpdate = () => {
      if (!prerollDetected && audio.currentTime > 10) {
        detectionTimeout = setTimeout(detectContentStart, 1000);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      if (detectionTimeout) clearTimeout(detectionTimeout);
    };
  }, [freshAirAudio, contentStartTime, prerollDetected]);

  // Get active entities based on content time (audio time minus preroll)
  const contentTime = Math.max(0, currentTime - (contentStartTime || 15));
  const activeEntityIds = getEntitiesAtContentTime(contentTime);
  const currentTranscriptText = getTranscriptAtContentTime(contentTime);

  // Debug logging for timing synchronization
  if (isPlaying) {
    console.log('🎵 Audio timing:', {
      currentTime: Math.round(currentTime * 10) / 10,
      contentStartTime,
      contentTime: Math.round(contentTime * 10) / 10,
      detectedPreroll: prerollDetected,
      activeEntityIds: activeEntityIds,
      entityCount: activeEntityIds.length,
      transcriptText: currentTranscriptText.substring(0, 50) + "..."
    });
  }
  
  // Get current mentions based on precise audio-timestamp mapping
  const getCurrentMentions = () => {
    // Create a Set to track unique entity IDs to prevent duplicates
    const seenEntityIds = new Set<string>();
    
    // Get entities that are currently active in the timestamped transcript
    const activeMentions = entityMentions.filter(mention => {
      if (activeEntityIds.includes(mention.entityId) && !seenEntityIds.has(mention.entityId)) {
        seenEntityIds.add(mention.entityId);
        return true;
      }
      return false;
    });
    
    const allRelevantMentions = activeMentions;
    
    return allRelevantMentions
      .sort((a, b) => {
        // Sort by importance
        const aEntity = entitiesMap.get(a.entityId);
        const bEntity = entitiesMap.get(b.entityId);
        return (bEntity?.importance || 0) - (aEntity?.importance || 0);
      })
      .slice(0, 6); // Show max 6 current mentions
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    console.log('🎵 Play/Pause clicked:', { isPlaying, workingAudioUrl, hasAudio: !!audioRef.current });
    
    if (workingAudioUrl && audioRef.current) {
      // Real audio mode
      if (isPlaying) {
        console.log('🎵 Pausing real audio');
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('🎵 Playing real audio');
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.warn('🎵 Audio playback failed, falling back to demo mode:', error);
          setIsPlaying(true);
          startDemoMode();
        });
      }
    } else {
      // Demo mode fallback
      if (isPlaying) {
        console.log('🎵 Pausing demo audio');
        setIsPlaying(false);
        if (demoIntervalRef.current) {
          clearInterval(demoIntervalRef.current);
          demoIntervalRef.current = null;
          console.log('🎵 Demo interval cleared');
        }
      } else {
        console.log('🎵 Playing demo audio');
        setIsPlaying(true);
        startDemoMode();
      }
    }
  };

  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startDemoMode = () => {
    // Clear any existing interval
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
    }
    
    console.log('🎵 Starting demo audio simulation');
    demoIntervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) {
          clearInterval(demoIntervalRef.current!);
          demoIntervalRef.current = null;
          setIsPlaying(false);
          console.log('🎵 Demo audio finished');
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Stop demo mode when paused
  useEffect(() => {
    console.log('🎵 isPlaying changed to:', isPlaying, 'interval exists:', !!demoIntervalRef.current);
    if (!isPlaying && demoIntervalRef.current) {
      console.log('🎵 Clearing demo interval due to pause');
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  }, [isPlaying]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    };
  }, []);

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const jumpToMention = (timestamp: number) => {
    setCurrentTime(timestamp);
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp;
    }
  };

  const skipTime = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Real audio event listeners
  useEffect(() => {
    if (audioRef.current && workingAudioUrl) {
      const updateTime = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        console.log('🎵 Real audio finished');
      };
      
      const handlePause = () => {
        setIsPlaying(false);
        console.log('🎵 Real audio paused');
      };
      
      const handlePlay = () => {
        setIsPlaying(true);
        console.log('🎵 Real audio started');
        // Stop demo mode if it was running
        if (demoIntervalRef.current) {
          clearInterval(demoIntervalRef.current);
          demoIntervalRef.current = null;
        }
      };
      
      const audio = audioRef.current;
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('play', handlePlay);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('play', handlePlay);
      };
    }
  }, [workingAudioUrl]);

  const currentMentions = getCurrentMentions();

  return (
    <div className="space-y-4">
      {/* Audio Element */}
      {workingAudioUrl && (
        <audio
          ref={audioRef}
          src={workingAudioUrl}
          preload="metadata"
        />
      )}

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* LEFT COLUMN - Media Player and Timeline */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main Player Controls */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Play className="h-6 w-6" />
                Contextual Media Player
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* Progress Bar */}
              <div className="space-y-1">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-lg font-medium text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => skipTime(-15)}
                  className="px-4 py-6"
                >
                  <SkipBack className="h-6 w-6 mr-2" />
                  <span className="text-lg font-semibold">15s</span>
                </Button>

                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="h-16 w-16 rounded-full"
                  disabled={false}
                >
                  {isPlaying ?
                    <Pause className="h-8 w-8" /> :
                    <Play className="h-8 w-8" />
                  }
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => skipTime(15)}
                  className="px-4 py-6"
                >
                  <SkipForward className="h-6 w-6 mr-2" />
                  <span className="text-lg font-semibold">15s</span>
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6" />
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.1}
                  onValueChange={(value) => {
                    setVolume(value[0]);
                    if (audioRef.current) {
                      audioRef.current.volume = value[0];
                    }
                  }}
                  className="w-32"
                />
              </div>

              {!hasValidAudioUrl && !workingAudioUrl && (
                <div className="text-center py-2 text-muted-foreground">
                  <div className="relative">
                    <Clock className={`h-8 w-8 mx-auto mb-1 transition-transform ${isPlaying ? 'animate-spin' : ''}`} />
                    {isPlaying && (
                      <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping" />
                    )}
                  </div>
                  <p className="font-medium text-lg">
                    {isPlaying ? '🎵 Demo Audio Playing...' : 'Demo Mode - Simulated Audio Player'}
                  </p>
                  <p className="text-base">
                    {isPlaying ? 'Pause to stop simulation' : 'Click play to explore contextual navigation'}
                  </p>
                  {isPlaying && (
                    <div className="mt-1 flex justify-center">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 bg-blue-500 rounded-full animate-bounce`}
                            style={{
                              height: `${Math.random() * 20 + 10}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {workingAudioUrl && (
                <div className="text-center py-2 text-gray-800">
                  <p className="text-base flex items-center justify-center gap-2 font-semibold">
                    <Volume2 className="h-5 w-5" />
                    {isPlaying ? 'Audio Playing' : 'Audio Ready'}
                    <span className={`text-base font-bold ${freshAirAudio ? 'text-blue-600' : 'text-green-600'}`}>
                      ● {freshAirAudio ? 'Fresh Air (NPR)' : 'Real Audio'}
                    </span>
                  </p>
                  {audioTitle && freshAirAudio && (
                    <p className="text-sm text-gray-700 mt-0.5 font-medium">
                      "{audioTitle}"
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Timeline Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Navigation Timeline ({entityMentions.length} contextual triggers)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                {/* Timeline bar */}
                <div className="h-4 bg-gray-200 rounded-full relative overflow-hidden">
                  {/* Current position indicator */}
                  <div
                    className="absolute top-0 w-1 h-full bg-blue-500 transition-all duration-100 z-10"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />

                  {/* Entity mention markers with importance-based colors */}
                  {entityMentions.map((mention) => {
                    const entity = entitiesMap.get(mention.entityId);
                    const importance = entity?.importance || 50;
                    const color = importance >= 80 ? 'bg-red-500 hover:bg-red-600' :
                                 importance >= 60 ? 'bg-orange-500 hover:bg-orange-600' :
                                 'bg-green-500 hover:bg-green-600';

                    return (
                      <div
                        key={mention.id}
                        className={`absolute top-0 w-2 h-full cursor-pointer transition-colors ${color}`}
                        style={{ left: `${(mention.timestamp / duration) * 100}%` }}
                        onClick={() => jumpToMention(mention.timestamp)}
                        title={`${entity?.name} (${importance}% importance) at ${formatTime(mention.timestamp)}\n${mention.context.substring(0, 100)}...`}
                      />
                    );
                  })}
                </div>

                {/* Timeline labels */}
                <div className="flex justify-between text-lg font-medium text-muted-foreground mt-2">
                  <span>0:00</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Navigation Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{entities.length}</div>
                  <div className="text-base text-muted-foreground">Unique Entities</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{entityMentions.length}</div>
                  <div className="text-base text-muted-foreground">Total Mentions</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {entities.filter(e => e.importance && e.importance >= 70).length}
                  </div>
                  <div className="text-base text-muted-foreground">High Importance</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {new Set(entities.map(e => e.category)).size}
                  </div>
                  <div className="text-base text-muted-foreground">Categories</div>
                </div>
              </div>

              {/* Entity Categories */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Navigation Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(entities.map(e => e.category))).map((category) => {
                    const count = entities.filter(e => e.category === category).length;
                    return (
                      <Badge
                        key={category}
                        variant="outline"
                        className="text-base cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors px-3 py-1"
                        onClick={() => {
                          onCategoryClick?.(category);
                        }}
                        data-testid={`nav-category-${category.replace(/\s+/g, '-')}`}
                      >
                        {category} ({count})
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="text-base text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-red-500 rounded"></span>
                  High importance (80%+)
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-orange-500 rounded"></span>
                  Medium importance (60-79%)
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-green-500 rounded"></span>
                  Standard importance (&lt;60%)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Live Entities Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 lg:sticky lg:top-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                Live Entities ({currentMentions.length})
                <span className="block text-base font-normal text-muted-foreground mt-0.5">
                  Current context at {formatTime(currentTime)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[800px] overflow-y-auto pb-2">
              {currentMentions.length > 0 ? (
                <div className="space-y-3">
                  {currentMentions.slice().reverse().map((mention, index) => {
                    const entity = entitiesMap.get(mention.entityId);
                    if (!entity) return null;

                    return (
                      <div
                        key={`context-${mention.id}-${index}`}
                        className="p-3 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-slate-800 rounded-lg border-2 border-blue-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 hover:shadow-md dark:hover:bg-slate-700 transition-all duration-200"
                        onClick={() => onEntityClick(entity, mention)}
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-base px-2 py-0.5 border-blue-300 bg-blue-50">
                              {entity.category}
                            </Badge>
                            <span className="text-lg font-medium text-blue-600">
                              @{formatTime(mention.timestamp)}
                            </span>
                            {mention.confidence && (
                              <Badge variant="secondary" className="text-base bg-purple-100 text-purple-800">
                                {mention.confidence}%
                              </Badge>
                            )}
                            {mention.sentiment && (
                              <Badge
                                className={`text-base ${
                                  mention.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                  mention.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {mention.sentiment}
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">
                            {entity.name}
                          </h3>

                          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            {mention.context}
                          </p>

                          {entity.importance && (
                            <div className="flex items-center gap-2">
                              <span className="text-base text-muted-foreground">Importance:</span>
                              <span className={`text-base font-semibold ${
                                entity.importance >= 80 ? 'text-red-600' :
                                entity.importance >= 60 ? 'text-orange-600' :
                                'text-gray-600'
                              }`}>
                                {entity.importance}%
                              </span>
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-base"
                              onClick={(e) => {
                                e.stopPropagation();
                                jumpToMention(mention.timestamp);
                              }}
                            >
                              Jump
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-base"
                              onClick={() => onEntityClick(entity, mention)}
                            >
                              Explore
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground space-y-1.5">
                  <p className="text-lg">No entities mentioned in current timeframe</p>
                  <p className="text-base">Total entities: {entities.length} | Total mentions: {entityMentions.length}</p>
                  <p className="text-base">Navigate timeline to explore {entityMentions.length} contextual triggers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}