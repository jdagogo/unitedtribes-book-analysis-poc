#!/usr/bin/env python3
"""
Create chapter structure for the Merle Haggard audiobook
Based on time segments with smart naming
"""

import json

def create_chapters(transcript_file, minutes_per_chapter=15):
    """Create chapters based on time segments"""
    
    with open(transcript_file, 'r') as f:
        data = json.load(f)
    
    words = data['words']
    total_duration = data['duration']
    
    # Chapter themes based on typical autobiography progression
    chapter_themes = [
        "Introduction & Early Life",
        "Childhood in Oildale", 
        "Family & Father's Death",
        "Teenage Troubles",
        "First Encounters with Music",
        "Reform School & Early Crime",
        "Hopping Trains & Running Wild",
        "San Quentin Prison",
        "Johnny Cash Concert",
        "Release & New Beginning",
        "Bakersfield Music Scene",
        "First Performances",
        "Meeting Buck Owens",
        "Recording First Songs",
        "Rise to Fame",
        "Okie from Muskogee",
        "Country Music Success",
        "Personal Struggles",
        "Marriages & Relationships",
        "Willie Nelson & Friends",
        "The Outlaws",
        "Later Career",
        "Reflections & Legacy",
        "Final Thoughts"
    ]
    
    chapters = []
    chapter_duration = minutes_per_chapter * 60  # Convert to seconds
    num_chapters = min(len(chapter_themes), int(total_duration / chapter_duration) + 1)
    
    for i in range(num_chapters):
        start_time = i * chapter_duration
        end_time = min((i + 1) * chapter_duration, total_duration)
        
        # Find the word indices for this time range
        start_idx = next((j for j, w in enumerate(words) if w['start'] >= start_time), 0)
        end_idx = next((j for j, w in enumerate(words) if w['start'] >= end_time), len(words))
        
        # Get preview text
        preview_words = words[start_idx:min(start_idx + 30, end_idx)]
        preview_text = ' '.join([w['word'] for w in preview_words])
        
        # Use thematic title if available, otherwise generic
        if i < len(chapter_themes):
            title = chapter_themes[i]
        else:
            title = f"Part {i + 1}"
        
        # Calculate chapter stats
        duration_seconds = end_time - start_time
        duration_minutes = duration_seconds / 60
        
        chapter = {
            'id': f'chapter-{i+1}',
            'number': i + 1,
            'title': title,
            'start_time': round(start_time, 2),
            'end_time': round(end_time, 2),
            'start_word_index': start_idx,
            'end_word_index': end_idx,
            'word_count': end_idx - start_idx,
            'duration_seconds': round(duration_seconds, 2),
            'duration_minutes': round(duration_minutes, 2),
            'preview': preview_text[:150] + '...' if len(preview_text) > 150 else preview_text,
            'progress_percentage': round((start_time / total_duration) * 100, 1)
        }
        chapters.append(chapter)
    
    # Create the complete chapter structure
    result = {
        'video_id': data['video_id'],
        'title': 'My House of Memories',
        'author': 'Merle Haggard',
        'narrator': 'Merle Haggard',
        'total_duration_seconds': round(total_duration, 2),
        'total_duration_hours': round(total_duration / 3600, 2),
        'total_words': len(words),
        'chapter_count': len(chapters),
        'average_chapter_duration_minutes': round(minutes_per_chapter, 1),
        'chapters': chapters
    }
    
    return result

def main():
    # Create chapters - 15 minutes each for better navigation
    chapters = create_chapters('transcript-PSN8N2v4oq0.json', minutes_per_chapter=15)
    
    # Save chapter data
    with open('chapters-PSN8N2v4oq0.json', 'w') as f:
        json.dump(chapters, f, indent=2)
    
    # Also save to client/public for web access
    with open('client/public/chapters-PSN8N2v4oq0.json', 'w') as f:
        json.dump(chapters, f, indent=2)
    
    # Print summary
    print(f"Book: {chapters['title']} by {chapters['author']}")
    print(f"Total duration: {chapters['total_duration_hours']:.2f} hours")
    print(f"Total words: {chapters['total_words']:,}")
    print(f"Created {chapters['chapter_count']} chapters ({chapters['average_chapter_duration_minutes']} min each)")
    print("\n" + "="*70)
    print("CHAPTERS:")
    print("="*70)
    
    for ch in chapters['chapters']:
        print(f"\nChapter {ch['number']}: {ch['title']}")
        print(f"  ⏱  {ch['start_time']/60:.1f} - {ch['end_time']/60:.1f} min ({ch['duration_minutes']:.1f} min)")
        print(f"  📝 {ch['word_count']:,} words")
        print(f"  📖 \"{ch['preview'][:60]}...\"")

if __name__ == "__main__":
    main()