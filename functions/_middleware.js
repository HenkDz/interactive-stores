export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // If this is an API request, proxy it to our Worker
  if (url.pathname.startsWith('/api/')) {
    // Determine if we're in local development mode - will proxy to localhost
    const isLocalDev = process.env.NODE_ENV === 'development';
    
    // Create a new request with the same method, headers, and body
    // In local dev, send to localhost:8787, otherwise to the production worker
    const baseUrl = isLocalDev 
      ? 'http://localhost:8787'
      : 'https://stores-deals.noonou7.workers.dev';
      
    const workerUrl = new URL(url.pathname, baseUrl);
    const newRequest = new Request(workerUrl.toString(), {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
    });
    
    // Forward the request to the Worker
    return fetch(newRequest);
  }
  
  // Otherwise, continue processing the request
  return context.next();
} 