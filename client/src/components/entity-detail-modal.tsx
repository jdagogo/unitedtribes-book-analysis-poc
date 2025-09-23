import { useEffect, useRef, useState } from "react";
import { X, ArrowLeft, Clock, MapPin, Globe, Play, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WikipediaIntegration from './wikipedia-integration';
import { SmartEntityText } from './smart-entity-text';
import type { PodcastAnalysis, BookAnalysis } from "@shared/schema";

// Global video state manager - simplified approach
const globalVideoState = {
  currentPlayingId: null as string | null,
  
  setPlaying(videoId: string) {
    this.currentPlayingId = videoId;
  },
  
  clearPlaying() {
    this.currentPlayingId = null;
  },
  
  isPlaying(videoId: string) {
    return this.currentPlayingId === videoId;
  }
};

interface EntityDetailModalProps {
  entity: any;
  mentions: any[];
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onCategoryClick?: (category: string) => void;
  onEntityClick?: (entity: any) => void;
  onTimestampClick?: (timestamp: number) => void;
  analysis?: PodcastAnalysis | BookAnalysis;
}

export function EntityDetailModal({ entity, mentions, isOpen, onClose, onBack, onCategoryClick, onEntityClick, onTimestampClick, analysis }: EntityDetailModalProps) {
  console.log('🔗 EntityDetailModal rendering with props:');
  console.log('🔗 - onEntityClick type:', typeof onEntityClick);
  console.log('🔗 - onEntityClick function:', onEntityClick);
  console.log('🔗 - entity:', entity?.name);
  console.log('🔗 - mentions count:', mentions?.length);
  console.log('🔗 - isOpen:', isOpen);

  // Early return if entity is undefined
  if (!entity) {
    console.log('🔗 Entity is undefined, returning null');
    return null;
  }

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Generate unique video ID
  const generateVideoId = (baseId: string) => `${entity?.id || 'unknown'}-${baseId}`;

  // Clear active video when modal closes or entity changes
  useEffect(() => {
    if (!isOpen) {
      setActiveVideoId(null);
      globalVideoState.clearPlaying();
    }
  }, [isOpen]);

  useEffect(() => {
    if (entity?.id) {
      setActiveVideoId(null);
      globalVideoState.clearPlaying();
    }
  }, [entity?.id]);

  const handleVideoClick = (videoId: string) => {
    // Stop any currently playing video
    setActiveVideoId(null);
    globalVideoState.clearPlaying();
    
    // Start the new video after a brief delay
    setTimeout(() => {
      setActiveVideoId(videoId);
      globalVideoState.setPlaying(videoId);
    }, 100);
  };

  // Create a working entity click handler that doesn't depend on undefined props
  const handleEntityClickInternal = (clickedEntity: any) => {
    console.log('🔗 handleEntityClickInternal called with:', clickedEntity);
    
    if (onEntityClick) {
      console.log('🔗 Calling provided onEntityClick');
      onEntityClick(clickedEntity);
    } else {
      console.log('🔗 onEntityClick not provided, dispatching custom event with parent context');
      // Dispatch custom event with parent context for proper navigation
      console.log('🔗 Dispatching custom event for:', clickedEntity.entity.name);
      window.dispatchEvent(new CustomEvent('entityModalRequest', { 
        detail: { 
          ...clickedEntity,
          parentEntity: entity // Include current entity as parent for back navigation
        }
      }));
    }
  };
  const [showWikipedia, setShowWikipedia] = useState(false);
  const [expandedEntities, setExpandedEntities] = useState<any[]>([]);
  const [newRelationships, setNewRelationships] = useState<any[]>([]);

  // Add click event listener for entity spans
  useEffect(() => {
    console.log('🔗 Setting up entity click event listener');
    
    const handleEntitySpanClick = (event: Event) => {
      const target = event.target as HTMLElement;
      console.log('🔗 Click detected on:', target.className, target.tagName);
      
      if (target.classList.contains('entity-clickable')) {
        event.preventDefault();
        event.stopPropagation();
        
        const entityName = target.dataset.entityName;
        const entityCategory = target.dataset.entityCategory;
        
        console.log('🔗 ENTITY SPAN CLICKED!', entityName, entityCategory);
        
        if (entityName && entityCategory) {
          console.log('🔗 Searching for entity in analysis:', entityName);
          
          // Handle both PodcastAnalysis and BookAnalysis structures
          const entityAnalysis = (analysis as any)?.entityAnalysis || (analysis as any)?.entities || [];
          console.log('🔗 Available entities:', entityAnalysis?.slice(0, 10)?.map((ea: any) => ea.entity?.name || ea.name));
          
          // Search for exact matches first, then partial matches
          let foundEntity = entityAnalysis?.find((ea: any) => {
            const entity = ea.entity || ea;
            return entity.name.toLowerCase() === entityName.toLowerCase();
          });
          
          // If no exact match, try aliases
          if (!foundEntity) {
            foundEntity = entityAnalysis?.find((ea: any) => {
              const entity = ea.entity || ea;
              return entity.aliases?.some((alias: string) => alias.toLowerCase() === entityName.toLowerCase());
            });
          }
          
          // If still no match, try partial matching
          if (!foundEntity) {
            foundEntity = entityAnalysis?.find((ea: any) => {
              const entity = ea.entity || ea;
              return entity.name.toLowerCase().includes(entityName.toLowerCase()) || 
                     entityName.toLowerCase().includes(entity.name.toLowerCase());
            });
          }
          
          console.log('🔗 Search result for', entityName, ':', foundEntity ? (foundEntity.entity?.name || foundEntity.name) : 'not found');
          
          if (foundEntity) {
            const entity = foundEntity.entity || foundEntity;
            console.log('🔗 Found matching entity:', entity.name, 'calling handleEntityClickInternal');
            handleEntityClickInternal({ entity: entity, mentions: foundEntity.mentions || [] });
          } else {
            console.log('🔗 No entity found, searching by category and partial name...');
            // Try a more lenient search by category
            const categoryMatch = entityAnalysis?.find((ea: any) => {
              const entity = ea.entity || ea;
              return entity.category === entityCategory && 
                     (entity.name.toLowerCase().includes(entityName.toLowerCase()) ||
                      entityName.toLowerCase().includes(entity.name.toLowerCase()));
            });
            
            if (categoryMatch) {
              const entity = categoryMatch.entity || categoryMatch;
              console.log('🔗 Found category match:', entity.name);
              handleEntityClickInternal({ entity: entity, mentions: categoryMatch.mentions || [] });
            } else {
              console.log('🔗 Creating new entity for:', entityName);
              // Create a basic entity object if not found in analysis
              handleEntityClickInternal({ 
                entity: { 
                  id: entityName.toLowerCase().replace(/\s+/g, '-'),
                  name: entityName, 
                  category: entityCategory,
                  description: `Information about ${entityName}`
                }, 
                mentions: [] 
              });
            }
          }
        }
      }
    };

    // Add event listener to the document
    document.addEventListener('click', handleEntitySpanClick);
    
    return () => {
      document.removeEventListener('click', handleEntitySpanClick);
    };
  }, [analysis, handleEntityClickInternal]);

  if (!isOpen || !entity) return null;
  
  // Handle Wikipedia entity clicks - search for entity in our dataset
  const handleWikipediaEntityClick = (entityName: string) => {
    // Check both original entities and newly expanded entities
    const analysisEntities = analysis?.entityAnalysis || (analysis as any)?.entities || [];
    const allEntities = [...analysisEntities, ...expandedEntities.map(e => ({ entity: e }))];
    
    const foundEntity = allEntities.find((ea: any) => {
      const entity = ea.entity;
      // Check exact name match
      if (entity.name.toLowerCase() === entityName.toLowerCase()) return true;
      // Check if any aliases match
      if (entity.aliases?.some((alias: string) => alias.toLowerCase() === entityName.toLowerCase())) return true;
      // Check partial matches for common variations
      if (entity.name.toLowerCase().includes(entityName.toLowerCase()) || 
          entityName.toLowerCase().includes(entity.name.toLowerCase())) return true;
      return false;
    });
    
    if (foundEntity && onEntityClick) {
      // Close Wikipedia modal and open the found entity
      setShowWikipedia(false);
      onEntityClick(foundEntity);
    } else {
      // If not found in our dataset, close Wikipedia and show a message
      setShowWikipedia(false);
      
      // Create a visual feedback for entities not yet in our knowledge base
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div class="fixed top-4 right-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div class="flex items-start gap-2">
            <div class="text-blue-600 mt-0.5">🔍</div>
            <div>
              <p class="font-medium">"${entityName}" - Knowledge Expansion Opportunity</p>
              <p class="text-sm text-blue-600 mt-1">This entity from Wikipedia isn't in our current analysis but could be added to expand the knowledge base.</p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after 4 seconds
      setTimeout(() => {
        notification.remove();
      }, 4000);
    }
  };

  // Handle knowledge expansion completion
  const handleKnowledgeExpanded = (newEntities: any[], relationships: any[]) => {
    if (newEntities.length > 0) {
      setExpandedEntities(prev => [...prev, ...newEntities]);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div class="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div class="flex items-start gap-2">
            <div class="text-green-600 mt-0.5">✨</div>
            <div>
              <p class="font-medium">Knowledge Base Expanded!</p>
              <p class="text-sm text-green-600 mt-1">Added ${newEntities.length} new entities with ${relationships.length} relationships to your knowledge graph.</p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
    
    if (relationships.length > 0) {
      setNewRelationships(prev => [...prev, ...relationships]);
    }
  };

  // Handle clicking on related entities
  const handleEntityClick = (entityInfo: { name: string; category: string }) => {
    console.log('🔗 handleEntityClick called with:', entityInfo);
    console.log('🔗 onEntityClick available:', !!onEntityClick);
    console.log('🔗 analysis available:', !!analysis);
    
    // Find the entity in the analysis data
    const foundEntity = analysis?.entityAnalysis?.find((ea: any) => 
      ea.entity.name === entityInfo.name || 
      ea.entity.aliases?.includes(entityInfo.name)
    );
    
    console.log('🔗 Found entity in analysis:', !!foundEntity);
    
    if (foundEntity && onEntityClick) {
      console.log('🔗 Calling onEntityClick with found entity:', foundEntity.entity.name);
      onEntityClick(foundEntity);
    } else if (foundEntity) {
      console.log('🔗 onEntityClick not available, dispatching custom event for found entity:', foundEntity.entity.name);
      handleEntityClickInternal(foundEntity);
    } else if (onEntityClick) {
      // Create a basic entity object if not found in analysis
      const basicEntity = {
        entity: {
          id: entityInfo.name.toLowerCase().replace(/\s+/g, '-'),
          name: entityInfo.name,
          category: entityInfo.category,
          type: entityInfo.category === 'music' ? 'song' : entityInfo.category === 'musician' ? 'person' : 'concept',
          description: `${entityInfo.name} - related to Merle Haggard and the Bakersfield sound`,
          importance: 75
        },
        mentions: []
      };
      console.log('🔗 Calling onEntityClick with basic entity:', basicEntity.entity.name);
      onEntityClick(basicEntity);
    } else {
      // Create a basic entity object and dispatch custom event
      const basicEntity = {
        entity: {
          id: entityInfo.name.toLowerCase().replace(/\s+/g, '-'),
          name: entityInfo.name,
          category: entityInfo.category,
          type: entityInfo.category === 'music' ? 'song' : entityInfo.category === 'musician' ? 'person' : 'concept',
          description: `${entityInfo.name} - related to Merle Haggard and the Bakersfield sound`,
          importance: 75
        },
        mentions: []
      };
      console.log('🔗 onEntityClick not available, dispatching custom event for basic entity:', basicEntity.entity.name);
      handleEntityClickInternal(basicEntity);
    }
  };

  // Simpler approach: Use dangerouslySetInnerHTML with direct event handling
  const makeEntitiesClickable = (text: string) => {
    console.log('🔗 makeEntitiesClickable called with text:', text.substring(0, 100));
    
    // List of known artists and entities that should be clickable
    const knownEntities = [
      { name: "Bob Dylan", category: "musician" },
      { name: "Billy Joel", category: "musician" },
      { name: "Bonnie Raitt", category: "musician" },
      { name: "Tom Petty", category: "musician" },
      { name: "B.B. King", category: "musician" },
      { name: "Willie Nelson", category: "musician" },
      { name: "Neil Young", category: "musician" },
      { name: "Johnny Cash", category: "musician" },
      { name: "Waylon Jennings", category: "musician" },
      { name: "Loretta Lynn", category: "musician" },
      { name: "Roy Orbison", category: "musician" },
      { name: "George Jones", category: "musician" },
      { name: "John Mellencamp", category: "musician" },
      { name: "Merle Haggard", category: "musician" },
      { name: "Buck Owens", category: "musician" },
      { name: "Lefty Frizzell", category: "musician" },
      { name: "Jimmie Rodgers", category: "musician" },
      { name: "Natural High", category: "music" },
      { name: "Mama Tried", category: "music" },
      { name: "Okie From Muskogee", category: "music" },
      { name: "Folsom Prison Blues", category: "music" },
      { name: "Waiting For A Train", category: "music" },
      { name: "Farm Aid", category: "music festival" },
      { name: "Farm Aid 1985", category: "music festival" },
      { name: "San Quentin", category: "location" },
      { name: "Bakersfield", category: "location" },
      { name: "Champaign", category: "location" }
    ];

    let processedText = text;
    
    // Replace entity names with clickable spans using data attributes
    knownEntities.forEach(entity => {
      const regex = new RegExp(`\\b${entity.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      processedText = processedText.replace(regex, (match) => {
        return `<span class="entity-clickable font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer" data-entity-name="${entity.name}" data-entity-category="${entity.category}">${match}</span>`;
      });
    });

    return processedText;
  };

  // Function to get multiple videos for entities that have multiple related videos
  const getMultipleVideos = (entityName: string, category: string) => {
    // Special handling for Farm Aid - multiple videos available
    if (entityName === 'Farm Aid' || entityName === 'Farm Aid 1985') {
      return [
        {
          title: 'Farm Aid 1985 Nighttime Set - Tom Petty, Neil Young, Bob Dylan, Willie Nelson',
          videoId: 'H0o2Uyh9w68',
          description: 'Complete nighttime performance featuring major artists closing the historic first Farm Aid concert'
        },
        {
          title: 'Natural High - Merle Haggard at Farm Aid 1985',
          videoId: '-CVZXSl9C9A',
          description: 'Merle Haggard performing "Natural High" - the song that stole the show at Farm Aid 1985'
        }
      ];
    }

    // Bob Dylan videos for Farm Aid performance and other content
    if (entityName === 'Bob Dylan') {
      return [
        {
          title: 'Bob Dylan Full Set at Farm Aid 1985',
          videoId: 'QZbODVff42k',
          description: 'Bob Dylan\'s complete Farm Aid performance featuring classic songs'
        },
        {
          title: 'Bob Dylan - Like a Rolling Stone (Live)',
          videoId: 'IwOfCgkyEj0',
          description: 'Iconic performance of Bob Dylan\'s most famous song'
        }
      ];
    }

    // Multiple videos for Neil Young  
    if (entityName === 'Neil Young') {
      return [
        {
          title: 'Neil Young - Hey Hey, My My (Live at Farm Aid 1985)',
          videoId: 'LQ123T3zD2k', // USER PROVIDED - Authentic Farm Aid 1985 performance
          description: 'Neil Young\'s solo acoustic opening performance at the inaugural Farm Aid concert'
        },
        {
          title: 'Neil Young - Heart of Gold (Live at Farm Aid 1985)',
          videoId: 'pwT1L-FSzEo', // USER PROVIDED - Authentic Farm Aid 1985 performance
          description: 'Neil Young performs his classic hit with The International Harvesters at Farm Aid 1985'
        },
        {
          title: 'Neil Young & Waylon Jennings - Get Back to the Country (Live at Farm Aid 1985)',
          videoId: 'Dv_C9354OXg', // USER PROVIDED - Authentic Farm Aid 1985 duet
          description: 'Historic duet performance at the inaugural Farm Aid concert'
        },
        {
          title: 'Farm Aid 1985 Nighttime Set featuring Neil Young',
          videoId: 'H0o2Uyh9w68', // TESTED - Known working Farm Aid 1985 compilation video
          description: 'Neil Young performs with other Farm Aid artists in the complete nighttime set'
        }
      ];
    }

    // Multiple videos for Willie Nelson
    if (entityName === 'Willie Nelson') {
      return [
        {
          title: 'Farm Aid 1985 Nighttime Set with Willie Nelson Closing',
          videoId: 'H0o2Uyh9w68',
          description: 'Willie Nelson closing the historic first Farm Aid concert'
        }
      ];
    }

    // Multiple videos for Tom Petty
    if (entityName === 'Tom Petty') {
      return [
        {
          title: 'Farm Aid 1985 Nighttime Set featuring Tom Petty',
          videoId: 'H0o2Uyh9w68',
          description: 'Tom Petty & The Heartbreakers at the historic Farm Aid concert'
        }
      ];
    }

    // Multiple videos for The Beach Boys
    if (entityName === 'The Beach Boys' || entityName === 'Beach Boys') {
      return [
        {
          title: 'The Beach Boys - Barbara Ann (Live at Farm Aid 1985)',
          videoId: '-zgcM6gchZo',
          description: 'The Beach Boys perform "Barbara Ann" live at the inaugural Farm Aid concert, Champaign, Illinois'
        }
      ];
    }

    // Multiple videos for Waylon Jennings - Farm Aid content  
    if (entityName === 'Waylon Jennings') {
      return [
        {
          title: 'Neil Young & Waylon Jennings - Get Back to the Country (Live at Farm Aid 1985)',
          videoId: 'Dv_C9354OXg', // USER PROVIDED - Authentic Farm Aid 1985 duet
          description: 'Historic duet performance at the inaugural Farm Aid concert'
        },
        {
          title: 'Farm Aid 1985 Nighttime Set featuring Waylon Jennings',
          videoId: 'H0o2Uyh9w68', // TESTED - Known working Farm Aid 1985 compilation video
          description: 'Waylon Jennings performs at the inaugural Farm Aid concert'
        }
      ];
    }

    // Multiple videos for Dire Straits - corrected to Farm Aid content  
    if (entityName === 'Dire Straits') {
      return [
        {
          title: 'Farm Aid 1985 - Rock Performers Compilation',
          videoId: 'H0o2Uyh9w68',
          description: 'Various rock acts including international performers at Farm Aid 1985'
        }
      ];
    }

    // Multiple videos for Roy Orbison
    if (entityName === 'Roy Orbison') {
      return [
        {
          title: 'Roy Orbison Performance Video 1',
          videoId: 'klalG9fNqVE',
          description: 'Roy Orbison classic performance'
        },
        {
          title: 'Roy Orbison Performance Video 2',
          videoId: '2oP9X7I-DoA',
          description: 'Roy Orbison classic performance'
        }
      ];
    }

    // Multiple videos for Loretta Lynn
    if (entityName === 'Loretta Lynn') {
      return [
        {
          title: 'Loretta Lynn Interview',
          videoId: 'q_ZPzZj4JtQ',
          description: 'Loretta Lynn interview - Coal Miner\'s Daughter legacy'
        },
        {
          title: 'Loretta Lynn Performance 1',
          videoId: 'Vpex7u1NvTs',
          description: 'Loretta Lynn classic performance'
        },
        {
          title: 'Loretta Lynn Performance 2',
          videoId: 'uhSACUY6iC0',
          description: 'Loretta Lynn classic performance'
        },
        {
          title: 'Loretta Lynn Performance 3',
          videoId: 'UEPHsJKz9jM',
          description: 'Loretta Lynn classic performance'
        }
      ];
    }

    return null;
  };

  // Test specific video IDs that user has provided
  const getVevoEmbedUrl = (entityName: string, category: string, mentions: any[]) => {
    if (category !== 'music' && category !== 'person' && category !== 'music festival') return null;
    
    // User-provided working video IDs
    const workingVideoMap: { [key: string]: string } = {
      'Mama Tried': 'loT_pYzi3Vw', // User-provided working video ID
      'Okie From Muskogee': '68cbjlLFl4U', // User-provided working video ID
      'Waiting For A Train': 'gbzc77Tz6PA', // Jimmie Rodgers original version
      'Waiting For A Train (Merle Haggard)': 'Uj5ejHNCQco', // Merle Haggard version
      'House of Memories': 'GpnB7npvgek', // User-provided working video ID
      'Sing Me Back Home': 'u6evsqCwwzc', // User-provided working video ID
      'If We Make It Through December': 'U9TByT3QlWc', // User-provided working video ID
      'Lonesome Fugitive': 'temPS0mHCYA', // User-provided working video ID
      'Swinging Doors': 'zHXispgbb84', // User-provided working video ID
      'Today I Started Loving You Again': '8XqFc_Oxgmg', // User-provided working video ID
      'Working Man Blues': 'fbEstJ98TcM', // User-provided working video ID
      'The Bottle Let Me Down': '2PCL9W54QVw', // User-provided working video ID
      'Branded Man': 'W-ER-yo1V3s', // User-provided working video ID
      'Silver Wings': 'bn_c7k5qMNg', // User-provided working video ID
      'The Way I Am': 'kxnDEd3vlno', // Duet with George Jones - User-provided working video ID
      'He Stopped Loving Her Today': 'NQeayOqR3vY', // George Jones classic - User-provided working video ID
      'The Story Behind \'He Stopped Loving Her Today\'': 'vk4zduDNa_M', // Documentary story - User-provided working video ID
      'George Jones': 'NQeayOqR3vY', // George Jones - showcasing his most famous song
      'House of Memories (Buck Owens Version)': 'vcNj9SX1830', // Buck Owens version - User-provided working video ID
      'Bakersfield Sound': 'zqZxRr3dAZk', // Bakersfield Sound documentary - User-provided working video ID
      'Hungry Eyes': 'FdTMABWpv0c', // Hungry Eyes - User-provided working video ID
      'Big City': 'LkrQMfL9MKg', // Big City - User-provided working video ID
      'Twinkle Twinkle Lucky Star': 'TtmHZwJGUtU', // Twinkle Twinkle Lucky Star - User-provided working video ID
      'Bob Wills and the Texas Playboys': 'eHJPHjb6WN4', // Bob Wills and the Texas Playboys - User-provided working video ID
      'Merle Haggard & Willie Nelson Okie from Muskogee': '5feWCmPYFeM', // Merle & Willie duet - User-provided working video ID
      'Okie from Muskogee Story': '4hxzbE0w2RA', // Story behind the hit song documentary - User-provided working video ID
      'Merle Haggard Johnny Cash San Quentin Story': 'NbovcK1HWfg', // Merle tells story of seeing Johnny Cash at San Quentin - User-provided working video ID
      'Johnny Cash San Quentin 1969 Full Concert': 'PSLsfwTbo4Q', // Johnny Cash live at San Quentin 1969 full video - User-provided working video ID
      'Footlights': 'zdghtsNWXoQ', // Footlights - User-provided working video ID
      'California Cotton Fields': 'IxFso8_cqEs', // California Cotton Fields - User-provided working video ID
      'He Stopped Loving Her Today (Merle Haggard)': 'dQw4w9WgXcQ', // Merle Haggard version - placeholder for user to provide working video ID
      'The Story Of George Jones Full Documentary': 'clxPABW6TqU', // George Jones full documentary - User-provided working video ID
      'Folsom Prison Blues': 'AeZRYhLDLeU', // Folsom Prison Blues - User-provided working video ID
      'Natural High': '-CVZXSl9C9A', // Natural High - Farm Aid 1985 performance - User-provided working video ID
      'Farm Aid 1985 Nighttime Set': 'H0o2Uyh9w68', // Tom Petty, Neil Young, Bob Dylan, Willie Nelson - User-provided working video ID
      'Hey Hey My My (Farm Aid 1985)': 'LQ123T3zD2k', // USER PROVIDED - Neil Young authentic Farm Aid 1985 performance
      'Heart of Gold (Farm Aid 1985)': 'pwT1L-FSzEo', // USER PROVIDED - Neil Young authentic Heart of Gold Farm Aid 1985
      'Neil Young': 'LQ123T3zD2k', // USER PROVIDED - Neil Young Hey Hey My My authentic Farm Aid 1985
      'Sultans Of Swing (Live Aid 1985)': 'JVZTP_kX5BE', // Dire Straits Live Aid performance - User-provided working video ID
      'Farm Aid': 'H0o2Uyh9w68', // Farm Aid 1985 Nighttime Set - User-provided working video ID
      'Farm Aid 1985': 'H0o2Uyh9w68', // Farm Aid 1985 Nighttime Set - User-provided working video ID
      // Additional Farm Aid variations to ensure video shows up
      'Farm Aid Concert': 'H0o2Uyh9w68', // Farm Aid 1985 Nighttime Set - User-provided working video ID
      'Farm Aid Festival': 'H0o2Uyh9w68', // Farm Aid 1985 Nighttime Set - User-provided working video ID
      'My House Of Memories Autobiography': 'PSN8N2v4oq0', // Merle Haggard's autobiography - User-provided working video ID
      'Lefty Frizzell Vocal Style Short 1': 'kEv5fqEoEzw', // Lefty Frizzell vocal demonstration - User-provided working video ID
      'Lefty Frizzell Vocal Style Short 2': 'rXv1sU3JXaM', // Lefty Frizzell vocal technique - User-provided working video ID
      'Country Music Hall of Fame 1994': 'vw3ZFmprDYQ', // Merle Haggard Hall of Fame induction 1994 - User-provided working video ID
      'House of Memories (Merle Haggard Version)': 'xO4BbFQf1H4', // Merle Haggard's House of Memories - User-provided working video ID
      'Arkansas Traveler': 'F4rOelBHAoI', // Arkansas Traveler traditional folk song - User-provided working video ID
      'Bonnie Owens': 'WnppTjgwpO0', // Bonnie Owens performance - User-provided working video ID
      'Johnny Cash & Waylon Jennings - Folsom Prison Blues': 'h-ajiuX7crk', // Farm Aid 1985 duet performance - User-provided working video ID
      'Waylon Jennings': 'h-ajiuX7crk', // Waylon Jennings at Farm Aid 1985 - User-provided working video ID
      'Get Back to the Country': 'Dv_C9354OXg', // USER PROVIDED - Neil Young & Waylon Jennings authentic Farm Aid 1985 duet
      'Neil Young & Waylon Jennings': 'Dv_C9354OXg', // USER PROVIDED - Get Back to the Country authentic Farm Aid 1985 duet
      'Beach Boys': '-zgcM6gchZo', // Beach Boys - Barbara Ann at Farm Aid 1985
      'The Beach Boys': '-zgcM6gchZo', // Beach Boys - Barbara Ann at Farm Aid 1985
      'Barbara Ann': '-zgcM6gchZo', // Beach Boys at Farm Aid 1985
      'Roy Orbison': 'klalG9fNqVE', // Roy Orbison classic performance - User-provided working video ID
      'Loretta Lynn': 'q_ZPzZj4JtQ', // Loretta Lynn interview - User-provided working video ID
    };

    if (workingVideoMap[entityName]) {
      return `https://www.youtube.com/embed/${workingVideoMap[entityName]}?rel=0&modestbranding=1`;
    }

    return null;
  };

  const getYouTubeSearchUrl = (entityName: string, category: string, mentions: any[]) => {
    if (category !== 'music') return null;
    
    const mentionWithArtist = mentions.find(mention => 
      mention.context.toLowerCase().includes('merle haggard') ||
      mention.context.toLowerCase().includes('jimmie rodgers') ||
      mention.context.toLowerCase().includes('hank williams') ||
      mention.context.toLowerCase().includes('lefty frizzell')
    );

    const artist = mentionWithArtist?.context.toLowerCase().includes('jimmie rodgers') ? 'Jimmie Rodgers' : 'Merle Haggard';
    const query = `${entityName} ${artist}`;
    
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  };

  // Check for multiple versions of "Waiting For A Train"
  const getBothVersions = (entityName: string, category: string) => {
    if (category !== 'music' || entityName !== 'Waiting For A Train') return null;
    
    const workingVideoMap: { [key: string]: string } = {
      'Waiting For A Train': 'gbzc77Tz6PA', // Jimmie Rodgers original
      'Waiting For A Train (Merle Haggard)': 'Uj5ejHNCQco', // Merle Haggard version
    };
    
    return [
      {
        title: 'Jimmie Rodgers - Original Version',
        videoId: workingVideoMap['Waiting For A Train'],
        description: 'The original 1928 recording that influenced Merle Haggard'
      },
      {
        title: 'Merle Haggard - Cover Version',
        videoId: workingVideoMap['Waiting For A Train (Merle Haggard)'],
        description: 'Merle Haggard\'s interpretation of the railroad classic'
      }
    ];
  };

  const vevoEmbedUrl = getVevoEmbedUrl(entity.name, entity.category, mentions);
  const youtubeSearchUrl = getYouTubeSearchUrl(entity.name, entity.category, mentions);
  const bothVersions = getBothVersions(entity.name, entity.category);
  const multipleVideos = getMultipleVideos(entity.name, entity.category);
  
  // Use Vevo embed if available, otherwise fallback to search
  const youtubeUrl = vevoEmbedUrl;

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
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getSentimentBadgeColor = (sentiment: string) => {
    const colors = {
      positive: "bg-green-100 text-green-800",
      negative: "bg-red-100 text-red-800",
      neutral: "bg-gray-100 text-gray-800",
      reverential: "bg-purple-100 text-purple-800",
      professional: "bg-blue-100 text-blue-800",
      collaborative: "bg-indigo-100 text-indigo-800",
      nostalgic: "bg-amber-100 text-amber-800",
    };
    return colors[sentiment as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = timestamp % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Find the entity analysis data for importance and sentiment
  // Handle both PodcastAnalysis and BookAnalysis structures safely
  const entityAnalysisArray = analysis?.entityAnalysis || (analysis as any)?.entities || [];
  const entityAnalysis = entityAnalysisArray?.find((ea: any) => (ea.entity?.id || ea.id) === entity?.id);
  const importance = entityAnalysis?.importance || entity.importance || 0;
  const sentiment = entityAnalysis?.sentiment || entity.sentiment || 'neutral';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[80vh] flex flex-col">
        {/* Top Header - Analysis Title - MODAL STARTS HERE */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center mb-2">
                ⚡ Real Merle Haggard Analysis
              </h1>
              <p className="text-sm text-gray-600">
                This is actual UnitedTribes analysis from the uploaded PDF - real entity extraction and contextual navigation
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                console.log('🔗 Close button (X) clicked in EntityDetailModal');
                onClose();
              }}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Entity Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    console.log('🔗 Back button clicked in EntityDetailModal');
                    onBack();
                  }}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{entity.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    className={`${getCategoryBadgeColor(entity.category)} ${onCategoryClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    onClick={onCategoryClick ? () => onCategoryClick(entity.category) : undefined}
                  >
                    {entity.category}
                  </Badge>
                  <Badge className={getSentimentBadgeColor(sentiment)}>
                    {sentiment}
                  </Badge>
                  <span className="text-sm text-gray-500">{importance}% importance</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWikipedia(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <Globe className="h-4 w-4" />
              Wikipedia
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 'calc(80vh - 160px)' }} data-modal-content>
          {/* Entity Description */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              <SmartEntityText 
                text={entity.description || "No description available for this entity."}
                analysis={analysis || { entityAnalysis: [] } as any}
                onEntityClick={onEntityClick}
              />
            </p>
          </div>

          {/* Music/Video Player for Music Entities and Artists */}
          {(entity.category === 'music' || entity.category === 'musician' || entity.category === 'person' || multipleVideos) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Listen</h3>
              {multipleVideos ? (
                <div className="space-y-6">
                  {multipleVideos.map((video, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="text-md font-medium text-gray-800">{video.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                      <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                        {(() => {
                          const videoId = generateVideoId(`multi-${index}`);
                          const isActive = activeVideoId === videoId;
                          return (
                            <>
                              <iframe
                                src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1${isActive ? '&autoplay=1' : ''}`}
                                title={video.title}
                                className="absolute top-0 left-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                              />
                              {!isActive && (
                                <div 
                                  className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-30 hover:bg-opacity-40 transition-all"
                                  onClick={() => handleVideoClick(videoId)}
                                >
                                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : bothVersions ? (
                <div className="space-y-6">
                  {bothVersions.map((version, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="text-md font-medium text-gray-800">{version.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                      <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                        {(() => {
                          const videoId = generateVideoId(`version-${index}`);
                          const isActive = activeVideoId === videoId;
                          return (
                            <>
                              <iframe
                                src={`https://www.youtube.com/embed/${version.videoId}?rel=0&modestbranding=1${isActive ? '&autoplay=1' : ''}`}
                                title={version.title}
                                className="absolute top-0 left-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                              />
                              {!isActive && (
                                <div 
                                  className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-30 hover:bg-opacity-40 transition-all"
                                  onClick={() => handleVideoClick(videoId)}
                                >
                                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : youtubeUrl ? (
                <div className="space-y-2">
                  {entity.name === "The Way I Am" && (
                    <div className="mb-3">
                      <h4 className="text-md font-medium text-gray-800">Merle Haggard & George Jones</h4>
                      <p className="text-sm text-gray-600">Classic duet between two country music legends</p>
                    </div>
                  )}
                  {entity.name === "He Stopped Loving Her Today" && (
                    <div className="mb-3">
                      <h4 className="text-md font-medium text-gray-800">George Jones</h4>
                      <p className="text-sm text-gray-600">Often called the greatest country song ever written</p>
                    </div>
                  )}
                  {entity.name === "The Story Behind 'He Stopped Loving Her Today'" && (
                    <div className="mb-3">
                      <h4 className="text-md font-medium text-gray-800">📖 Behind the Song Documentary</h4>
                      <p className="text-sm text-gray-600">The remarkable story of how this masterpiece was created</p>
                    </div>
                  )}
                  {entity.name === "George Jones" && (
                    <div className="mb-3">
                      <h4 className="text-md font-medium text-gray-800">🎤 Country Music Legend</h4>
                      <p className="text-sm text-gray-600">Featuring "He Stopped Loving Her Today" - his masterpiece</p>
                    </div>
                  )}
                  {entity.name === "Okie From Muskogee" && (
                    <div className="mb-3">
                      <h4 className="text-md font-medium text-gray-800">🎵 Merle Haggard's Anthem</h4>
                      <p className="text-sm text-gray-600">The cultural touchstone that defined American working-class values</p>
                    </div>
                  )}
                  {entity.name === "Bakersfield Sound" && (
                    <div className="mb-3">
                      <h4 className="text-md font-medium text-gray-800">🎵 Revolutionary Musical Movement</h4>
                      <p className="text-sm text-gray-600">The raw, authentic country sound that challenged Nashville's dominance</p>
                    </div>
                  )}
                  <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                    {(() => {
                      const videoId = generateVideoId('main');
                      const isActive = activeVideoId === videoId;
                      return (
                        <>
                          <iframe
                            src={`${youtubeUrl}${isActive ? (youtubeUrl.includes('?') ? '&autoplay=1' : '?autoplay=1') : ''}`}
                            title={`${entity.name} - Official Music Video`}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                          {!isActive && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-30 hover:bg-opacity-40 transition-all"
                              onClick={() => handleVideoClick(videoId)}
                            >
                              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg text-center shadow-sm">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-1">"{entity.name}"</h4>
                    <p className="text-gray-600">Featured in the Merle Haggard interview</p>
                  </div>
                  <a 
                    href={youtubeSearchUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Listen on YouTube
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Bakersfield Sound Video Resources */}
          {entity.name === "Bakersfield Sound" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Documentary Resources</h3>
              
              {/* Ken Burns Country Music Documentary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">📺 Ken Burns Country Music: The Bakersfield Sound</h4>
                  <p className="text-sm text-gray-600 mt-1">Comprehensive PBS documentary coverage featuring Buck Owens and Merle Haggard</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  {(() => {
                    const videoId = generateVideoId('ken-burns');
                    const isActive = activeVideoId === videoId;
                    return (
                      <>
                        <iframe
                          src={`https://www.youtube.com/embed/zqZxRr3dAZk?rel=0&modestbranding=1${isActive ? '&autoplay=1' : ''}`}
                          title="Ken Burns Country Music: The Bakersfield Sound"
                          className="absolute top-0 left-0 w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                        {!isActive && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-30 hover:bg-opacity-40 transition-all"
                            onClick={() => handleVideoClick(videoId)}
                          >
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Merle Haggard and The Strangers Interview */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎤 Merle Haggard and the Strangers Interview</h4>
                  <p className="text-sm text-gray-600 mt-1">Merle Haggard joins Norm Hamlet and Don Markham, longtime Strangers members, discussing the band's role in creating the Bakersfield Sound (2012)</p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <a 
                    href="https://watch.countrymusichalloffame.org/the-bakersfield-sound-buck-owens-merle-haggard-and-california-country/videos/merle-haggard-and-the-strangers-interview-the-bakersfield-sound"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Interview (1h 23m)
                  </a>
                </div>
              </div>

              {/* Country Music Hall of Fame */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🏛️ Country Music Hall of Fame Exhibition</h4>
                  <p className="text-sm text-gray-600 mt-1">Museum exhibition exploring the raw, electric sound that challenged Nashville's dominance</p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <a 
                    href="https://watch.countrymusichalloffame.org/the-bakersfield-sound-buck-owens-merle-haggard-and-california-country"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Watch on Hall of Fame
                  </a>
                  <a 
                    href="https://www.pbs.org/kenburns/country-music/bakersfield-sound-branches-of-country-music"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    PBS Documentary
                  </a>
                </div>
              </div>

              {/* Treble & Twang Documentary Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎬 "Treble & Twang" (2021)</h4>
                  <p className="text-sm text-gray-600 mt-1">Independent documentary exploring the pioneers who created the foundation of the Bakersfield Sound, featuring nearly 70 musicians and family members</p>
                  <p className="text-xs text-gray-500 mt-2">Created by filmmakers Chuck and Tammie Barbee</p>
                </div>
                <div className="bg-green-100 border border-green-300 rounded p-3">
                  <p className="text-sm text-green-800">This documentary goes beyond Buck Owens and Merle Haggard to explore lesser-known pioneers like Oscar Whittington, Billy Mize, Cousin Herb Henson, and Bill Woods who shaped the sound.</p>
                </div>
              </div>
            </div>
          )}

          {/* The Strangers Video Resources */}
          {entity.name === "The Strangers" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Documentary Interview</h3>
              
              {/* Merle Haggard and The Strangers Interview */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎤 Merle Haggard and the Strangers Interview</h4>
                  <p className="text-sm text-gray-600 mt-1">Merle Haggard joins Norm Hamlet and Don Markham, longtime Strangers members, for a 2012 program at the Country Music Hall of Fame discussing their role in creating the Bakersfield Sound</p>
                  <p className="text-xs text-gray-500 mt-2">Features stories about steel guitarist Norm Hamlet (bandleader for 45+ years) and horn player Don Markham, plus insights into their unique guitar sound inspired by Ernest Tubb and Fender Telecasters</p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <a 
                    href="https://watch.countrymusichalloffame.org/the-bakersfield-sound-buck-owens-merle-haggard-and-california-country/videos/merle-haggard-and-the-strangers-interview-the-bakersfield-sound"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Full Interview (1h 23m)
                  </a>
                </div>
              </div>

              {/* Band Achievement Highlight */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🏆 "Hottest Band Around"</h4>
                  <p className="text-sm text-gray-600 mt-1">Six-time winners of the Academy of Country Music's "Band of the Year" award</p>
                </div>
                <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                  <p className="text-sm text-yellow-800">The Strangers earned their reputation through their distinct sound and ace musicianship, featuring Roy Nichols on guitar, Norm Hamlet on steel guitar, and Don Markham on horn.</p>
                </div>
              </div>
            </div>
          )}

          {/* Generic Video Resources */}
          {entity.videoResources && entity.videoResources.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Video Resources</h3>
              {entity.videoResources.map((video: any, index: number) => {
                const videoId = generateVideoId(`video-${entity.id}-${index}`);
                const isActive = activeVideoId === videoId;
                
                return (
                  <div key={`video-${entity.id}-${index}`} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900">🎥 {video.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                      {video.duration && (
                        <p className="text-xs text-gray-500 mt-1">Duration: {video.duration}</p>
                      )}
                    </div>
                    
                    <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                      {!isActive ? (
                        <div 
                          className="absolute inset-0 cursor-pointer group"
                          onClick={() => handleVideoClick(videoId)}
                        >
                          {video.thumbnail && (
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="absolute inset-0 w-full h-full object-cover"

                            />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                            <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:bg-opacity-100 transition-opacity shadow-lg">
                              <Play className="w-12 h-12 text-gray-800" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <iframe
                          src={`https://www.youtube.com/embed/${video.url.split('/').pop()}?rel=0&modestbranding=1&autoplay=1`}
                          title={video.title}
                          className="absolute top-0 left-0 w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{mentions.length}</div>
              <div className="text-sm text-gray-600">Total Mentions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{importance}%</div>
              <div className="text-sm text-gray-600">Importance</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary capitalize">{sentiment}</div>
              <div className="text-sm text-gray-600">Sentiment</div>
            </div>
          </div>

          {/* Related Content Section */}
          {entity.name === "Buck Owens" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Performances</h3>
              
              {/* Buck Owens Version */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎸 House of Memories (Buck Owens Version)</h4>
                  <p className="text-sm text-gray-600 mt-1">Buck Owens' interpretation showcasing the Bakersfield sound</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/vcNj9SX1830?rel=0&modestbranding=1`}
                    title="House of Memories - Buck Owens Version"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Merle Haggard Version */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎤 House of Memories (Merle Haggard Version)</h4>
                  <p className="text-sm text-gray-600 mt-1">Merle Haggard's signature song and autobiography title track</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/xO4BbFQf1H4?rel=0&modestbranding=1`}
                    title="House of Memories - Merle Haggard"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {entity.name === "House of Memories" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Complete Heritage</h3>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">📖 Merle's "My House Of Memories" Autobiography</h4>
                  <p className="text-sm text-gray-600 mt-1">Merle Haggard reads from his personal autobiography sharing life stories and memories</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/PSN8N2v4oq0?rel=0&modestbranding=1`}
                    title="Merle Haggard's My House Of Memories Autobiography"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎸 Buck Owens Version</h4>
                  <p className="text-sm text-gray-600 mt-1">Buck Owens' interpretation showcasing the Bakersfield sound connection</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/vcNj9SX1830?rel=0&modestbranding=1`}
                    title="House of Memories - Buck Owens Version"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {entity.name === "Okie From Muskogee" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cross-Artist Collaboration</h3>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎤 Merle Haggard & Willie Nelson Duet</h4>
                  <p className="text-sm text-gray-600 mt-1">Two country legends performing together - showcasing the song's enduring cultural impact</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/5feWCmPYFeM?rel=0&modestbranding=1`}
                    title="Merle Haggard & Willie Nelson - Okie from Muskogee"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              
              {/* Documentary Section */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 mt-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">📖 The Story Behind "Okie from Muskogee"</h4>
                  <p className="text-sm text-gray-600 mt-1">Documentary exploring how this cultural anthem was created and its lasting impact</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/4hxzbE0w2RA?rel=0&modestbranding=1`}
                    title="Okie from Muskogee - Story behind the hit song"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {entity.name === "Waiting For A Train (Merle Haggard)" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Musical Heritage</h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🚂 Original by Jimmie Rodgers</h4>
                  <p className="text-sm text-gray-600 mt-1">The original railroad classic that inspired Merle Haggard's interpretation</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/bY9pRNWOtmk?rel=0&modestbranding=1`}
                    title="Waiting For A Train - Jimmie Rodgers Original"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {entity.name === "Bob Wills and the Texas Playboys" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Western Swing Legends</h3>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎻 Western Swing Performance</h4>
                  <p className="text-sm text-gray-600 mt-1">Bob Wills and the Texas Playboys pioneering the Western swing sound that influenced country music</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/eHJPHjb6WN4?rel=0&modestbranding=1`}
                    title="Bob Wills and the Texas Playboys"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {entity.name === "Willie Nelson" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cross-Artist Collaboration</h3>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎤 Willie Nelson & Merle Haggard - "Okie from Muskogee"</h4>
                  <p className="text-sm text-gray-600 mt-1">Two outlaw country legends performing Merle's cultural anthem together</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/5feWCmPYFeM?rel=0&modestbranding=1`}
                    title="Willie Nelson & Merle Haggard - Okie from Muskogee"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {entity.name === "San Quentin State Prison" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Stories</h3>
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎭 Merle Haggard's Johnny Cash Story</h4>
                  <p className="text-sm text-gray-600 mt-1">Merle tells the story of seeing Johnny Cash perform while he was imprisoned at San Quentin</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/NbovcK1HWfg?rel=0&modestbranding=1`}
                    title="Merle Haggard tells Johnny Cash San Quentin story"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              
              {/* Full Concert Section */}
              <div className="bg-gradient-to-r from-black to-gray-800 border border-gray-300 rounded-lg p-4 mt-4">
                <div className="mb-4">
                  <h4 className="font-medium text-white">🎬 Johnny Cash Live at San Quentin 1969 - Full Concert</h4>
                  <p className="text-sm text-gray-300 mt-1">The complete historic performance that Merle Haggard witnessed as a prisoner</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/PSLsfwTbo4Q?rel=0&modestbranding=1`}
                    title="Johnny Cash live at San Quentin 1969 full concert"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              
              {/* Folsom Prison Blues Section */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mt-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎵 Folsom Prison Blues</h4>
                  <p className="text-sm text-gray-600 mt-1">Johnny Cash's iconic prison song that established his connection to the incarcerated</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/AeZRYhLDLeU?rel=0&modestbranding=1`}
                    title="Folsom Prison Blues"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {entity.name === "Johnny Cash" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Historic San Quentin Performance</h3>
              <div className="bg-gradient-to-r from-black to-gray-800 border border-gray-300 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-white">🎬 Johnny Cash Live at San Quentin 1969 - Full Concert</h4>
                  <p className="text-sm text-gray-300 mt-1">The complete historic performance that Merle Haggard witnessed as a prisoner</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/PSLsfwTbo4Q?rel=0&modestbranding=1`}
                    title="Johnny Cash live at San Quentin 1969 full concert"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎵 Folsom Prison Blues</h4>
                  <p className="text-sm text-gray-600 mt-1">Johnny Cash's iconic prison song that established his connection to the incarcerated</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/AeZRYhLDLeU?rel=0&modestbranding=1`}
                    title="Folsom Prison Blues"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Connection to Merle Haggard</h3>
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🏛️ Merle's Personal Account</h4>
                  <p className="text-sm text-gray-600 mt-1">Merle Haggard tells the story of witnessing this historic performance while imprisoned at San Quentin</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/NbovcK1HWfg?rel=0&modestbranding=1`}
                    title="Merle Haggard tells Johnny Cash San Quentin story"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {entity.name === "George Jones" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Complete Biography</h3>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">📺 The Story Of George Jones | Full Documentary</h4>
                  <p className="text-sm text-gray-600 mt-1">Complete biographical documentary covering the life and career of the country music legend</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/clxPABW6TqU?rel=0&modestbranding=1`}
                    title="The Story Of George Jones Full Documentary"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cross-Artist Interpretations</h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎵 Merle Haggard's Version</h4>
                  <p className="text-sm text-gray-600 mt-1">Merle Haggard's interpretation of George Jones' masterpiece</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Merle Haggard version available - shows how this classic song transcends individual artists</p>
                </div>
              </div>
            </div>
          )}
          {entity.name === "He Stopped Loving Her Today" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Content</h3>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">📖 The Story Behind This Song</h4>
                  <p className="text-sm text-gray-600 mt-1">Discover how this masterpiece was created</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/vk4zduDNa_M?rel=0&modestbranding=1`}
                    title="The Story Behind 'He Stopped Loving Her Today'"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {(entity.name === "Lefty Frizzell" || entity.name === "Vocal Style from Lefty Frizzell") && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Vocal Technique Demonstrations</h3>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎤 Lefty Frizzell Vocal Style Demonstration</h4>
                  <p className="text-sm text-gray-600 mt-1">How Lefty Frizzell's unique vocal approach shaped Merle Haggard's singing style</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/kEv5fqEoEzw?rel=0&modestbranding=1`}
                    title="Lefty Frizzell Vocal Style Demonstration"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎵 Lefty Frizzell Vocal Technique Analysis</h4>
                  <p className="text-sm text-gray-600 mt-1">Deep dive into the vocal techniques that influenced generations of country singers</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/rXv1sU3JXaM?rel=0&modestbranding=1`}
                    title="Lefty Frizzell Vocal Technique Analysis"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {entity.name === "Country Music Hall of Fame" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1994 Induction Ceremony</h3>
              <div className="bg-gradient-to-r from-gold-50 to-yellow-50 border border-yellow-300 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🏛️ Merle Haggard's Hall of Fame Induction</h4>
                  <p className="text-sm text-gray-600 mt-1">Merle Haggard's historic 1994 induction into the Country Music Hall of Fame</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/vw3ZFmprDYQ?rel=0&modestbranding=1`}
                    title="Merle Haggard Hall of Fame Induction 1994"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {(entity.name === "My House of Memories" || entity.category === "media") && entity.name.includes("House of Memories") && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">HarperCollins Audiobook</h3>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">📚 "My House Of Memories" Autobiography</h4>
                  <p className="text-sm text-gray-600 mt-1">Merle Haggard reads from his HarperCollins autobiography, sharing personal life stories and memories</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/PSN8N2v4oq0?rel=0&modestbranding=1`}
                    title="Merle Haggard's My House Of Memories Autobiography"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          {entity.name === "The Strangers" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">The Legendary Backing Band</h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎸 The Strangers - Live Performance</h4>
                  <p className="text-sm text-gray-600 mt-1">Merle Haggard's legendary backing band that helped define the Bakersfield sound with their distinctive Telecaster guitars and steel guitar arrangements</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/cZp77judvq0?rel=0&modestbranding=1`}
                    title="The Strangers - Merle Haggard's Backing Band"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <h5 className="font-medium text-gray-900 mb-2">Related Documentation & Entities</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🎵</span>
                      <span className="text-gray-700">Connected to: 
                        <button 
                          onClick={() => handleEntityClick({ name: "Bakersfield Sound", category: "musical" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Bakersfield Sound
                        </button> movement and musical style
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🎸</span>
                      <span className="text-gray-700">Related musicians: 
                        <button 
                          onClick={() => handleEntityClick({ name: "Buck Owens", category: "musician" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Buck Owens
                        </button>, 
                        <button 
                          onClick={() => handleEntityClick({ name: "Tommy Collins", category: "musician" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Tommy Collins
                        </button>, 
                        <button 
                          onClick={() => handleEntityClick({ name: "Wynn Stewart", category: "musician" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Wynn Stewart
                        </button>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">📍</span>
                      <span className="text-gray-700">Geographic context: 
                        <button 
                          onClick={() => handleEntityClick({ name: "California honky-tonks", category: "location" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          California honky-tonks
                        </button>, 
                        <button 
                          onClick={() => handleEntityClick({ name: "Bakersfield", category: "location" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Bakersfield
                        </button> music scene
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">🎼</span>
                      <span className="text-gray-700">Instrumental in recordings: 
                        <button 
                          onClick={() => handleEntityClick({ name: "Mama Tried", category: "music" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Mama Tried
                        </button>, 
                        <button 
                          onClick={() => handleEntityClick({ name: "Okie From Muskogee", category: "music" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Okie From Muskogee
                        </button>, 
                        <button 
                          onClick={() => handleEntityClick({ name: "Silver Wings", category: "music" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Silver Wings
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {entity.name === "Arkansas Traveler" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Traditional American Folk Heritage</h3>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎻 Arkansas Traveler - Traditional Folk Song</h4>
                  <p className="text-sm text-gray-600 mt-1">A foundational piece of American folk music that influenced generations of country artists including Merle Haggard, representing the storytelling tradition at the heart of country music</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/F4rOelBHAoI?rel=0&modestbranding=1`}
                    title="Arkansas Traveler - Traditional American Folk Song"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <h5 className="font-medium text-gray-900 mb-2">Related Documentation & Musical Heritage</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600">🎵</span>
                      <span className="text-gray-700">Musical tradition: 
                        <button 
                          onClick={() => handleEntityClick({ name: "Traditional Folk Music", category: "musical" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Traditional Folk Music
                        </button> and American storytelling heritage
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🎸</span>
                      <span className="text-gray-700">Influenced artists: 
                        <button 
                          onClick={() => handleEntityClick({ name: "Jimmie Rodgers", category: "musician" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Jimmie Rodgers
                        </button>, 
                        <button 
                          onClick={() => handleEntityClick({ name: "Hank Williams", category: "musician" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Hank Williams
                        </button>, 
                        <button 
                          onClick={() => handleEntityClick({ name: "Merle Haggard", category: "musician" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Merle Haggard
                        </button>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">📍</span>
                      <span className="text-gray-700">Cultural heritage: 
                        <button 
                          onClick={() => handleEntityClick({ name: "Appalachian Music", category: "musical" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Appalachian Music
                        </button>, 
                        <button 
                          onClick={() => handleEntityClick({ name: "American Folk Tradition", category: "cultural" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          American Folk Tradition
                        </button>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">🎼</span>
                      <span className="text-gray-700">Connected songs: 
                        <button 
                          onClick={() => handleEntityClick({ name: "Waiting For A Train", category: "music" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Waiting For A Train
                        </button>, 
                        <button 
                          onClick={() => handleEntityClick({ name: "House of Memories", category: "music" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          House of Memories
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {entity.name === "Bonnie Owens" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bakersfield Music Bridge</h3>
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎤 Bonnie Owens - Country Music Performance</h4>
                  <p className="text-sm text-gray-600 mt-1">The remarkable country singer who connected Buck Owens and Merle Haggard both personally and musically, serving as a crucial bridge in the Bakersfield sound movement</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/WnppTjgwpO0?rel=0&modestbranding=1`}
                    title="Bonnie Owens - Country Music Performance"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-rose-200">
                  <h5 className="font-medium text-gray-900 mb-2">Musical Connections & Personal History</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600">💕</span>
                      <span className="text-gray-700">Personal connections: Former wife of 
                        <button 
                          onClick={() => handleEntityClick({ name: "Buck Owens", category: "musician" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Buck Owens
                        </button> and 
                        <button 
                          onClick={() => handleEntityClick({ name: "Merle Haggard", category: "musician" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Merle Haggard
                        </button>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🎵</span>
                      <span className="text-gray-700">Musical legacy: Key figure in 
                        <button 
                          onClick={() => handleEntityClick({ name: "Bakersfield Sound", category: "musical" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Bakersfield Sound
                        </button> movement and country music history
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">📍</span>
                      <span className="text-gray-700">Geographic context: 
                        <button 
                          onClick={() => handleEntityClick({ name: "Bakersfield", category: "location" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          Bakersfield
                        </button> music scene and 
                        <button 
                          onClick={() => handleEntityClick({ name: "California honky-tonks", category: "location" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          California honky-tonks
                        </button>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">🎸</span>
                      <span className="text-gray-700">Musical partnerships: Collaborated with 
                        <button 
                          onClick={() => handleEntityClick({ name: "The Strangers", category: "musician" })}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                        >
                          The Strangers
                        </button> and influenced the sound of classic recordings
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tom Petty - Rock Legend & Farm Aid Pioneer */}
          {entity.name === "Tom Petty" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Rock Legend & Farm Aid Pioneer</h3>
              
              {/* Featured Farm Aid Performance */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎸 Tom Petty & The Heartbreakers - Farm Aid 1985</h4>
                  <p className="text-sm text-gray-600 mt-1">Historic performance at the first Farm Aid concert featuring "Refugee" and showcasing rock's support for American farmers</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src="https://www.youtube.com/embed/vKQ8_yUiIMc?rel=0&modestbranding=1"
                    title="Tom Petty and the Heartbreakers - Refugee (Live at Farm Aid 1985)"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>


              {/* Cross-Media Discovery & Cultural Context */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎵 Farm Aid & Cultural Impact</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🚜</span>
                    <span className="text-gray-700">Historic support: Featured performer at the inaugural 
                      <button 
                        onClick={() => handleEntityClick({ name: "Farm Aid", category: "music festival" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Farm Aid 1985
                      </button> concert supporting American farmers
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🎸</span>
                    <span className="text-gray-700">Cross-genre collaboration: Rock artist alongside 
                      <button 
                        onClick={() => handleEntityClick({ name: "Willie Nelson", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Willie Nelson
                      </button>, 
                      <button 
                        onClick={() => handleEntityClick({ name: "Bob Dylan", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Bob Dylan
                      </button>, and 
                      <button 
                        onClick={() => handleEntityClick({ name: "Neil Young", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Neil Young
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600">⚡</span>
                    <span className="text-gray-700">Musical legacy: "Refugee" became Farm Aid anthem bridging rock and country audiences</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">📺</span>
                    <span className="text-gray-700">Cultural significance: Demonstrated rock music's solidarity with rural America during farm crisis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600">🤝</span>
                    <span className="text-gray-700">Transcript connection: Mentioned alongside 
                      <button 
                        onClick={() => handleEntityClick({ name: "Merle Haggard", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Merle Haggard
                      </button> as Farm Aid featured performer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waylon Jennings - Outlaw Country Legend */}
          {entity.name === "Waylon Jennings" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Outlaw Country Pioneer</h3>
              
              {/* Featured Farm Aid Performance */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🤠 Folsom Prison Blues with Johnny Cash - Farm Aid 1985</h4>
                  <p className="text-sm text-gray-600 mt-1">Two outlaw country legends performing the ultimate prison song at the historic Farm Aid concert</p>
                </div>
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src="https://www.youtube.com/embed/h-ajiuX7crk?rel=0&modestbranding=1"
                    title="Johnny Cash & Waylon Jennings - Folsom Prison Blues at Farm Aid 1985"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Cross-Media Discovery & Musical Context */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎸 Outlaw Country Connections</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600">🤝</span>
                    <span className="text-gray-700">Outlaw movement pioneer alongside 
                      <button 
                        onClick={() => handleEntityClick({ name: "Willie Nelson", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Willie Nelson
                      </button>, 
                      <button 
                        onClick={() => handleEntityClick({ name: "Johnny Cash", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Johnny Cash
                      </button>, and 
                      <button 
                        onClick={() => handleEntityClick({ name: "Merle Haggard", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Merle Haggard
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">🎵</span>
                    <span className="text-gray-700">Musical rebellion: Challenged Nashville establishment with authentic country sound</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🚜</span>
                    <span className="text-gray-700">Farm Aid legacy: Co-founder of benefit concerts supporting American farmers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">⚡</span>
                    <span className="text-gray-700">Prison themes: Like 
                      <button 
                        onClick={() => handleEntityClick({ name: "Folsom Prison Blues", category: "music" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Folsom Prison Blues
                      </button>, connected outlaw music to real experience
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🎤</span>
                    <span className="text-gray-700">Cross-generational influence: From honky-tonk to modern country and rock</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bob Dylan - Folk Legend at Farm Aid */}
          {entity.name === "Bob Dylan" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Folk Legend & Farm Aid Performer</h3>
              
              {/* Multiple videos handled by getMultipleVideos function */}

              {/* Cross-Media Discovery & Cultural Context */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎸 Folk Rock Legacy</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🚜</span>
                    <span className="text-gray-700">Farm Aid support: Performed full set at the inaugural 
                      <button 
                        onClick={() => handleEntityClick({ name: "Farm Aid", category: "music festival" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Farm Aid 1985
                      </button> concert supporting American farmers
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🎤</span>
                    <span className="text-gray-700">Collaborative performance: Joined 
                      <button 
                        onClick={() => handleEntityClick({ name: "Willie Nelson", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Willie Nelson
                      </button>, 
                      <button 
                        onClick={() => handleEntityClick({ name: "Tom Petty", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Tom Petty
                      </button>, and 
                      <button 
                        onClick={() => handleEntityClick({ name: "Neil Young", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Neil Young
                      </button> in the historic nighttime finale
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">🏆</span>
                    <span className="text-gray-700">Musical influence: Nobel Prize winner whose folk activism helped bridge genres at Farm Aid</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Farm Aid 1985 - Complete Artist Showcase */}
          {(entity.name === "Farm Aid" || entity.name === "Farm Aid 1985") && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Historic Farm Aid 1985 Concert</h3>
              

              {/* Farm Aid 1985 Historical Context */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🚜 Farm Aid 1985 Historical Context</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">🌾</span>
                    <span className="text-gray-700">Purpose: Supporting American farmers during the 1980s farm crisis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">📍</span>
                    <span className="text-gray-700">Location: Memorial Stadium, 
                      <button 
                        onClick={() => handleEntityClick({ name: "Champaign", category: "location" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Champaign
                      </button>, Illinois (September 22, 1985)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🎤</span>
                    <span className="text-gray-700">Organizers: 
                      <button 
                        onClick={() => handleEntityClick({ name: "Willie Nelson", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Willie Nelson
                      </button>, 
                      <button 
                        onClick={() => handleEntityClick({ name: "Neil Young", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Neil Young
                      </button>, and 
                      <button 
                        onClick={() => handleEntityClick({ name: "John Mellencamp", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        John Mellencamp
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">📺</span>
                    <span className="text-gray-700">Media impact: Nationwide broadcast raised $9 million for family farmers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">⭐</span>
                    <span className="text-gray-700">Standout moment: 
                      <button 
                        onClick={() => handleEntityClick({ name: "Merle Haggard", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Merle Haggard
                      </button>'s 
                      <button 
                        onClick={() => handleEntityClick({ name: "Natural High", category: "music" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        "Natural High"
                      </button> performance became concert legend
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600">🎵</span>
                    <span className="text-gray-700">Musical legacy: Bridged country, rock, folk, and blues for rural America</span>
                  </div>
                </div>
              </div>

              {/* Interactive Artist Catalog */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎸 Explore Farm Aid 1985 Artists</h4>
                  <p className="text-sm text-gray-600 mt-1">Click any artist to explore their performances and cross-media connections</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <button 
                    onClick={() => handleEntityClick({ name: "Merle Haggard", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    <div className="font-medium text-green-600">🚜 Merle Haggard</div>
                    <div className="text-gray-600 text-xs">Stole the show with "Natural High"</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Willie Nelson", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-blue-600">🎤 Willie Nelson</div>
                    <div className="text-gray-600 text-xs">Farm Aid founder & headliner</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Bob Dylan", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  >
                    <div className="font-medium text-purple-600">🎵 Bob Dylan</div>
                    <div className="text-gray-600 text-xs">Folk legend & complete set</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Neil Young", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-amber-50 hover:border-amber-300 transition-colors"
                  >
                    <div className="font-medium text-amber-600">🎸 Neil Young</div>
                    <div className="text-gray-600 text-xs">Rock icon & farm advocate</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Tom Petty", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-rose-50 hover:border-rose-300 transition-colors"
                  >
                    <div className="font-medium text-rose-600">🎤 Tom Petty</div>
                    <div className="text-gray-600 text-xs">Heartbreakers frontman</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Johnny Cash", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <div className="font-medium text-gray-600">⚫ Johnny Cash</div>
                    <div className="text-gray-600 text-xs">Folsom Prison Blues w/ Waylon</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Waylon Jennings", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-orange-50 hover:border-orange-300 transition-colors"
                  >
                    <div className="font-medium text-orange-600">🤠 Waylon Jennings</div>
                    <div className="text-gray-600 text-xs">Outlaw country legend</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Loretta Lynn", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-pink-50 hover:border-pink-300 transition-colors"
                  >
                    <div className="font-medium text-pink-600">👑 Loretta Lynn</div>
                    <div className="text-gray-600 text-xs">Coal Miner's Daughter</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Roy Orbison", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  >
                    <div className="font-medium text-indigo-600">🕶️ Roy Orbison</div>
                    <div className="text-gray-600 text-xs">Big O rock legend</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "B.B. King", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-cyan-50 hover:border-cyan-300 transition-colors"
                  >
                    <div className="font-medium text-cyan-600">🎺 B.B. King</div>
                    <div className="text-gray-600 text-xs">Blues guitar master</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Dire Straits", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-orange-50 hover:border-orange-300 transition-colors"
                  >
                    <div className="font-medium text-orange-600">🎸 Dire Straits</div>
                    <div className="text-gray-600 text-xs">Sultans of Swing</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Joni Mitchell", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-teal-50 hover:border-teal-300 transition-colors"
                  >
                    <div className="font-medium text-teal-600">🎶 Joni Mitchell</div>
                    <div className="text-gray-600 text-xs">Folk poetry legend</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "The Beach Boys", category: "musician" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-sky-50 hover:border-sky-300 transition-colors"
                  >
                    <div className="font-medium text-sky-600">🏄 The Beach Boys</div>
                    <div className="text-gray-600 text-xs">California harmony</div>
                  </button>
                </div>
              </div>


            </div>
          )}
          
          {/* Merle Haggard - Key Performances & Cross-Media Discovery */}
          {entity.name === "Merle Haggard" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Featured Performances</h3>
              


              {/* Cross-Media Discovery Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎵 Explore Merle's Complete Song Catalog</h4>
                  <p className="text-sm text-gray-600 mt-1">Click any song mentioned in the interview to watch performances and discover related content</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <button 
                    onClick={() => handleEntityClick({ name: "Mama Tried", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-blue-600">🎭 Mama Tried</div>
                    <div className="text-gray-600 text-xs">Autobiographical prison song</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Okie From Muskogee", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-amber-50 hover:border-amber-300 transition-colors"
                  >
                    <div className="font-medium text-amber-600">🎸 Okie From Muskogee</div>
                    <div className="text-gray-600 text-xs">Controversial anthem</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Today I Started Loving You Again", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-rose-50 hover:border-rose-300 transition-colors"
                  >
                    <div className="font-medium text-rose-600">❤️ Today I Started Loving You</div>
                    <div className="text-gray-600 text-xs">Tender love ballad</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "The Bottle Let Me Down", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  >
                    <div className="font-medium text-purple-600">🍺 The Bottle Let Me Down</div>
                    <div className="text-gray-600 text-xs">Honky-tonk classic</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Waiting For A Train", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
                  >
                    <div className="font-medium text-yellow-600">🚂 Waiting For A Train</div>
                    <div className="text-gray-600 text-xs">Jimmie Rodgers tribute</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "House of Memories", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    <div className="font-medium text-green-600">🏠 House of Memories</div>
                    <div className="text-gray-600 text-xs">Signature song + audiobook</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Sing Me Back Home", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <div className="font-medium text-gray-600">🎭 Sing Me Back Home</div>
                    <div className="text-gray-600 text-xs">Prison-inspired ballad</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "If We Make It Through December", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-cyan-50 hover:border-cyan-300 transition-colors"
                  >
                    <div className="font-medium text-cyan-600">❄️ If We Make It Through December</div>
                    <div className="text-gray-600 text-xs">Working-class anthem</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Lonesome Fugitive", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    <div className="font-medium text-slate-600">🏃 Lonesome Fugitive</div>
                    <div className="text-gray-600 text-xs">Outlaw anthem</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Swinging Doors", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-orange-50 hover:border-orange-300 transition-colors"
                  >
                    <div className="font-medium text-orange-600">🍻 Swinging Doors</div>
                    <div className="text-gray-600 text-xs">Honky-tonk barroom life</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Working Man Blues", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                  >
                    <div className="font-medium text-indigo-600">💼 Working Man Blues</div>
                    <div className="text-gray-600 text-xs">Blue-collar celebration</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Branded Man", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <div className="font-medium text-red-600">🏷️ Branded Man</div>
                    <div className="text-gray-600 text-xs">Ex-convict stigma</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Silver Wings", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-blue-600">✈️ Silver Wings</div>
                    <div className="text-gray-600 text-xs">Melancholy departure</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Hungry Eyes", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-teal-50 hover:border-teal-300 transition-colors"
                  >
                    <div className="font-medium text-teal-600">👀 Hungry Eyes</div>
                    <div className="text-gray-600 text-xs">Depression-era hardship</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Big City", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                  >
                    <div className="font-medium text-emerald-600">🏙️ Big City</div>
                    <div className="text-gray-600 text-xs">Urban vs rural life</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Twinkle Twinkle Lucky Star", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-pink-50 hover:border-pink-300 transition-colors"
                  >
                    <div className="font-medium text-pink-600">⭐ Twinkle Twinkle Lucky Star</div>
                    <div className="text-gray-600 text-xs">Heartbreak classic</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Footlights", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-violet-50 hover:border-violet-300 transition-colors"
                  >
                    <div className="font-medium text-violet-600">🎭 Footlights</div>
                    <div className="text-gray-600 text-xs">Show business life</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "California Cotton Fields", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-lime-50 hover:border-lime-300 transition-colors"
                  >
                    <div className="font-medium text-lime-600">🌾 California Cotton Fields</div>
                    <div className="text-gray-600 text-xs">Migrant worker experience</div>
                  </button>
                  <button 
                    onClick={() => handleEntityClick({ name: "Folsom Prison Blues", category: "music" })}
                    className="text-left p-3 bg-white rounded-lg border hover:bg-stone-50 hover:border-stone-300 transition-colors"
                  >
                    <div className="font-medium text-stone-600">⛓️ Folsom Prison Blues</div>
                    <div className="text-gray-600 text-xs">Johnny Cash classic</div>
                  </button>
                </div>
              </div>

              {/* Musical Legacy & Cross-Media Connections */}
              <div className="bg-gradient-to-r from-gold-50 to-yellow-50 border border-yellow-300 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">🎖️ Musical Legacy & Cross-Media Connections</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">🏛️</span>
                    <span className="text-gray-700">Honors: 
                      <button 
                        onClick={() => handleEntityClick({ name: "Country Music Hall of Fame", category: "institution" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Country Music Hall of Fame
                      </button> (1994), Kennedy Center Honor (2010)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🎵</span>
                    <span className="text-gray-700">Musical style: 
                      <button 
                        onClick={() => handleEntityClick({ name: "Bakersfield Sound", category: "music genre" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Bakersfield Sound
                      </button>, 
                      <button 
                        onClick={() => handleEntityClick({ name: "Outlaw Country", category: "music genre" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Outlaw Country
                      </button>, 
                      <button 
                        onClick={() => handleEntityClick({ name: "Ballads", category: "music genre" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Ballads
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🚜</span>
                    <span className="text-gray-700">Historic performances: 
                      <button 
                        onClick={() => handleEntityClick({ name: "Farm Aid", category: "music festival" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Farm Aid 1985
                      </button> (stole the show), 
                      <button 
                        onClick={() => handleEntityClick({ name: "San Quentin State Prison", category: "location" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        San Quentin
                      </button> (witnessed Johnny Cash)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600">🎤</span>
                    <span className="text-gray-700">Influences: 
                      <button 
                        onClick={() => handleEntityClick({ name: "Lefty Frizzell", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Lefty Frizzell
                      </button>, 
                      <button 
                        onClick={() => handleEntityClick({ name: "Jimmie Rodgers", category: "musician" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Jimmie Rodgers
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600">🚂</span>
                    <span className="text-gray-700">Railroad heritage: 
                      <button 
                        onClick={() => handleEntityClick({ name: "Virginia Scenic Railway", category: "transportation" })}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline ml-1"
                      >
                        Virginia Scenic Railway
                      </button> (operates his observation car)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mentions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mentions in Context ({mentions.length})
            </h3>
            <div className="space-y-4">
              {mentions.map((mention, index) => (
                <Card key={`${mention.id}-${index}`} className="hover:bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <button
                          onClick={() => onTimestampClick?.(mention.timestamp - 5)} // Jump 5 seconds before the mention
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                          title="Jump to audio at this timestamp (5 seconds before mention)"
                        >
                          {formatTimestamp(mention.timestamp)}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {mention.confidence}% confidence
                        </Badge>
                        {mention.sentiment && (
                          <Badge className={getSentimentBadgeColor(mention.sentiment)}>
                            {mention.sentiment}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p 
                      className="text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: `"${makeEntitiesClickable(mention.context)}"` }}
                    />
                    {mention.emotions && mention.emotions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {mention.emotions.map((emotion: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {mentions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No mention details available for this entity.
            </div>
          )}
        </div>
      </div>
      
      {/* Wikipedia Integration Modal */}
      <WikipediaIntegration
        entityName={entity.name}
        entityCategory={entity.category}
        isOpen={showWikipedia}
        onClose={() => setShowWikipedia(false)}
        onEntityClick={handleWikipediaEntityClick}
        existingEntities={[...(analysis?.entityAnalysis || (analysis as any)?.entities || []), ...expandedEntities.map(e => ({ entity: e }))]}
        onKnowledgeExpanded={handleKnowledgeExpanded}
      />
    </div>
  );
}