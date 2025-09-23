import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play } from "lucide-react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname === "overcast.fm" || parsed.hostname === "podcasts.apple.com";
    } catch {
      return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Podcast Analysis</CardTitle>
        <CardDescription>
          Enter an Overcast or Apple Podcasts URL to get detailed entity analysis and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://overcast.fm/+... or https://podcasts.apple.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="text-lg"
            />
            {url && !isValidUrl(url) && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Please enter a valid Overcast or Apple Podcasts URL
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValidUrl(url)}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Analyze Podcast
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}