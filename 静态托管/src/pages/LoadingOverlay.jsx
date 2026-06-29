import React, { useEffect } from 'react';

export default function LoadingOverlay({ dataReady, onComplete }) {
  useEffect(() => {
    if (dataReady) onComplete();
  }, [dataReady, onComplete]);

  return (
    <div className="loading-overlay">
      <div className="stage loading-stage">
        <div className="card">
          <img className="bg" src="/assets/书写.jpg" alt="书写" />
        </div>
      </div>
    </div>
  );
}
