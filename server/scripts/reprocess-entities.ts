#!/usr/bin/env node

/**
 * Script to reprocess entities for existing transcripts using the media discovery extractor
 */

import fs from 'fs';
import path from 'path';
import { extractMediaDiscoveryEntities, groupEntitiesByDiscovery } from '../services/media-discovery-extractor';

const TRANSCRIPTS_DIR = path.join(process.cwd(), 'client', 'public', 'transcripts');

async function reprocessTranscriptEntities(transcriptId: string) {
  console.log(`\n🔄 Reprocessing entities for: ${transcriptId}`);
  
  const transcriptDir = path.join(TRANSCRIPTS_DIR, transcriptId);
  const transcriptFile = path.join(transcriptDir, 'transcript.txt');
  const metadataFile = path.join(transcriptDir, 'metadata.json');
  const analysisFile = path.join(transcriptDir, 'analysis.json');
  
  // Check if files exist
  if (!fs.existsSync(transcriptFile)) {
    console.error(`❌ Transcript file not found: ${transcriptFile}`);
    return;
  }
  
  // Read the transcript
  const transcriptText = fs.readFileSync(transcriptFile, 'utf8');
  console.log(`📄 Loaded transcript: ${transcriptText.length} characters`);
  
  // Extract media discovery entities
  console.log('🎯 Extracting media discovery entities...');
  const mediaEntities = extractMediaDiscoveryEntities(transcriptText);
  
  // Convert to standard format
  const entities = mediaEntities.map(entity => ({
    name: entity.name,
    type: entity.type,
    category: entity.category,
    mentions: entity.count,
    context: entity.discoveryType,
    importance: entity.confidence,
    creativeType: entity.type
  }));
  
  console.log(`✅ Found ${entities.length} discoverable entities`);
  
  // Show top entities
  console.log('\n🎵 Top 20 Discoverable Entities:');
  const topEntities = entities.slice(0, 20);
  topEntities.forEach((entity, idx) => {
    const icon = getIcon(entity.type);
    console.log(`  ${idx + 1}. ${icon} ${entity.name} (${entity.mentions} mentions) - ${entity.context}`);
  });
  
  // Group by category
  const grouped = groupEntitiesByDiscovery(mediaEntities);
  console.log('\n📊 Entity Breakdown by Category:');
  Object.entries(grouped).forEach(([category, items]) => {
    console.log(`  ${category}: ${items.length} entities`);
  });
  
  // Update metadata file
  if (fs.existsSync(metadataFile)) {
    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    metadata.entities = entities;
    metadata.entityCount = entities.length;
    metadata.creativeEntityCount = entities.filter(e => 
      ['musician', 'artist', 'author', 'work'].includes(e.type)
    ).length;
    
    // Add entity breakdown
    metadata.entityBreakdown = {
      musicians: entities.filter(e => e.type === 'musician').length,
      artists: entities.filter(e => e.type === 'artist').length,
      authors: entities.filter(e => e.type === 'author').length,
      venues: entities.filter(e => e.type === 'venue').length,
      works: entities.filter(e => e.type === 'work').length,
      labels: entities.filter(e => e.type === 'label').length,
      movements: entities.filter(e => e.type === 'movement').length
    };
    
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    console.log('✅ Updated metadata.json');
  }
  
  // Update analysis file if it exists
  if (fs.existsSync(analysisFile)) {
    const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
    analysis.entities = entities;
    fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2));
    console.log('✅ Updated analysis.json');
  }
  
  console.log('🎉 Entity reprocessing complete!');
}

function getIcon(type: string): string {
  switch (type) {
    case 'musician': return '🎵';
    case 'artist': return '🎨';
    case 'author': return '📚';
    case 'venue': return '📍';
    case 'work': return '📀';
    case 'label': return '🏷️';
    case 'movement': return '🌊';
    default: return '🔸';
  }
}

// Main execution
async function main() {
  const transcriptId = process.argv[2] || 'just-kids-patti-smith';
  
  if (!fs.existsSync(TRANSCRIPTS_DIR)) {
    console.error('❌ Transcripts directory not found');
    process.exit(1);
  }
  
  await reprocessTranscriptEntities(transcriptId);
}

main().catch(console.error);