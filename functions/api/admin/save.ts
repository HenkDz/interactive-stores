export async function onRequestPost({ request, env }) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Get the KV namespace
    const KV = env.STORE_DATA;
    
    // Save stores data
    await KV.put('stores', JSON.stringify(data.stores));
    
    // Save footer links data
    await KV.put('footerLinks', JSON.stringify(data.footerLinks));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 