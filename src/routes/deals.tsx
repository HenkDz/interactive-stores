import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

function DealsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Top Deals Across All Stores</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder for top deals */}
        <div className="bg-white/5 rounded-lg p-6 backdrop-blur-lg">
          <h2 className="text-xl font-semibold mb-4">Loading top deals...</h2>
          <p className="text-gray-400">Finding the best deals from all stores.</p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/deals')({
  component: DealsPage,
}); 