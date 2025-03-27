import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

function AmazonPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Amazon Deals</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder for Amazon deals */}
        <div className="bg-white/5 rounded-lg p-6 backdrop-blur-lg">
          <h2 className="text-xl font-semibold mb-4">Loading deals...</h2>
          <p className="text-gray-400">Fetching the best Amazon deals for you.</p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/amazon')({
  component: AmazonPage,
}); 