#!/usr/bin/env python3
"""
Detect and create chapter structure for the Merle Haggard audiobook
"""

import json
import re

def detect_chapters(transcript_file):
    """Detect chapters in the transcript based on content and timing"""
    
    with open(transcript_file, 'r') as f:
        data = json.load(f)
    
    words = data['words']
    total_duration = data['duration']
    
    # Strategy 1: Time-based chapters (every 10 minutes)
    # Strategy 2: Content-based detection (look for natural breaks)
    
    chapters = []
    
    # Key biographical sections to look for
    section_markers = [
        ('childhood', ['born', 'childhood', 'father', 'mother', 'boxcar', 'Oildale']),
        ('early_troubles', ['trouble', 'reform school', 'juvenile', 'hopping trains']),
        ('prison', ['San Quentin', 'prison', 'incarcerated', 'jail']),
        ('music_beginnings', ['guitar', 'first song', 'Bakersfield', 'honky-tonk']),
        ('buck_owens', ['Buck Owens', 'Bakersfield Sound']),
        ('johnny_cash', ['Johnny Cash', 'concert', 'Folsom']),
        ('success', ['Okie from Muskogee', 'number one', 'hit', 'chart']),
        ('marriages', ['married', 'wife', 'divorce', 'Bonnie', 'Leona']),
        ('willie_nelson', ['Willie Nelson', 'Pancho and Lefty']),
        ('later_years', ['Lake Shasta', 'retirement', 'looking back'])
    ]
    
    # First, create time-based chapters as fallback
    chapter_duration = 600  # 10 minutes per chapter
    num_chapters = int(total_duration / chapter_duration) + 1
    
    for i in range(num_chapters):
        start_time = i * chapter_duration
        end_time = min((i + 1) * chapter_duration, total_duration)
        
        # Find the word indices for this time range
        start_idx = next((j for j, w in enumerate(words) if w['start'] >= start_time), 0)
        end_idx = next((j for j, w in enumerate(words) if w['start'] >= end_time), len(words))
        
        # Get a preview of the content
        preview_words = words[start_idx:min(start_idx + 20, end_idx)]
        preview_text = ' '.join([w['word'] for w in preview_words])
        
        # Try to identify the topic
        topic = f"Part {i + 1}"
        for section_name, keywords in section_markers:
            section_text = ' '.join([w['word'].lower() for w in words[start_idx:min(start_idx + 200, end_idx)]])
            if any(keyword.lower() in section_text for keyword in keywords):
                topic = section_name.replace('_', ' ').title()
                break
        
        chapter = {
            'number': i + 1,
            'title': topic,
            'start_time': start_time,
            'end_time': end_time,
            'start_word_index': start_idx,
            'end_word_index': end_idx,
            'word_count': end_idx - start_idx,
            'duration': end_time - start_time,
            'preview': preview_text[:100] + '...' if len(preview_text) > 100 else preview_text
        }
        chapters.append(chapter)
    
    # Now try to find better chapter breaks based on content
    # Look for major topic shifts or natural pauses
    
    # Search for specific narrative markers
    narrative_breaks = []
    for i, word in enumerate(words):
        if i < len(words) - 10:
            # Create a 10-word context
            context = ' '.join([w['word'] for w in words[i:i+10]])
            context_lower = context.lower()
            
            # Look for time transitions
            if any(phrase in context_lower for phrase in [
                'years later', 'years after', 'next morning', 'that night',
                'in 19', 'by 19', 'it was 19',  # Year references
                'i was born', 'my childhood', 'growing up',
                'when i got out', 'after prison', 'released from'
            ]):
                narrative_breaks.append({
                    'index': i,
                    'time': word['start'],
                    'context': context
                })
    
    # Refine chapters based on narrative breaks if we found enough
    if len(narrative_breaks) > 5:
        refined_chapters = []
        last_break = 0
        
        for i, brk in enumerate(narrative_breaks[:15]):  # Limit to 15 chapters
            if brk['time'] - (narrative_breaks[i-1]['time'] if i > 0 else 0) > 300:  # At least 5 minutes apart
                start_idx = last_break
                end_idx = brk['index']
                
                if end_idx - start_idx > 100:  # Substantial content
                    preview_words = words[start_idx:min(start_idx + 20, end_idx)]
                    preview_text = ' '.join([w['word'] for w in preview_words])
                    
                    chapter = {
                        'number': len(refined_chapters) + 1,
                        'title': f"Chapter {len(refined_chapters) + 1}",
                        'start_time': words[start_idx]['start'] if start_idx < len(words) else 0,
                        'end_time': words[end_idx]['start'] if end_idx < len(words) else total_duration,
                        'start_word_index': start_idx,
                        'end_word_index': end_idx,
                        'word_count': end_idx - start_idx,
                        'duration': words[end_idx]['start'] - words[start_idx]['start'] if end_idx < len(words) else 0,
                        'preview': preview_text[:100] + '...' if len(preview_text) > 100 else preview_text,
                        'narrative_marker': brk['context']
                    }
                    refined_chapters.append(chapter)
                    last_break = end_idx
        
        if refined_chapters:
            chapters = refined_chapters
    
    # Create final chapter structure
    result = {
        'video_id': data['video_id'],
        'total_duration': total_duration,
        'total_words': len(words),
        'chapter_count': len(chapters),
        'chapters': chapters
    }
    
    return result

def main():
    chapters = detect_chapters('transcript-PSN8N2v4oq0.json')
    
    # Save chapter data
    with open('chapters-PSN8N2v4oq0.json', 'w') as f:
        json.dump(chapters, f, indent=2)
    
    # Print summary
    print(f"Detected {chapters['chapter_count']} chapters")
    print(f"Total duration: {chapters['total_duration']/3600:.2f} hours")
    print(f"Total words: {chapters['total_words']}")
    print("\nChapters:")
    
    for ch in chapters['chapters']:
        duration_min = ch['duration'] / 60
        print(f"\n{ch['number']}. {ch['title']}")
        print(f"   Time: {ch['start_time']/60:.1f} - {ch['end_time']/60:.1f} min")
        print(f"   Words: {ch['word_count']}")
        print(f"   Preview: {ch['preview'][:80]}...")

if __name__ == "__main__":
    main()