import React from 'react';
import { PaginatedBookViewer } from '@/components/paginated-book-viewer';

const PaginatedReader: React.FC = () => {
  // For now, we'll use the Just Kids transcript ID
  // In the future, this could come from URL params or props
  const transcriptId = 'just-kids-patti-smith';

  return (
    <div className="paginated-reader-page">
      <PaginatedBookViewer transcriptId={transcriptId} />
    </div>
  );
};

export default PaginatedReader;