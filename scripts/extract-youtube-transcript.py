#!/usr/bin/env python3
"""
Extract YouTube transcript with timestamps for perfect audio-text synchronization
"""

import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

def extract_video_id(url):
    """Extract video ID from YouTube URL"""
    if "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    elif "youtube.com/watch?v=" in url:
        return url.split("v=")[1].split("&")[0]
    else:
        return url  # Assume it's already a video ID

def get_transcript_with_timestamps(video_id):
    """Get transcript with word-level timestamps"""
    try:
        # Create API instance and get the transcript
        api = YouTubeTranscriptApi()
        transcript_list = api.fetch(video_id)
        
        # Process into word-level timestamps
        word_timestamps = []
        
        for entry in transcript_list:
            text = entry.text
            start_time = entry.start
            duration = entry.duration
            
            # Split text into words
            words = text.split()
            
            if len(words) == 0:
                continue
                
            # Estimate time per word (simple distribution)
            time_per_word = duration / len(words)
            
            for i, word in enumerate(words):
                word_start = start_time + (i * time_per_word)
                word_end = word_start + time_per_word
                
                word_timestamps.append({
                    'word': word,
                    'start': round(word_start, 3),
                    'end': round(word_end, 3),
                    'confidence': 1.0  # YouTube captions are generally accurate
                })
        
        return {
            'video_id': video_id,
            'word_count': len(word_timestamps),
            'duration': word_timestamps[-1]['end'] if word_timestamps else 0,
            'words': word_timestamps,
            'full_text': ' '.join([w['word'] for w in word_timestamps])
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'video_id': video_id
        }

def main():
    if len(sys.argv) < 2:
        print("Usage: python extract-youtube-transcript.py <youtube_url_or_id>")
        sys.exit(1)
    
    url_or_id = sys.argv[1]
    video_id = extract_video_id(url_or_id)
    
    print(f"Extracting transcript for video ID: {video_id}")
    
    result = get_transcript_with_timestamps(video_id)
    
    if 'error' in result:
        print(f"Error: {result['error']}")
        sys.exit(1)
    
    # Save to file
    output_file = f"transcript-{video_id}.json"
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"\nSuccess! Transcript saved to {output_file}")
    print(f"Total words: {result['word_count']}")
    print(f"Duration: {result['duration']:.2f} seconds")
    print(f"\nFirst 10 words with timestamps:")
    for word_data in result['words'][:10]:
        print(f"  {word_data['start']:.2f}s: {word_data['word']}")

if __name__ == "__main__":
    main()