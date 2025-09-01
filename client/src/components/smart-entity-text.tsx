import React from "react";
import type { ReactNode } from "react";
import type { PodcastAnalysis } from "@shared/schema";

interface SmartEntityTextProps {
  text: string;
  analysis: PodcastAnalysis;
  onEntityClick?: (entity: any) => void;
  className?: string;
}

/**
 * Smart text component that automatically detects and makes clickable any entity mentions
 * within text descriptions, using both explicit markup and intelligent pattern matching
 */
export function SmartEntityText({ text, analysis, onEntityClick, className = "" }: SmartEntityTextProps) {
  if (!analysis?.entityAnalysis) {
    return <span className={className}>{text}</span>;
  }

  // Create a map of all entities for quick lookup
  const entitiesMap = new Map();
  analysis.entityAnalysis.forEach((ea: any) => {
    entitiesMap.set(ea.entity.id, ea.entity);
    entitiesMap.set(ea.entity.name.toLowerCase(), ea.entity);
    ea.entity.aliases?.forEach((alias: string) => {
      entitiesMap.set(alias.toLowerCase(), ea.entity);
    });
  });

  // Process text to find and link entities
  const processText = (inputText: string) => {
    let processedText = inputText;
    const parts: (string | ReactNode)[] = [];
    
    // First, handle explicit markup like {{Farm Aid 1985}}
    const markupRegex = /\{\{([^}]+)\}\}/g;
    let lastIndex = 0;
    let match;
    
    while ((match = markupRegex.exec(inputText)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = inputText.slice(lastIndex, match.index);
        parts.push(...processImplicitEntities(beforeText, entitiesMap, analysis, onEntityClick));
      }
      
      // Handle the explicit entity mention
      const entityName = match[1];
      const entity = entitiesMap.get(entityName.toLowerCase());
      
      if (entity && onEntityClick) {
        parts.push(
          <button
            key={`explicit-${match.index}`}
            onClick={() => {
              console.log('🔗 Smart entity clicked:', entity.name, entity);
              // Need to find the full entity analysis object, not just the entity
              const entityAnalysis = analysis.entityAnalysis?.find((ea: any) => ea.entity.id === entity.id);
              if (entityAnalysis) {
                onEntityClick({ entity: entityAnalysis.entity, mentions: entityAnalysis.mentions || [] });
              } else {
                onEntityClick({ entity: entity, mentions: [] });
              }
            }}
            className="text-blue-600 hover:text-blue-800 underline decoration-dotted hover:decoration-solid cursor-pointer bg-transparent border-none p-0 font-inherit"
            data-testid={`entity-link-${entity.id}`}
          >
            {entityName}
          </button>
        );
      } else {
        parts.push(entityName);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last match
    if (lastIndex < inputText.length) {
      const remainingText = inputText.slice(lastIndex);
      parts.push(...processImplicitEntities(remainingText, entitiesMap, analysis, onEntityClick));
    }
    
    // If no explicit markup was found, process the entire text for implicit entities
    if (parts.length === 0) {
      parts.push(...processImplicitEntities(inputText, entitiesMap, analysis, onEntityClick));
    }
    
    return parts;
  };

  const processedParts = processText(text);
  
  return (
    <span className={className}>
      {processedParts.map((part, index) => 
        typeof part === 'string' ? part : React.cloneElement(part as React.ReactElement, { key: `part-${index}` })
      )}
    </span>
  );
}

/**
 * Process text to find implicit entity mentions (without explicit markup)
 */
function processImplicitEntities(
  text: string, 
  entitiesMap: Map<string, any>, 
  analysis: any,
  onEntityClick?: (entity: any) => void
): (string | ReactNode)[] {
  if (!onEntityClick) return [text];
  
  const parts: (string | ReactNode)[] = [];
  let processedText = text;
  
  // Create array of potential entity matches with their positions
  const matches: { start: number; end: number; entity: any; text: string }[] = [];
  
  entitiesMap.forEach((entity, key) => {
    if (typeof key !== 'string') return;
    
    // Skip very short keys to avoid false matches
    if (key.length < 3) return;
    
    // Create regex for word boundary matching
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'gi');
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      // Check if this match overlaps with existing matches
      const hasOverlap = matches.some(existingMatch => 
        (match!.index < existingMatch.end && match!.index + match![0].length > existingMatch.start)
      );
      
      if (!hasOverlap) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          entity,
          text: match[0]
        });
      }
    }
  });
  
  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);
  
  // Build the final parts array
  let currentIndex = 0;
  
  matches.forEach((match, index) => {
    // Add text before this match
    if (match.start > currentIndex) {
      parts.push(text.slice(currentIndex, match.start));
    }
    
    // Add the linked entity
    parts.push(
      <button
        key={`implicit-${match.start}-${index}`}
        onClick={() => {
          console.log('🔗 Smart entity clicked (implicit):', match.entity.name, match.entity);
          // Need to find the full entity analysis object, not just the entity
          const entityAnalysis = analysis.entityAnalysis?.find((ea: any) => ea.entity.id === match.entity.id);
          if (entityAnalysis) {
            onEntityClick({ entity: entityAnalysis.entity, mentions: entityAnalysis.mentions || [] });
          } else {
            onEntityClick({ entity: match.entity, mentions: [] });
          }
        }}
        className="text-blue-600 hover:text-blue-800 underline decoration-dotted hover:decoration-solid cursor-pointer bg-transparent border-none p-0 font-inherit"
        data-testid={`entity-link-${match.entity.id}`}
      >
        {match.text}
      </button>
    );
    
    currentIndex = match.end;
  });
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }
  
  // If no matches found, return original text
  if (matches.length === 0) {
    return [text];
  }
  
  return parts;
}