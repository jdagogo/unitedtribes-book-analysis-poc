#!/usr/bin/env python3
"""
Extract authentic entity data from authentic-merle-analysis.ts
This contains the actual 124 entities shown on the home page
"""

import json
import re

def extract_entities_from_ts():
    """Extract entities from TypeScript file"""
    
    with open('../client/src/data/authentic-merle-analysis.ts', 'r') as f:
        content = f.read()
    
    # Find the entityAnalysis array
    entity_pattern = r'entity:\s*\{([^}]+)\}'
    entities = []
    
    for match in re.finditer(entity_pattern, content, re.DOTALL):
        entity_text = match.group(1)
        
        # Extract fields
        entity = {}
        
        # Extract id
        id_match = re.search(r'id:\s*"([^"]+)"', entity_text)
        if id_match:
            entity['id'] = id_match.group(1)
        
        # Extract name
        name_match = re.search(r'name:\s*"([^"]+)"', entity_text)
        if name_match:
            entity['name'] = name_match.group(1)
        
        # Extract type
        type_match = re.search(r'type:\s*"([^"]+)"', entity_text)
        if type_match:
            entity['type'] = type_match.group(1)
        
        # Extract category
        category_match = re.search(r'category:\s*"([^"]+)"', entity_text)
        if category_match:
            entity['category'] = category_match.group(1)
        
        # Extract description
        desc_match = re.search(r'description:\s*"([^"]+)"', entity_text)
        if desc_match:
            entity['description'] = desc_match.group(1)
        
        # Extract sentiment
        sentiment_match = re.search(r'sentiment:\s*"([^"]+)"', entity_text)
        if sentiment_match:
            entity['sentiment'] = sentiment_match.group(1)
        
        # Extract importance
        importance_match = re.search(r'importance:\s*(\d+)', entity_text)
        if importance_match:
            entity['importance'] = int(importance_match.group(1))
        
        if entity and 'id' in entity:
            entities.append(entity)
    
    # Count by category
    category_counts = {}
    for entity in entities:
        cat = entity.get('category', 'unknown')
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    # Count people (musician, person, journalist categories)
    people_count = sum(category_counts.get(cat, 0) for cat in ['musician', 'person', 'journalist'])
    
    # Count music (music, music festival categories)
    music_count = sum(category_counts.get(cat, 0) for cat in ['music', 'music festival'])
    
    print(f"✅ Extracted {len(entities)} entities from authentic-merle-analysis.ts")
    print(f"📊 Category breakdown:")
    for cat, count in sorted(category_counts.items()):
        print(f"  - {cat}: {count}")
    print(f"👥 People: {people_count}")
    print(f"🎵 Music: {music_count}")
    
    return entities

def create_fresh_air_complete_data():
    """Create complete Fresh Air data structure matching home page"""
    
    entities = extract_entities_from_ts()
    
    # Create nodes
    nodes = []
    
    # Add Fresh Air episode as main node
    nodes.append({
        "id": "Fresh Air Episode",
        "type": "podcast",
        "title": "Merle Haggard On Hopping Trains And Doing Time",
        "date": "April 25, 2025",
        "duration": "45 minutes",
        "host": "David Bianculli",
        "guest": "Terry Gross",
        "url": "https://www.npr.org/podcasts/381444908/fresh-air"
    })
    
    # Add all entities as nodes
    for entity in entities:
        node = {
            "id": entity.get('name', entity.get('id')),
            "type": entity.get('type', 'unknown'),
            "category": entity.get('category', ''),
            "description": entity.get('description', ''),
            "sentiment": entity.get('sentiment', 'neutral'),
            "importance": entity.get('importance', 50)
        }
        nodes.append(node)
    
    # Create links - connect all entities to Fresh Air episode
    links = []
    for entity in entities:
        links.append({
            "source": "Fresh Air Episode",
            "target": entity.get('name', entity.get('id')),
            "type": "mentions",
            "category": entity.get('category', '')
        })
    
    # Add some cross-entity connections based on relationships
    # (e.g., Merle Haggard connected to his songs, places, etc.)
    for entity in entities:
        if 'haggard' in entity.get('id', '').lower():
            # Connect Haggard to his songs
            for other in entities:
                if other.get('category') == 'music' and 'haggard' not in other.get('id', ''):
                    links.append({
                        "source": entity.get('name', entity.get('id')),
                        "target": other.get('name', other.get('id')),
                        "type": "performed"
                    })
    
    # Prepare complete data structure
    complete_data = {
        "nodes": nodes,
        "links": links,
        "metadata": {
            "title": "Merle Haggard On Hopping Trains And Doing Time",
            "showName": "Fresh Air",
            "date": "April 25, 2025",
            "duration": "45 minutes",
            "transcript_accuracy": 95,
            "overall_sentiment": "reflective",
            "total_entities": len(entities),
            "total_mentions": 131,
            "people_count": sum(1 for e in entities if e.get('category') in ['musician', 'person', 'journalist']),
            "music_count": sum(1 for e in entities if e.get('category') in ['music', 'music festival'])
        },
        "stats": {
            "entities_found": len(entities),
            "people_mentioned": sum(1 for e in entities if e.get('category') in ['musician', 'person', 'journalist']),
            "music_mentioned": sum(1 for e in entities if e.get('category') in ['music', 'music festival']),
            "total_mentions": 131,
            "transcription_accuracy": 95,
            "overall_sentiment": "reflective"
        }
    }
    
    return complete_data

# Extract and save the data
data = create_fresh_air_complete_data()

# Save to JSON
with open('../client/public/authentic_merle_entities.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Saved complete data to authentic_merle_entities.json")
print(f"📊 Final stats:")
print(f"  - Total entities: {data['stats']['entities_found']}")
print(f"  - People mentioned: {data['stats']['people_mentioned']}")
print(f"  - Music mentioned: {data['stats']['music_mentioned']}")
print(f"  - Total mentions: {data['stats']['total_mentions']}")
print(f"  - Overall sentiment: {data['stats']['overall_sentiment']}")