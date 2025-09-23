import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Entity {
  id: string;
  name: string;
  category: string;
  description?: string;
  aliases?: string[];
  importance: number;
}

interface EntitySearchProps {
  entities: Entity[];
  onEntitySelect: (entity: Entity) => void;
  placeholder?: string;
  className?: string;
}

// Enhanced fuzzy search scoring function
function fuzzyScore(text: string, query: string): number {
  if (!query || !text) return 0;
  
  text = text.toLowerCase();
  query = query.toLowerCase();
  
  // Exact match gets highest score
  if (text === query) return 100;
  
  // Starts with gets high score
  if (text.startsWith(query)) return 90;
  
  // Word boundary matches get high scores
  const words = text.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(query)) return 85;
    if (word === query) return 95;
  }
  
  // Contains gets medium score
  if (text.includes(query)) return 70;
  
  // Check for partial word matches
  for (const word of words) {
    if (word.includes(query)) return 60;
  }
  
  // Check for partial character matches
  let score = 0;
  let queryIndex = 0;
  let consecutiveMatches = 0;
  
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      score += 2;
      consecutiveMatches++;
      queryIndex++;
    } else {
      consecutiveMatches = 0;
    }
    
    // Bonus for consecutive character matches
    if (consecutiveMatches > 1) {
      score += consecutiveMatches;
    }
  }
  
  // Bonus for completing the query
  if (queryIndex === query.length) {
    score += 20;
  }
  
  // Penalty for very short queries matching long text
  if (query.length <= 2 && text.length > 20) {
    score *= 0.5;
  }
  
  return score;
}

function getCategoryBadgeColor(category: string): string {
  const colors = {
    music: "bg-purple-100 text-purple-800 border-purple-200",
    musician: "bg-blue-100 text-blue-800 border-blue-200", 
    location: "bg-green-100 text-green-800 border-green-200",
    recognition: "bg-yellow-100 text-yellow-800 border-yellow-200",
    media: "bg-orange-100 text-orange-800 border-orange-200",
    event: "bg-red-100 text-red-800 border-red-200",
    transportation: "bg-gray-100 text-gray-800 border-gray-200",
    journalist: "bg-indigo-100 text-indigo-800 border-indigo-200",
    musical: "bg-pink-100 text-pink-800 border-pink-200"
  };
  return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function EntitySearch({ entities, onEntitySelect, placeholder = "Search entities (Willie Nelson, Farm Aid, Bakersfield Sound...)", className = "" }: EntitySearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredEntities = useMemo(() => {
    if (!query.trim()) return [];

    // Deduplicate entities by ID first
    const uniqueEntities = entities.reduce((acc, entity) => {
      if (!acc.find(e => e.id === entity.id)) {
        acc.push(entity);
      }
      return acc;
    }, [] as Entity[]);

    const results = uniqueEntities.map(entity => {
      // Score based on name
      let score = fuzzyScore(entity.name, query);
      
      // Score based on aliases
      if (entity.aliases && entity.aliases.length > 0) {
        const aliasScore = Math.max(...entity.aliases.map(alias => fuzzyScore(alias, query)));
        score = Math.max(score, aliasScore * 0.9); // Slightly lower weight for aliases
      }
      
      // Score based on category
      const categoryScore = fuzzyScore(entity.category, query) * 0.7;
      score = Math.max(score, categoryScore);
      
      // Score based on description
      if (entity.description) {
        const descScore = fuzzyScore(entity.description, query) * 0.5;
        score = Math.max(score, descScore);
      }
      
      return { entity, score };
    })
    .filter(item => item.score > 10) // Raise minimum score threshold for better relevance
    .sort((a, b) => {
      // Primary sort by score
      if (b.score !== a.score) return b.score - a.score;
      // Secondary sort by importance
      return b.entity.importance - a.entity.importance;
    })
    .slice(0, 6) // Reduce to 6 results for better focus
    .map(item => item.entity);

    return results;
  }, [entities, query]);

  const handleSelect = (entity: Entity) => {
    onEntitySelect(entity);
    setQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        {!query && (
          <div className="absolute left-10 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <span className="text-blue-600 font-bold">Search entities</span>
            <span className="text-gray-500 ml-1">(e.g., San Quentin, Johnny Cash, Mama Tried...)</span>
          </div>
        )}
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          placeholder=""
          className="pl-10 pr-10 bg-amber-50/90 border-amber-200/60 shadow-sm hover:bg-amber-50 focus:bg-white focus:border-amber-300 transition-colors font-medium text-gray-800 rounded-lg"
          data-testid="input-entity-search"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            data-testid="button-clear-search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && filteredEntities.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2 space-y-1">
            {filteredEntities.map((entity, index) => (
              <Card
                key={`${entity.id}-${index}`}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSelect(entity)}
                data-testid={`card-entity-${entity.id}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{entity.name}</h4>
                      {entity.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entity.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCategoryBadgeColor(entity.category)} variant="outline">
                          {entity.category}
                        </Badge>
                        <span className="text-xs text-gray-500">{entity.importance}% importance</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isOpen && query && filteredEntities.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground">
          No entities found for "{query}"
        </div>
      )}
    </div>
  );
}