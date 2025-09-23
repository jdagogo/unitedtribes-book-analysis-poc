import React, { useMemo } from 'react';
import { PaginatedBookViewer } from '@/components/paginated-book-viewer';

const PaginatedReader: React.FC = () => {
  // Get transcriptId from URL params
  const transcriptId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('transcriptId');

    // Map common values to the expected format
    if (id === 'justkids') {
      return 'just-kids-patti-smith';
    }
    if (id === 'bluenote') {
      return 'bluenote';
    }

    // Default to just-kids if no ID provided
    return id || 'just-kids-patti-smith';
  }, []);

  return (
    <div className="paginated-reader-page">
      <PaginatedBookViewer transcriptId={transcriptId} />
    </div>
  );
};

export default PaginatedReader;