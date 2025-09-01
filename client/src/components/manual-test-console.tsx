import { useEffect } from 'react';

export function ManualTestConsole() {
  useEffect(() => {
    // Expose test functions globally for manual testing
    window.testPlayer = {
      // Test basic seeks
      testSeeks: () => {
        console.log('🧪 MANUAL TEST: Testing basic seeks...');
        console.log('Test 1: Seeking to 30 seconds...');
        window.audioSync?.seekTo(30);
        
        setTimeout(() => {
          console.log('Test 2: Seeking to 60 seconds...');
          window.audioSync?.seekTo(60);
          
          setTimeout(() => {
            console.log('Test 3: Seeking to 120 seconds...');
            window.audioSync?.seekTo(120);
            console.log('✅ Basic seek tests complete');
          }, 2000);
        }, 2000);
      },
      
      // Test chapter navigation
      testChapter: (chapterNum: number) => {
        console.log(`🧪 MANUAL TEST: Jumping to chapter ${chapterNum}`);
        const button = document.querySelector(`[data-chapter="${chapterNum}"]`);
        if (button) {
          (button as HTMLElement).click();
          console.log('✅ Chapter button clicked');
        } else {
          console.log('❌ Chapter button not found');
        }
      },
      
      // Test word click
      testWord: () => {
        console.log('🧪 MANUAL TEST: Clicking first visible word...');
        const word = document.querySelector('.synchronized-transcript span');
        if (word) {
          (word as HTMLElement).click();
          console.log('✅ Word clicked');
        } else {
          console.log('❌ No words found');
        }
      },
      
      // Check player status
      status: () => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 PLAYER STATUS CHECK');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('window.audioSync exists:', !!window.audioSync);
        
        if (window.audioSync) {
          console.log('- seekTo function:', typeof window.audioSync.seekTo);
          console.log('- getCurrentTime:', typeof window.audioSync.getCurrentTime);
          console.log('- playVideo:', typeof window.audioSync.playVideo);
          console.log('- pauseVideo:', typeof window.audioSync.pauseVideo);
          console.log('- isReady:', window.audioSync.isReady?.());
          
          try {
            const currentTime = window.audioSync.getCurrentTime();
            const duration = window.audioSync.getDuration();
            console.log(`- Current time: ${currentTime}s`);
            console.log(`- Duration: ${duration}s`);
          } catch (e) {
            console.error('Error getting time:', e);
          }
        } else {
          console.log('❌ window.audioSync not available');
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      },
      
      // Run all tests
      runAll: () => {
        console.log('🚀 RUNNING ALL MANUAL TESTS...');
        window.testPlayer.status();
        
        setTimeout(() => {
          window.testPlayer.testSeeks();
          
          setTimeout(() => {
            window.testPlayer.testWord();
            
            setTimeout(() => {
              console.log('✅ ALL TESTS COMPLETE');
              console.log('Check console output above for results');
            }, 2000);
          }, 6000);
        }, 1000);
      }
    };
    
    // Log instructions
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎮 MANUAL TEST CONSOLE READY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Available test commands:');
    console.log('  window.testPlayer.status()     - Check player status');
    console.log('  window.testPlayer.testSeeks()  - Test basic seeks (30s, 60s, 120s)');
    console.log('  window.testPlayer.testChapter(5) - Test chapter 5 click');
    console.log('  window.testPlayer.testWord()   - Test first word click');
    console.log('  window.testPlayer.runAll()     - Run all tests');
    console.log('');
    console.log('Direct control commands:');
    console.log('  window.audioSync.seekTo(30)    - Seek to 30 seconds');
    console.log('  window.audioSync.playVideo()   - Play');
    console.log('  window.audioSync.pauseVideo()  - Pause');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, []);
  
  return null; // This component doesn't render anything
}