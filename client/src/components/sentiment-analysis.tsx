import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PodcastAnalysis } from "@shared/schema";

interface SentimentAnalysisProps {
  analysis: PodcastAnalysis;
}

export function SentimentAnalysis({ analysis }: SentimentAnalysisProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const emotionalJourney = analysis.insights.emotionalJourney as any[] || [];
  const overallSentiment = analysis.insights.overallSentiment || 'neutral';

  // Get sentiment distribution from entity mentions
  const entitySentiments = (analysis.entityAnalysis || []).flatMap(ea => 
    ea.mentions.map(m => m.sentiment).filter(Boolean)
  );
  
  const sentimentCounts = {
    positive: entitySentiments.filter(s => s === 'positive').length,
    negative: entitySentiments.filter(s => s === 'negative').length,
    neutral: entitySentiments.filter(s => s === 'neutral').length,
  };

  const totalSentiments = Object.values(sentimentCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Overall Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getSentimentIcon(overallSentiment)}
            Overall Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Overall Tone:</span>
            <Badge className={getSentimentColor(overallSentiment)}>
              {overallSentiment.toUpperCase()}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Positive Mentions</span>
                <span>{totalSentiments > 0 ? Math.round((sentimentCounts.positive / totalSentiments) * 100) : 0}%</span>
              </div>
              <Progress 
                value={totalSentiments > 0 ? (sentimentCounts.positive / totalSentiments) * 100 : 0} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Neutral Mentions</span>
                <span>{totalSentiments > 0 ? Math.round((sentimentCounts.neutral / totalSentiments) * 100) : 0}%</span>
              </div>
              <Progress 
                value={totalSentiments > 0 ? (sentimentCounts.neutral / totalSentiments) * 100 : 0} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Negative Mentions</span>
                <span>{totalSentiments > 0 ? Math.round((sentimentCounts.negative / totalSentiments) * 100) : 0}%</span>
              </div>
              <Progress 
                value={totalSentiments > 0 ? (sentimentCounts.negative / totalSentiments) * 100 : 0} 
                className="h-2"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{sentimentCounts.positive}</div>
              <div className="text-xs text-gray-500">Positive</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{sentimentCounts.neutral}</div>
              <div className="text-xs text-gray-500">Neutral</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{sentimentCounts.negative}</div>
              <div className="text-xs text-gray-500">Negative</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emotional Journey */}
      {emotionalJourney.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Emotional Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emotionalJourney.slice(0, 10).map((point, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-500">
                      {formatTimestamp(point.timestamp)}
                    </span>
                    {getSentimentIcon(point.sentiment)}
                    <Badge className={getSentimentColor(point.sentiment)} variant="outline">
                      {point.sentiment}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {point.emotions && point.emotions.length > 0 && (
                      <div className="flex gap-1">
                        {point.emotions.slice(0, 2).map((emotion: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {point.intensity}% intensity
                    </div>
                  </div>
                </div>
              ))}
              
              {emotionalJourney.length > 10 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-gray-500">
                    Showing first 10 of {emotionalJourney.length} emotional points
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emotional Variance */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Emotional Variance:</span>
            <div className="flex items-center gap-2">
              <Progress 
                value={Math.min(analysis.stats.emotionalVariance, 100)} 
                className="w-20 h-2"
              />
              <span className="text-sm font-medium">{analysis.stats.emotionalVariance}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            How much the emotional tone varies throughout the episode
          </p>
        </CardContent>
      </Card>
    </div>
  );
}