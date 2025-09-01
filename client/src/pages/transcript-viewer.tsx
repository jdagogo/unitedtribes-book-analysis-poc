import { useRoute } from 'wouter';
import { UltimateTranscriptViewer } from '@/components/ultimate-transcript-viewer';

export default function TranscriptViewer() {
  const [, params] = useRoute('/transcript/:id');
  const transcriptId = params?.id;
  
  if (!transcriptId) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.6rem' }}>
        <p>No transcript ID provided</p>
      </div>
    );
  }

  return <UltimateTranscriptViewer transcriptId={transcriptId} />;
}