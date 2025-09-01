declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    audioSync: {
      getCurrentTime: () => number;
      seekTo: (time: number, allowSeekAhead?: boolean) => void;
      playVideo: () => void;
      pauseVideo: () => void;
      setVolume: (volume: number) => void;
      getDuration: () => number;
      getPlayerState: () => number;
    } | null;
  }
}

export {};