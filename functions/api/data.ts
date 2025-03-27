export async function onRequest({ env }) {
  try {
    // Get the KV namespace
    const KV = env.STORE_DATA;
    
    // Get stores data
    let stores = await KV.get('stores');
    stores = stores ? JSON.parse(stores) : {};
    
    // Get footer links data
    let footerLinks = await KV.get('footerLinks');
    footerLinks = footerLinks ? JSON.parse(footerLinks) : {};
    
    // Get admins data
    let admins = await KV.get('admins');
    admins = admins ? JSON.parse(admins) : [];
    
    return new Response(JSON.stringify({ 
      stores, 
      footerLinks,
      admins 
    }), {
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