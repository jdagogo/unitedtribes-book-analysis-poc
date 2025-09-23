import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [playerState, setPlayerState] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Check player status every second
    const interval = setInterval(() => {
      if (window.audioSync) {
        try {
          const state = {
            hasAudioSync: true,
            hasSeekTo: typeof window.audioSync.seekTo === 'function',
            currentTime: window.audioSync.getCurrentTime ? window.audioSync.getCurrentTime() : 0,
            duration: window.audioSync.getDuration ? window.audioSync.getDuration() : 0,
            playerState: window.audioSync.getPlayerState ? window.audioSync.getPlayerState() : -1,
            isReady: window.audioSync.isReady ? window.audioSync.isReady() : false
          };
          setPlayerState(state);
        } catch (e) {
          setPlayerState({ hasAudioSync: true, error: e.message });
        }
      } else {
        setPlayerState({ hasAudioSync: false });
      }

      // Also check globalYouTubePlayer
      if (window.globalYouTubePlayer) {
        setPlayerState(prev => ({ 
          ...prev, 
          hasGlobalPlayer: true,
          globalPlayerType: typeof window.globalYouTubePlayer
        }));
      }
    }, 1000);

    // Intercept console.log to capture debug messages
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      // Only capture our debug messages
      if (message.includes('[') && (
        message.includes('CHAPTER') || 
        message.includes('WORD') || 
        message.includes('SEEK') || 
        message.includes('PLAYER') ||
        message.includes('NAV') ||
        message.includes('SCRUBBER') ||
        message.includes('GLOBAL')
      )) {
        setLogs(prev => [...prev.slice(-19), message].slice(-20)); // Keep last 20 logs
      }
    };

    return () => {
      clearInterval(interval);
      console.log = originalLog;
    };
  }, []);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
        >
          <ChevronUp className="h-4 w-4 mr-2" />
          Debug Panel
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[500px] overflow-auto shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">🔧 Debug Panel</CardTitle>
          <Button 
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Player Status */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-600">Player Status</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">audioSync:</span>
              <Badge variant={playerState.hasAudioSync ? "default" : "destructive"} className="text-xs">
                {playerState.hasAudioSync ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">seekTo:</span>
              <Badge variant={playerState.hasSeekTo ? "default" : "destructive"} className="text-xs">
                {playerState.hasSeekTo ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">globalPlayer:</span>
              <Badge variant={playerState.hasGlobalPlayer ? "default" : "destructive"} className="text-xs">
                {playerState.hasGlobalPlayer ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Ready:</span>
              <Badge variant={playerState.isReady ? "default" : "destructive"} className="text-xs">
                {playerState.isReady ? "✓" : "✗"}
              </Badge>
            </div>
          </div>
          
          {playerState.currentTime !== undefined && (
            <div className="text-xs text-gray-600">
              Time: {Math.floor(playerState.currentTime / 60)}:{String(Math.floor(playerState.currentTime % 60)).padStart(2, '0')} 
              {playerState.duration > 0 && ` / ${Math.floor(playerState.duration / 60)}:${String(Math.floor(playerState.duration % 60)).padStart(2, '0')}`}
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-600">Recent Activity</h3>
          <div className="bg-gray-900 text-green-400 p-2 rounded text-xs font-mono max-h-[200px] overflow-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No debug activity yet...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1 break-all">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Test Actions */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-600">Quick Tests</h3>
          <div className="flex flex-wrap gap-1">
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs"
              onClick={() => {
                console.log('[TEST] Seeking to 30s');
                if (window.audioSync?.seekTo) {
                  window.audioSync.seekTo(30);
                }
              }}
            >
              Seek 30s
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs"
              onClick={() => {
                console.log('[TEST] Seeking to 300s');
                if (window.audioSync?.seekTo) {
                  window.audioSync.seekTo(300);
                }
              }}
            >
              Seek 5min
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs"
              onClick={() => {
                console.log('[TEST] Playing');
                if (window.audioSync?.playVideo) {
                  window.audioSync.playVideo();
                }
              }}
            >
              Play
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs"
              onClick={() => {
                console.log('[TEST] Pausing');
                if (window.audioSync?.pauseVideo) {
                  window.audioSync.pauseVideo();
                }
              }}
            >
              Pause
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}