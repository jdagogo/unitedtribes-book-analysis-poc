import { X, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PodcastAnalysis } from "@shared/schema";

interface EntityQuickViewProps {
  analysis: PodcastAnalysis;
  entityType: string;
  isOpen: boolean;
  onClose: () => void;
  onViewAll: () => void;
  onEntityClick?: (entity: { entity: any; mentions: any[] }) => void;
  onCategoryClick?: (category: string) => void;
}

export function EntityQuickView({ analysis, entityType, isOpen, onClose, onViewAll, onEntityClick, onCategoryClick }: EntityQuickViewProps) {
  if (!isOpen) return null;

  // Filter entities based on type
  const filteredEntities = (analysis.entityAnalysis || []).filter(ea => {
    if (entityType === 'all') return true;
    if (entityType === 'people') {
      return ea.entity.category === 'musician' || ea.entity.category === 'person' || ea.entity.category === 'journalist';
    }
    if (entityType === 'music') {
      return ea.entity.category === 'music' || ea.entity.category === 'music festival';
    }
    return ea.entity.category === entityType;
  });

  const sortedEntities = filteredEntities.sort((a, b) => b.mentionCount - a.mentionCount);

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      person: "bg-blue-100 text-blue-800",
      musician: "bg-blue-100 text-blue-800",
      journalist: "bg-blue-100 text-blue-800",
      place: "bg-green-100 text-green-800",
      location: "bg-green-100 text-green-800",
      music: "bg-purple-100 text-purple-800",
      "music festival": "bg-purple-100 text-purple-800",
      entertainment: "bg-purple-100 text-purple-800",
      technology: "bg-red-100 text-red-800",
      historical: "bg-yellow-100 text-yellow-800",
      organization: "bg-indigo-100 text-indigo-800",
      transportation: "bg-orange-100 text-orange-800",
      regional: "bg-lime-100 text-lime-800",
      cultural: "bg-teal-100 text-teal-800",
      social: "bg-cyan-100 text-cyan-800",
      political: "bg-rose-100 text-rose-800",
      musical: "bg-purple-100 text-purple-800",
      media: "bg-slate-100 text-slate-800",
      family: "bg-pink-100 text-pink-800",
      artistic: "bg-indigo-100 text-indigo-800",
      personal: "bg-gray-100 text-gray-800",
      recognition: "bg-yellow-100 text-yellow-800",
      incident: "bg-red-100 text-red-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTitle = () => {
    switch (entityType) {
      case 'people': return 'People Mentioned';
      case 'music': return 'Music Mentioned';
      case 'all': return 'All Entities';
      case 'musician': return 'Musicians Mentioned';
      case 'journalist': return 'Journalists Mentioned';
      case 'location': return 'Locations Mentioned';
      case 'place': return 'Places Mentioned';
      case 'music festival': return 'Music Festivals Mentioned';
      case 'transportation': return 'Transportation Mentioned';
      case 'historical': return 'Historical References';
      case 'cultural': return 'Cultural References';
      case 'social': return 'Social References';
      case 'regional': return 'Regional References';
      case 'political': return 'Political References';
      case 'musical': return 'Musical References';
      case 'media': return 'Media References';
      case 'family': return 'Family References';
      case 'artistic': return 'Artistic References';
      case 'personal': return 'Personal References';
      case 'recognition': return 'Recognition & Awards';
      case 'incident': return 'Incidents & Events';
      default: return `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Mentioned`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-semibold text-gray-900">{getTitle()}</h2>
            <Badge variant="secondary" className="text-lg px-3 py-1">{sortedEntities.length} entities</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="lg"
              onClick={onViewAll}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-base">View Full Analysis</span>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={onClose}
              className="p-4 hover:bg-red-50"
            >
              <X className="h-10 w-10" />
            </Button>
          </div>
        </div>

        {/* Entity List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedEntities.map((entityAnalysis, index) => (
              <div
                key={`${entityAnalysis.entity.id}-${index}`}
                className="p-5 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-lg border-2 border-blue-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                data-testid={`entity-${entityAnalysis.entity.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onEntityClick?.({
                  entity: entityAnalysis.entity,
                  mentions: entityAnalysis.mentions || []
                })}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4
                    className="font-bold text-blue-900 flex-1 pr-2 text-xl cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEntityClick?.({
                        entity: entityAnalysis.entity,
                        mentions: entityAnalysis.mentions || []
                      });
                    }}
                  >
                    {entityAnalysis.entity.name}
                  </h4>
                  <Badge
                    className={`${getCategoryBadgeColor(entityAnalysis.entity.category)} cursor-pointer hover:opacity-80 text-base px-3 py-1 border-blue-300 bg-blue-50`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategoryClick?.(entityAnalysis.entity.category);
                    }}
                  >
                    {entityAnalysis.entity.category}
                  </Badge>
                </div>

                <p className="text-base text-gray-700 mb-3 line-clamp-2">
                  {entityAnalysis.entity.description}
                </p>

                <div className="flex items-center justify-between text-base">
                  <span
                    className="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEntityClick?.({
                        entity: entityAnalysis.entity,
                        mentions: entityAnalysis.mentions || []
                      });
                    }}
                  >
                    {entityAnalysis.mentionCount} mention{entityAnalysis.mentionCount !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      entityAnalysis.sentiment === 'positive' ? 'default' :
                      entityAnalysis.sentiment === 'negative' ? 'destructive' :
                      'secondary'
                    } className="text-sm px-2 py-0.5 bg-purple-100 text-purple-800">
                      {entityAnalysis.sentiment}
                    </Badge>
                    <span className="text-gray-700 font-medium">
                      {entityAnalysis.importance}% importance
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedEntities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No entities found for this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}