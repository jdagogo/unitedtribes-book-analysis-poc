import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./styles/entities.css";
import Home from "@/pages/home.tsx";
import Discover from "@/pages/discover.tsx";
import Analyze from "@/pages/analyze.tsx";
import PDFAnalyze from "@/pages/pdf-analyze.tsx";
import TranscriptViewer from "@/pages/transcript-viewer.tsx";
import { BookPage } from "@/pages/book.tsx";
import { CrossMediaDiscoveryPage } from "@/pages/cross-media-discovery.tsx";
import ProcessAudiobook from "@/pages/process-audiobook.tsx";
import AudiobookReader from "@/pages/audiobook-reader.tsx";
import AudioSyncTest from "@/pages/audio-sync-test.tsx";
import AudioSyncCalibration from "@/pages/audio-sync-calibration.tsx";
import RealSync from "@/pages/real-sync.tsx";
import AutoSync from "@/pages/auto-sync.tsx";
import AutoSyncChapters from "@/pages/auto-sync-chapters.tsx";
import PaginatedReader from "@/pages/paginated-reader.tsx";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/discover" component={Discover} />
      <Route path="/analyze" component={Analyze} />
      <Route path="/pdf-analyze" component={PDFAnalyze} />
      <Route path="/transcript/:id" component={TranscriptViewer} />
      <Route path="/results" component={Analyze} />
      <Route path="/book" component={BookPage} />
      <Route path="/cross-media" component={CrossMediaDiscoveryPage} />
      <Route path="/cross-media-discovery" component={CrossMediaDiscoveryPage} />
      <Route path="/process-audiobook" component={ProcessAudiobook} />
      <Route path="/audiobook" component={AudiobookReader} />
      <Route path="/audio-sync-test" component={AudioSyncTest} />
      <Route path="/audio-sync-calibration" component={AudioSyncCalibration} />
      <Route path="/real-sync" component={RealSync} />
      <Route path="/auto-sync" component={AutoSync} />
      <Route path="/chapters" component={AutoSyncChapters} />
      <Route path="/paginated" component={PaginatedReader} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
