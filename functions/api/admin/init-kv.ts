import db from '../../../src/data/db.json';

export async function onRequestPost({ env }) {
  try {
    // Get the KV namespace
    const KV = env.STORE_DATA;
    
    // Save stores data
    await KV.put('stores', JSON.stringify(db.stores));
    
    // Save footer links data
    await KV.put('footerLinks', JSON.stringify(db.footerLinks));
    
    // Save admins data
    await KV.put('admins', JSON.stringify(db.admins));
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'KV store initialized with data from db.json'
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