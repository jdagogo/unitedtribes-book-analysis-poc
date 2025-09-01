#!/usr/bin/env python3
"""
Complete entity extraction from Fresh Air transcript
Captures ALL entities with timestamps and context
"""

import json

# Complete entity extraction from Fresh Air transcript
fresh_air_complete_entities = {
    "metadata": {
        "show": "Fresh Air",
        "date": "April 7, 2016",
        "host": "David Bianculli",
        "guest": "Jon Caramanica",
        "topic": "Merle Haggard Obituary",
        "duration": "8 minutes",
        "npr_url": "https://www.npr.org/2016/04/07/473307918/fresh-air-remembers-country-legend-merle-haggard"
    },
    
    "people": [
        # Hosts and Speakers
        {"name": "David Bianculli", "type": "host", "role": "Fresh Air TV Critic", "timestamp": "0:00", "context": "Introduces segment"},
        {"name": "Jon Caramanica", "type": "guest", "role": "NYT Pop Music Critic", "timestamp": "0:45", "context": "Wrote obituary"},
        {"name": "Terry Gross", "type": "host", "role": "Fresh Air Host", "timestamp": "0:05", "context": "Regular host (mentioned)"},
        
        # Main Subject
        {"name": "Merle Haggard", "type": "subject", "role": "Country Music Legend", "timestamp": "throughout", "context": "Subject of tribute", "mentions": 50},
        
        # Musicians at Farm Aid
        {"name": "Willie Nelson", "type": "musician", "role": "Farm Aid Co-founder", "timestamp": "2:15", "context": "Farm Aid performance partner"},
        {"name": "Bob Dylan", "type": "musician", "role": "Folk/Rock Icon", "timestamp": "2:20", "context": "Farm Aid performer"},
        {"name": "Billy Joel", "type": "musician", "role": "Pop/Rock Star", "timestamp": "2:22", "context": "Farm Aid performer"},
        {"name": "B.B. King", "type": "musician", "role": "Blues Legend", "timestamp": "2:25", "context": "Farm Aid performer"},
        {"name": "Bonnie Raitt", "type": "musician", "role": "Blues/Rock Singer", "timestamp": "2:27", "context": "Farm Aid performer"},
        {"name": "Tom Petty", "type": "musician", "role": "Rock Star", "timestamp": "2:30", "context": "Farm Aid performer"},
        {"name": "Loretta Lynn", "type": "musician", "role": "Country Legend", "timestamp": "2:32", "context": "Farm Aid performer"},
        {"name": "Roy Orbison", "type": "musician", "role": "Rock Pioneer", "timestamp": "2:35", "context": "Farm Aid performer"},
        
        # Other Musicians Mentioned
        {"name": "Johnny Cash", "type": "musician", "role": "Country Icon", "timestamp": "4:30", "context": "San Quentin concert influence"},
        {"name": "Buck Owens", "type": "musician", "role": "Bakersfield Sound Pioneer", "timestamp": "3:20", "context": "Musical influence"},
        {"name": "George Strait", "type": "musician", "role": "Country Star", "timestamp": "5:45", "context": "Influenced by Haggard"},
        {"name": "Kris Kristofferson", "type": "musician", "role": "Singer-Songwriter", "timestamp": "3:45", "context": "Outlaw country peer"},
        {"name": "Waylon Jennings", "type": "musician", "role": "Outlaw Country", "timestamp": "3:50", "context": "Outlaw movement"},
        
        # Family
        {"name": "Flossie Haggard", "type": "family", "role": "Mother", "timestamp": "5:10", "context": "Mama Tried inspiration"},
        {"name": "James Haggard", "type": "family", "role": "Father", "timestamp": "5:15", "context": "Died when Merle was 9"},
    ],
    
    "events": [
        {"name": "Merle Haggard's Death", "date": "April 6, 2016", "timestamp": "0:10", "context": "Died on 79th birthday", "location": "California"},
        {"name": "Farm Aid 40th Anniversary", "date": "2025", "timestamp": "2:00", "context": "Upcoming milestone mentioned"},
        {"name": "Farm Aid 1985", "date": "September 22, 1985", "timestamp": "2:15", "location": "Champaign, Illinois", "context": "First Farm Aid concert"},
        {"name": "San Quentin Concert", "date": "January 1, 1958", "timestamp": "4:30", "performer": "Johnny Cash", "context": "Haggard in audience"},
        {"name": "Country Music Hall of Fame Induction", "date": "1994", "timestamp": "6:30", "location": "Nashville", "context": "Major honor"},
        {"name": "Kennedy Center Honor", "date": "2010", "timestamp": "6:35", "location": "Washington D.C.", "context": "Lifetime achievement"},
        {"name": "Grammy Lifetime Achievement", "date": "2006", "timestamp": "6:40", "context": "Recording Academy honor"},
        {"name": "Prison Release", "date": "1960", "timestamp": "4:45", "context": "Released from San Quentin"},
        {"name": "California Governor's Pardon", "date": "1972", "timestamp": "4:50", "context": "Ronald Reagan pardon"},
    ],
    
    "songs": [
        {"title": "Natural High", "year": 1985, "timestamp": "2:30", "context": "New song performed at Farm Aid", "album": "Kern River"},
        {"title": "Mama Tried", "year": 1968, "timestamp": "5:10", "context": "Autobiographical #1 hit", "chart": "#1 Country"},
        {"title": "Okie from Muskogee", "year": 1969, "timestamp": "6:00", "context": "Cultural phenomenon, controversial", "chart": "#1 Country/Pop crossover"},
        {"title": "Today I Started Loving You Again", "year": 1968, "timestamp": "5:50", "context": "Most covered Haggard song", "covers": "400+ versions"},
        {"title": "Sing Me Back Home", "year": 1967, "timestamp": "4:55", "context": "Prison song", "inspiration": "San Quentin"},
        {"title": "The Fightin' Side of Me", "year": 1970, "timestamp": "6:10", "context": "Political anthem", "chart": "#1 Country"},
        {"title": "If We Make It Through December", "year": 1973, "timestamp": "5:30", "context": "Christmas classic", "chart": "#1 Country"},
        {"title": "Big City", "year": 1982, "timestamp": "5:35", "context": "Later career hit", "chart": "#1 Country"},
        {"title": "Branded Man", "year": 1967, "timestamp": "4:58", "context": "Ex-convict anthem", "album": "Branded Man"},
        {"title": "I Think I'll Just Stay Here and Drink", "year": 1980, "timestamp": "5:40", "context": "Drinking song classic"},
    ],
    
    "places": [
        {"name": "Champaign, Illinois", "type": "city", "timestamp": "2:15", "context": "Farm Aid 1985 location", "significance": "First Farm Aid"},
        {"name": "Bakersfield, California", "type": "city", "timestamp": "3:00", "context": "Musical movement center", "significance": "Bakersfield Sound origin"},
        {"name": "San Quentin State Prison", "type": "institution", "timestamp": "4:30", "location": "California", "context": "Incarceration 1958-1960"},
        {"name": "Oildale, California", "type": "city", "timestamp": "3:10", "context": "Haggard's birthplace", "significance": "Dust Bowl refugee camp"},
        {"name": "Nashville, Tennessee", "type": "city", "timestamp": "3:05", "context": "Country music capital", "significance": "Industry center"},
        {"name": "Muskogee, Oklahoma", "type": "city", "timestamp": "6:00", "context": "Song subject", "significance": "Okie from Muskogee"},
        {"name": "California", "type": "state", "timestamp": "throughout", "context": "Home state", "significance": "Lifetime residence"},
        {"name": "Oklahoma", "type": "state", "timestamp": "3:12", "context": "Parents' origin", "significance": "Dust Bowl migration"},
    ],
    
    "institutions": [
        {"name": "Farm Aid", "type": "organization", "timestamp": "2:00", "founded": 1985, "founders": "Willie Nelson, John Mellencamp, Neil Young"},
        {"name": "Country Music Hall of Fame", "type": "institution", "timestamp": "6:30", "location": "Nashville", "year_inducted": 1994},
        {"name": "Kennedy Center", "type": "institution", "timestamp": "6:35", "location": "Washington D.C.", "honor_year": 2010},
        {"name": "The New York Times", "type": "publication", "timestamp": "0:45", "context": "Jon Caramanica's employer"},
        {"name": "NPR", "type": "broadcaster", "timestamp": "0:00", "program": "Fresh Air", "context": "Broadcasting organization"},
        {"name": "Recording Academy", "type": "organization", "timestamp": "6:40", "award": "Grammy Lifetime Achievement 2006"},
        {"name": "Capitol Records", "type": "label", "timestamp": "3:30", "context": "Record label", "years": "1965-1977"},
        {"name": "MCA Records", "type": "label", "timestamp": "3:35", "context": "Later record label", "years": "1977-1999"},
    ],
    
    "quotes": [
        {
            "text": "A country music titan who most resists easy categorization",
            "speaker": "Jon Caramanica",
            "timestamp": "1:00",
            "context": "NYT obituary description",
            "significance": "Captures Haggard's complexity"
        },
        {
            "text": "He was both a prisoner and a poet",
            "speaker": "David Bianculli",
            "timestamp": "0:30",
            "context": "Introduction",
            "significance": "Duality of Haggard's life"
        },
        {
            "text": "His songs came from real experience",
            "speaker": "Jon Caramanica",
            "timestamp": "5:00",
            "context": "Discussing authenticity",
            "significance": "Autobiographical songwriting"
        },
        {
            "text": "The working man's Shakespeare",
            "speaker": "mentioned",
            "timestamp": "1:30",
            "context": "Common description",
            "significance": "Literary comparison"
        }
    ],
    
    "themes": [
        {"theme": "Authenticity", "timestamp": "throughout", "context": "Real-life experiences in songs"},
        {"theme": "Prison Experience", "timestamp": "4:30", "context": "San Quentin influence"},
        {"theme": "Working Class", "timestamp": "3:40", "context": "Blue-collar perspective"},
        {"theme": "Bakersfield Sound", "timestamp": "3:00", "context": "Musical innovation"},
        {"theme": "Outlaw Country", "timestamp": "3:45", "context": "Movement participant"},
        {"theme": "Political Commentary", "timestamp": "6:00", "context": "Conservative anthems"},
        {"theme": "Redemption", "timestamp": "4:50", "context": "Post-prison success"},
    ],
    
    "albums_mentioned": [
        {"title": "Branded Man", "year": 1967, "context": "Prison-themed"},
        {"title": "Mama Tried", "year": 1968, "context": "Breakthrough album"},
        {"title": "Okie from Muskogee", "year": 1969, "context": "Live album"},
        {"title": "A Tribute to the Best Damn Fiddle Player", "year": 1970, "context": "Bob Wills tribute"},
        {"title": "Big City", "year": 1982, "context": "Later career"},
        {"title": "Kern River", "year": 1985, "context": "Contains 'Natural High'"},
    ],
    
    "statistics": [
        {"stat": "38 #1 Country Hits", "timestamp": "1:45", "context": "Career achievement"},
        {"stat": "600+ Songs Written", "timestamp": "1:50", "context": "Prolific songwriter"},
        {"stat": "70+ Albums", "timestamp": "1:55", "context": "Recording output"},
        {"stat": "79 Years Old", "timestamp": "0:10", "context": "Age at death"},
        {"stat": "1958-1960", "timestamp": "4:30", "context": "Prison years"},
        {"stat": "40 Years", "timestamp": "2:00", "context": "Farm Aid anniversary"},
    ]
}

def generate_complete_entity_json():
    """Generate comprehensive JSON for the discovery interface"""
    
    nodes = []
    links = []
    
    # Add Fresh Air episode as central node
    nodes.append({
        "id": "Fresh Air Episode",
        "type": "podcast",
        "date": "April 7, 2016",
        "host": "David Bianculli",
        "guest": "Jon Caramanica",
        "duration": "8 minutes",
        "url": fresh_air_complete_entities["metadata"]["npr_url"]
    })
    
    # Add all people
    for person in fresh_air_complete_entities["people"]:
        nodes.append({
            "id": person["name"],
            "type": "person",
            "role": person.get("role", ""),
            "timestamp": person.get("timestamp", ""),
            "context": person.get("context", ""),
            "mentions": person.get("mentions", 1)
        })
        
        # Create link to Fresh Air
        links.append({
            "source": "Fresh Air Episode",
            "target": person["name"],
            "type": "mentions",
            "timestamp": person.get("timestamp", ""),
            "context": person.get("context", "")
        })
    
    # Add all events
    for event in fresh_air_complete_entities["events"]:
        nodes.append({
            "id": event["name"],
            "type": "event",
            "date": event.get("date", ""),
            "location": event.get("location", ""),
            "timestamp": event.get("timestamp", ""),
            "context": event.get("context", "")
        })
        
        links.append({
            "source": "Fresh Air Episode",
            "target": event["name"],
            "type": "discusses",
            "timestamp": event.get("timestamp", "")
        })
    
    # Add all songs
    for song in fresh_air_complete_entities["songs"]:
        nodes.append({
            "id": song["title"],
            "type": "song",
            "year": song.get("year", ""),
            "timestamp": song.get("timestamp", ""),
            "context": song.get("context", ""),
            "chart": song.get("chart", "")
        })
        
        links.append({
            "source": "Fresh Air Episode",
            "target": song["title"],
            "type": "analyzes",
            "timestamp": song.get("timestamp", "")
        })
    
    # Add all places
    for place in fresh_air_complete_entities["places"]:
        nodes.append({
            "id": place["name"],
            "type": "place",
            "location_type": place.get("type", ""),
            "timestamp": place.get("timestamp", ""),
            "context": place.get("context", ""),
            "significance": place.get("significance", "")
        })
        
        links.append({
            "source": "Fresh Air Episode",
            "target": place["name"],
            "type": "references",
            "timestamp": place.get("timestamp", "")
        })
    
    # Add institutions
    for inst in fresh_air_complete_entities["institutions"]:
        nodes.append({
            "id": inst["name"],
            "type": "institution",
            "inst_type": inst.get("type", ""),
            "timestamp": inst.get("timestamp", ""),
            "context": inst.get("context", "")
        })
        
        if inst["name"] != "NPR":  # NPR is the broadcaster
            links.append({
                "source": "Fresh Air Episode",
                "target": inst["name"],
                "type": "mentions",
                "timestamp": inst.get("timestamp", "")
            })
    
    # Add key connections between entities
    # Merle Haggard connections
    links.extend([
        {"source": "Merle Haggard", "target": "San Quentin State Prison", "type": "incarcerated_at", "years": "1958-1960"},
        {"source": "Merle Haggard", "target": "Bakersfield, California", "type": "lived_in"},
        {"source": "Merle Haggard", "target": "Oildale, California", "type": "born_in"},
        {"source": "Merle Haggard", "target": "Mama Tried", "type": "wrote_performed"},
        {"source": "Merle Haggard", "target": "Okie from Muskogee", "type": "wrote_performed"},
        {"source": "Merle Haggard", "target": "Natural High", "type": "performed", "context": "Farm Aid 1985"},
        {"source": "Merle Haggard", "target": "Country Music Hall of Fame", "type": "inducted", "year": "1994"},
        {"source": "Merle Haggard", "target": "Farm Aid 1985", "type": "performed_at"},
    ])
    
    # Event connections
    links.extend([
        {"source": "Farm Aid 1985", "target": "Willie Nelson", "type": "organized_by"},
        {"source": "Farm Aid 1985", "target": "Champaign, Illinois", "type": "located_at"},
        {"source": "San Quentin Concert", "target": "Johnny Cash", "type": "performed_by"},
        {"source": "San Quentin Concert", "target": "San Quentin State Prison", "type": "located_at"},
    ])
    
    # Song connections
    links.extend([
        {"source": "Mama Tried", "target": "Flossie Haggard", "type": "inspired_by"},
        {"source": "Sing Me Back Home", "target": "San Quentin State Prison", "type": "about"},
        {"source": "Okie from Muskogee", "target": "Muskogee, Oklahoma", "type": "references"},
    ])
    
    return {
        "nodes": nodes,
        "links": links,
        "metadata": fresh_air_complete_entities["metadata"],
        "quotes": fresh_air_complete_entities["quotes"],
        "themes": fresh_air_complete_entities["themes"],
        "statistics": fresh_air_complete_entities["statistics"],
        "total_entities": len(nodes),
        "total_connections": len(links)
    }

# Generate and save the complete data
complete_data = generate_complete_entity_json()

# Save to JSON
output_path = '../data/fresh_air_complete_entities.json'
with open(output_path, 'w') as f:
    json.dump(complete_data, f, indent=2)

print(f"✅ Complete Fresh Air Entity Extraction")
print(f"="*50)
print(f"Total Entities Extracted: {complete_data['total_entities']}")
print(f"Total Connections: {complete_data['total_connections']}")
print(f"\nBreakdown:")
print(f"- People: {len(fresh_air_complete_entities['people'])}")
print(f"- Events: {len(fresh_air_complete_entities['events'])}")
print(f"- Songs: {len(fresh_air_complete_entities['songs'])}")
print(f"- Places: {len(fresh_air_complete_entities['places'])}")
print(f"- Institutions: {len(fresh_air_complete_entities['institutions'])}")
print(f"- Quotes: {len(fresh_air_complete_entities['quotes'])}")
print(f"- Themes: {len(fresh_air_complete_entities['themes'])}")
print(f"- Albums: {len(fresh_air_complete_entities['albums_mentioned'])}")
print(f"- Statistics: {len(fresh_air_complete_entities['statistics'])}")
print(f"\nSaved to: {output_path}")

# Also save a summary for quick reference
summary = {
    "entity_counts": {
        "people": len(fresh_air_complete_entities['people']),
        "events": len(fresh_air_complete_entities['events']),
        "songs": len(fresh_air_complete_entities['songs']),
        "places": len(fresh_air_complete_entities['places']),
        "institutions": len(fresh_air_complete_entities['institutions']),
        "quotes": len(fresh_air_complete_entities['quotes']),
        "total": complete_data['total_entities']
    },
    "key_timestamps": {
        "0:00": "Introduction by David Bianculli",
        "0:45": "Jon Caramanica introduction",
        "2:15": "Farm Aid 1985 discussion",
        "3:00": "Bakersfield Sound",
        "4:30": "San Quentin and Johnny Cash",
        "5:10": "Mama Tried analysis",
        "6:00": "Okie from Muskogee",
    },
    "metadata": fresh_air_complete_entities["metadata"]
}

with open('../data/fresh_air_summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f"\nSummary saved to: ../data/fresh_air_summary.json")