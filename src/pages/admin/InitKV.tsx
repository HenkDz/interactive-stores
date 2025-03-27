import { useState } from 'react';
import { useAdmin } from '../../components/admin/AdminContext';

export default function InitKV() {
  const { stores, footerLinks } = useAdmin();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInitKV = async () => {
    try {
      setStatus('loading');
      setMessage('Initializing KV store...');

      const response = await fetch('/api/admin/init-kv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initialize KV store');
      }

      const data = await response.json();
      setStatus('success');
      setMessage(data.message || 'KV store initialized successfully');
    } catch (error: unknown) {
      console.error('Error initializing KV store:', error);
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Initialize KV Store</h1>
      
      <div className="mb-6 p-4 bg-gray-800 rounded">
        <p className="mb-2">This will initialize the Cloudflare KV store with the current data:</p>
        <ul className="list-disc list-inside mb-4">
          <li>{Object.keys(stores).length} stores</li>
          <li>{Object.keys(footerLinks).length} footer link sections</li>
        </ul>
        <button
          type="button"
          onClick={handleInitKV}
          disabled={status === 'loading'}
          className={`px-4 py-2 rounded font-medium ${
            status === 'loading'
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {status === 'loading' ? 'Initializing...' : 'Initialize KV Store'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded mb-4 ${
            status === 'success'
              ? 'bg-green-800/50 text-green-100'
              : status === 'error'
              ? 'bg-red-800/50 text-red-100'
              : 'bg-blue-800/50 text-blue-100'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
} 