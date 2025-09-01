#!/usr/bin/env python3
"""
Entity Extraction System for Merle Haggard's "My House of Memories"
Extracts named entities and creates cross-media discovery connections
"""

import json
import re
import csv
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Set
import os

class EntityExtractor:
    def __init__(self, transcript_path: str, entities_csv: str):
        """Initialize with transcript and existing entities"""
        self.transcript_path = transcript_path
        self.entities_csv = entities_csv
        self.text = ""
        self.words = []
        self.existing_entities = {}
        self.extracted_entities = defaultdict(list)
        self.entity_mentions = defaultdict(int)
        
        # Patterns for entity extraction
        self.patterns = {
            'person': [
                r'\b[A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b',  # Full names
                r'\b(?:Mr\.|Mrs\.|Ms\.|Dr\.) [A-Z][a-z]+\b',  # Titles
            ],
            'place': [
                r'\b(?:San |Los |Las |New |Fort |Port )[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b',  # City patterns
                r'\b[A-Z][a-z]+(?:ville|berg|field|dale|wood|land|ton)\b',  # City suffixes
                r'\b(?:California|Texas|Tennessee|Oklahoma|Nevada|Arizona)\b',  # States
            ],
            'song': [
                r'\"([^\"]+)\"',  # Quoted titles
                r'"([^"]+)"',  # Smart quotes
                r'\b(?:sang|performed|recorded|wrote) (?:the song )?([A-Z][^.!?]+)',  # Song mentions
            ],
            'institution': [
                r'\b[A-Z][a-z]+ (?:Records|Studios|Productions|Label)\b',
                r'\b(?:Prison|Penitentiary|Jail|Court|Hospital)\b',
            ]
        }
        
        # Known entities for better matching
        self.known_entities = {
            'person': {
                'Merle Haggard', 'Johnny Cash', 'Willie Nelson', 'Waylon Jennings',
                'Buck Owens', 'Bonnie Owens', 'Tom Carter', 'Kris Kristofferson',
                'George Jones', 'Dolly Parton', 'Loretta Lynn', 'Conway Twitty',
                'Lefty Frizzell', 'Bob Wills', 'Jimmie Rodgers', 'Ernest Tubb'
            },
            'place': {
                'Bakersfield', 'Nashville', 'San Quentin', 'Oildale', 'Muskogee',
                'California', 'Texas', 'Tennessee', 'Oklahoma', 'Las Vegas',
                'Austin', 'Memphis', 'Fresno', 'Los Angeles', 'San Francisco'
            },
            'song': {
                'Okie from Muskogee', 'Mama Tried', 'Sing Me Back Home',
                'The Fightin\' Side of Me', 'If We Make It Through December',
                'Big City', 'Pancho and Lefty', 'Today I Started Loving You Again',
                'Silver Wings', 'The Bottle Let Me Down', 'Branded Man'
            }
        }
    
    def load_transcript(self):
        """Load and parse the transcript JSON"""
        print(f"Loading transcript from {self.transcript_path}")
        with open(self.transcript_path, 'r') as f:
            data = json.load(f)
        
        self.words = data.get('words', [])
        # Reconstruct full text
        self.text = ' '.join([w['word'] for w in self.words])
        print(f"Loaded {len(self.words)} words")
        return self.text
    
    def load_existing_entities(self):
        """Load existing POC entities for matching"""
        print(f"Loading existing entities from {self.entities_csv}")
        with open(self.entities_csv, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                entity_type = row['entity_type'].lower()
                if entity_type not in self.existing_entities:
                    self.existing_entities[entity_type] = {}
                self.existing_entities[entity_type][row['entity_name']] = row
        
        print(f"Loaded {sum(len(e) for e in self.existing_entities.values())} existing entities")
    
    def extract_entities(self):
        """Extract entities from transcript text"""
        print("\nExtracting entities from transcript...")
        
        # First, extract based on known entities
        for entity_type, entities in self.known_entities.items():
            for entity in entities:
                # Case-insensitive search
                pattern = re.compile(re.escape(entity), re.IGNORECASE)
                matches = pattern.findall(self.text)
                if matches:
                    self.extracted_entities[entity_type].append({
                        'name': entity,
                        'type': entity_type,
                        'mentions': len(matches),
                        'confidence': 1.0,
                        'source': 'known_entity'
                    })
                    self.entity_mentions[entity] = len(matches)
        
        # Extract using patterns
        for entity_type, patterns in self.patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, self.text[:50000])  # Sample first 50k chars
                for match in matches:
                    if isinstance(match, tuple):
                        match = match[0]
                    
                    # Clean and validate
                    match = match.strip()
                    if len(match) > 3 and len(match) < 50:  # Reasonable length
                        # Check if already found
                        if match not in self.entity_mentions:
                            self.extracted_entities[entity_type].append({
                                'name': match,
                                'type': entity_type,
                                'mentions': 1,
                                'confidence': 0.7,
                                'source': 'pattern_match'
                            })
                            self.entity_mentions[match] = 1
        
        # Deduplicate and sort by mentions
        for entity_type in self.extracted_entities:
            seen = set()
            unique = []
            for entity in sorted(self.extracted_entities[entity_type], 
                               key=lambda x: x['mentions'], reverse=True):
                if entity['name'].lower() not in seen:
                    unique.append(entity)
                    seen.add(entity['name'].lower())
            self.extracted_entities[entity_type] = unique[:50]  # Top 50 per type
        
        return self.extracted_entities
    
    def map_to_existing(self):
        """Map extracted entities to existing POC entities"""
        print("\nMapping to existing POC entities...")
        mappings = []
        
        for entity_type, entities in self.extracted_entities.items():
            existing = self.existing_entities.get(entity_type, {})
            
            for entity in entities:
                # Try exact match
                if entity['name'] in existing:
                    mappings.append({
                        'extracted': entity['name'],
                        'existing': entity['name'],
                        'type': entity_type,
                        'confidence': 1.0,
                        'match_type': 'exact'
                    })
                else:
                    # Try fuzzy match
                    for existing_name in existing:
                        if (entity['name'].lower() in existing_name.lower() or 
                            existing_name.lower() in entity['name'].lower()):
                            mappings.append({
                                'extracted': entity['name'],
                                'existing': existing_name,
                                'type': entity_type,
                                'confidence': 0.8,
                                'match_type': 'fuzzy'
                            })
                            break
        
        return mappings
    
    def generate_triples(self):
        """Generate relationship triples for cross-media discovery"""
        print("\nGenerating relationship triples...")
        triples = []
        
        # Create relationships based on co-occurrence
        persons = [e['name'] for e in self.extracted_entities.get('person', [])][:10]
        places = [e['name'] for e in self.extracted_entities.get('place', [])][:10]
        songs = [e['name'] for e in self.extracted_entities.get('song', [])][:10]
        
        # Person-Place relationships
        for person in persons:
            for place in places:
                # Check if they appear near each other in text
                if person in self.text and place in self.text:
                    person_idx = self.text.find(person)
                    place_idx = self.text.find(place)
                    if abs(person_idx - place_idx) < 500:  # Within 500 chars
                        triples.append({
                            'subject': person,
                            'predicate': 'associated_with',
                            'object': place,
                            'confidence': 0.7,
                            'source': 'proximity'
                        })
        
        # Person-Song relationships
        for person in persons:
            for song in songs:
                if person in self.text and song in self.text:
                    person_idx = self.text.find(person)
                    song_idx = self.text.find(song)
                    if abs(person_idx - song_idx) < 300:
                        triples.append({
                            'subject': person,
                            'predicate': 'performed',
                            'object': song,
                            'confidence': 0.6,
                            'source': 'proximity'
                        })
        
        # Book-Entity relationships
        book_name = "My House of Memories"
        for person in persons[:20]:
            triples.append({
                'subject': book_name,
                'predicate': 'mentions',
                'object': person,
                'confidence': 0.9,
                'source': 'transcript'
            })
        
        for place in places[:15]:
            triples.append({
                'subject': book_name,
                'predicate': 'describes',
                'object': place,
                'confidence': 0.85,
                'source': 'transcript'
            })
        
        return triples
    
    def save_results(self, output_dir: str):
        """Save extraction results to CSV files"""
        os.makedirs(output_dir, exist_ok=True)
        
        # Save extracted entities
        entities_file = os.path.join(output_dir, 'extracted_entities.csv')
        with open(entities_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['entity_type', 'entity_name', 'mentions', 'confidence', 'source'])
            for entity_type, entities in self.extracted_entities.items():
                for entity in entities:
                    writer.writerow([
                        entity_type,
                        entity['name'],
                        entity['mentions'],
                        entity['confidence'],
                        entity['source']
                    ])
        print(f"Saved extracted entities to {entities_file}")
        
        # Save mappings
        mappings = self.map_to_existing()
        mappings_file = os.path.join(output_dir, 'entity_mappings.csv')
        with open(mappings_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['extracted', 'existing', 'type', 'confidence', 'match_type'])
            writer.writeheader()
            writer.writerows(mappings)
        print(f"Saved entity mappings to {mappings_file}")
        
        # Save triples
        triples = self.generate_triples()
        triples_file = os.path.join(output_dir, 'discovery_triples.csv')
        with open(triples_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['subject', 'predicate', 'object', 'confidence', 'source'])
            writer.writeheader()
            writer.writerows(triples)
        print(f"Saved discovery triples to {triples_file}")
        
        # Generate summary report
        self.generate_report(output_dir)
    
    def generate_report(self, output_dir: str):
        """Generate extraction summary report"""
        report_file = os.path.join(output_dir, 'extraction_report.md')
        
        with open(report_file, 'w') as f:
            f.write("# Entity Extraction Report\n\n")
            f.write("## Summary Statistics\n\n")
            
            total_entities = sum(len(e) for e in self.extracted_entities.values())
            f.write(f"- Total entities extracted: {total_entities}\n")
            f.write(f"- Total unique mentions: {len(self.entity_mentions)}\n\n")
            
            f.write("### By Entity Type:\n")
            for entity_type, entities in self.extracted_entities.items():
                f.write(f"- **{entity_type.title()}**: {len(entities)} entities\n")
            
            f.write("\n## Top Entities by Mentions\n\n")
            
            # Top mentioned overall
            top_mentions = sorted(self.entity_mentions.items(), key=lambda x: x[1], reverse=True)[:20]
            f.write("### Most Frequently Mentioned:\n")
            for name, count in top_mentions:
                f.write(f"1. {name}: {count} mentions\n")
            
            f.write("\n## Cross-Media Discovery Opportunities\n\n")
            f.write("### Potential Connections:\n")
            f.write("- **Podcast → Book**: Fresh Air interview mentions → Book chapter references\n")
            f.write("- **Book → Music**: Story mentions → Spotify/Apple Music tracks\n")
            f.write("- **Person → Media**: Artist mentions → Related books, podcasts, documentaries\n")
            f.write("- **Place → Content**: Location mentions → Historical content, photos, maps\n")
            
            f.write("\n## Entity Mappings\n\n")
            mappings = self.map_to_existing()
            f.write(f"Successfully mapped {len(mappings)} entities to existing POC data\n\n")
            
            if mappings:
                f.write("### Sample Mappings:\n")
                for m in mappings[:10]:
                    f.write(f"- {m['extracted']} → {m['existing']} ({m['match_type']}, {m['confidence']:.1%})\n")
        
        print(f"Generated report at {report_file}")


def main():
    # Paths
    transcript_path = "../client/public/transcript-PSN8N2v4oq0.json"
    entities_csv = "../data/UT_HC_POC_entities.csv"
    output_dir = "../data/extraction_results"
    
    # Initialize extractor
    extractor = EntityExtractor(transcript_path, entities_csv)
    
    # Run extraction pipeline
    extractor.load_transcript()
    extractor.load_existing_entities()
    extractor.extract_entities()
    
    # Save results
    extractor.save_results(output_dir)
    
    print("\n✅ Entity extraction complete!")
    print(f"Results saved to {output_dir}")


if __name__ == "__main__":
    main()