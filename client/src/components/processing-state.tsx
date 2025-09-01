import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ProcessingStateProps {
  podcastId: string;
  onComplete: () => void;
}

export function ProcessingState({ podcastId, onComplete }: ProcessingStateProps) {
  const { data: status } = useQuery<{ status: string }>({
    queryKey: ["/api/podcast", podcastId, "status"],
    refetchInterval: 2000, // Poll every 2 seconds
    enabled: !!podcastId,
  });

  useEffect(() => {
    if (status?.status === "completed") {
      onComplete();
    }
  }, [status, onComplete]);

  const getProgressInfo = (status: string) => {
    switch (status) {
      case "processing":
        return { progress: 45, message: "Transcribing and analyzing..." };
      case "completed":
        return { progress: 100, message: "Analysis complete!" };
      case "failed":
        return { progress: 0, message: "Processing failed. Please try again." };
      default:
        return { progress: 10, message: "Starting analysis..." };
    }
  };

  const progressInfo = getProgressInfo(status?.status || "pending");

  return (
    <Card className="shadow-sm border mb-8">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Podcast</h3>
          <p className="text-gray-600 mb-4">
            Extracting audio, generating transcript, and analyzing entities...
          </p>
          
          <div className="max-w-md mx-auto">
            <Progress value={progressInfo.progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>{progressInfo.message}</span>
              <span>{progressInfo.progress}%</span>
            </div>
          </div>

          {status?.status === "failed" && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                Processing failed. Please check the URL and try again, or contact support if the issue persists.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
