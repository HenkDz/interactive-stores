// This file serves as the entry point for the Cloudflare Worker
// We'll avoid using Node.js built-in modules for Cloudflare Workers compatibility

// Helper function for local development to read/write from local files
async function getLocalKvValue(key, options = {}) {
  try {
    // In local development, read from dev-data folder
    const filePath = `./dev-data/${key}.json`;
    
    // Use conditional import or fetch API instead of Node's fs
    let data;
    try {
      const file = Bun ? Bun.file(filePath) : null;
      if (file && await file.exists()) {
        data = await file.text();
      } else {
        // Fallback for Cloudflare Workers without Bun
        const response = await fetch(`file://${filePath}`);
        if (response.ok) {
          data = await response.text();
        } else {
          return null;
        }
      }
      return options.type === 'json' ? JSON.parse(data) : data;
    } catch (e) {
      console.error('File read error:', e);
      return null;
    }
  } catch (error) {
    console.error(`Error reading local KV value for key ${key}:`, error);
    return null;
  }
}

// Helper function for local development to write to local files
async function putLocalKvValue(key, value) {
  try {
    // In local development, write to dev-data folder
    const filePath = `./dev-data/${key}.json`;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    
    // Use Bun's API if available
    if (typeof Bun !== 'undefined') {
      await Bun.write(filePath, stringValue);
    } else {
      // Fallback in Cloudflare Workers
      // Note: In actual Workers environment, this won't be used
      // as we'll use the KV store directly
      console.warn('Writing to local filesystem is not supported in this environment');
    }
    return true;
  } catch (error) {
    console.error(`Error writing local KV value for key ${key}:`, error);
    return false;
  }
}

// Helper to format D1 store data to match the KV structure
function formatStoreDataFromD1(stores, deals) {
  const formattedStores = {};
  
  for (const store of stores) {
    // Fix logo path - ensure it points to the correct location
    let logoPath = store.logo;
    if (logoPath && !logoPath.startsWith('/')) {
      // If path doesn't start with /, add /assets/ prefix
      logoPath = logoPath.includes('assets/') ? `/${logoPath}` : `/assets/${logoPath}`;
    }
    
    formattedStores[store.id] = {
      name: store.name,
      logo: logoPath,
      bgColor: store.bg_color,
      color: store.color,
      active: Boolean(store.active),
      deals: []
    };
  }
  
  // Add deals to their respective stores
  for (const deal of deals) {
    if (formattedStores[deal.store_id]) {
      formattedStores[deal.store_id].deals.push({
        id: deal.id.toString(),
        title: deal.title,
        description: deal.description,
        importance: deal.importance,
        link: deal.link,
        active: Boolean(deal.active)
      });
    }
  }
  
  return formattedStores;
}

// Helper to format D1 footer links data to match the KV structure
function formatFooterLinksFromD1(categories, links) {
  const formattedLinks = {};
  
  // Create an empty array for each category
  for (const category of categories) {
    formattedLinks[category.name] = [];
  }
  
  // Add links to their respective categories
  for (const link of links) {
    const category = categories.find(c => c.id === link.category_id);
    if (category) {
      formattedLinks[category.name].push({
        id: link.id.toString(),
        title: link.title,
        link: link.link,
        active: Boolean(link.active)
      });
    }
  }
  
  return formattedLinks;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Determine if we're running in local development
    const isLocalDev = !env.STORES_DB;
    const useD1 = !isLocalDev || (isLocalDev && env.STORES_DB); // Use D1 if available
    
    // If running locally without D1, create a mock KV namespace
    const kv = isLocalDev && !useD1
      ? {
          get: (key, options) => getLocalKvValue(key, options),
          put: (key, value) => putLocalKvValue(key, value),
        }
      : env.STORE_DATA;
    
    // Database instance
    const db = useD1 ? env.STORES_DB : null;
    
    // Handle API requests 
    if (url.pathname.startsWith('/api/')) {
      // API endpoint to get all data
      if (url.pathname === '/api/data' && request.method === 'GET') {
        try {
          // Debug info
          console.log('API request for /api/data');
          console.log('isLocalDev:', isLocalDev);
          console.log('useD1:', useD1);
          console.log('env.STORES_DB:', !!env.STORES_DB);
          
          if (useD1) {
            console.log('Using D1 database');
            // Get data from D1 database
            const [stores, deals, categories, links, admins] = await Promise.all([
              db.prepare('SELECT * FROM stores WHERE active = 1').all(),
              db.prepare('SELECT * FROM deals WHERE active = 1').all(),
              db.prepare('SELECT * FROM footer_link_categories').all(),
              db.prepare('SELECT * FROM footer_links WHERE active = 1').all(),
              db.prepare('SELECT id, username, role FROM admins').all()
            ]);
            
            console.log('D1 query results:');
            console.log('stores:', stores.results.length);
            console.log('deals:', deals.results.length);
            console.log('categories:', categories.results.length);
            console.log('links:', links.results.length);
            console.log('admins:', admins.results.length);
            
            // Format data to match the expected structure
            const formattedStores = formatStoreDataFromD1(stores.results, deals.results);
            const formattedFooterLinks = formatFooterLinksFromD1(categories.results, links.results);
            
            return new Response(JSON.stringify({ 
              stores: formattedStores, 
              footerLinks: formattedFooterLinks,
              admins: admins.results
            }), {
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }
          
          // Fall through to KV logic if D1 is not available
          // Get data from KV store or local files in dev mode
          const stores = await kv.get('stores', { type: 'json' });
          const footerLinks = await kv.get('footerLinks', { type: 'json' });
          const admins = await kv.get('admins', { type: 'json' });
          
          return new Response(JSON.stringify({ 
            stores: stores || {}, 
            footerLinks: footerLinks || {},
            admins: admins || []
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
      
      // API endpoint to save data
      if (url.pathname === '/api/admin/save' && request.method === 'POST') {
        try {
          // Parse the request body
          const data = await request.json();
          
          if (useD1) {
            // Start a transaction
            await db.exec('BEGIN TRANSACTION');
            
            try {
              // Process stores and deals
              if (data.stores) {
                for (const [storeId, storeData] of Object.entries(data.stores)) {
                  // Check if the store exists
                  const existingStore = await db.prepare('SELECT id FROM stores WHERE id = ?')
                    .bind(storeId)
                    .first();
                  
                  if (existingStore) {
                    // Update existing store
                    await db.prepare(`
                      UPDATE stores 
                      SET name = ?, logo = ?, bg_color = ?, color = ?, active = ?, updated_at = CURRENT_TIMESTAMP
                      WHERE id = ?
                    `)
                    .bind(
                      storeData.name,
                      storeData.logo,
                      storeData.bgColor,
                      storeData.color,
                      storeData.active ? 1 : 0,
                      storeId
                    )
                    .run();
                  } else {
                    // Insert new store
                    const result = await db.prepare(`
                      INSERT INTO stores (name, logo, bg_color, color, active)
                      VALUES (?, ?, ?, ?, ?)
                    `)
                    .bind(
                      storeData.name,
                      storeData.logo,
                      storeData.bgColor,
                      storeData.color,
                      storeData.active ? 1 : 0
                    )
                    .run();
                  }
                  
                  // Process deals
                  if (storeData.deals && storeData.deals.length > 0) {
                    // Delete existing deals for this store 
                    await db.prepare('DELETE FROM deals WHERE store_id = ?')
                      .bind(storeId)
                      .run();
                    
                    // Insert new deals
                    for (const deal of storeData.deals) {
                      await db.prepare(`
                        INSERT INTO deals (store_id, title, description, importance, link, active)
                        VALUES (?, ?, ?, ?, ?, ?)
                      `)
                      .bind(
                        storeId,
                        deal.title,
                        deal.description || '',
                        deal.importance || 'medium',
                        deal.link || '',
                        deal.active ? 1 : 0
                      )
                      .run();
                    }
                  }
                }
              }
              
              // Process footer links
              if (data.footerLinks) {
                for (const [categoryName, links] of Object.entries(data.footerLinks)) {
                  // Get category ID
                  const category = await db.prepare('SELECT id FROM footer_link_categories WHERE name = ?')
                    .bind(categoryName)
                    .first();
                  
                  if (!category) continue;
                  
                  // Delete existing links for this category
                  await db.prepare('DELETE FROM footer_links WHERE category_id = ?')
                    .bind(category.id)
                    .run();
                  
                  // Insert new links
                  if (links && links.length > 0) {
                    for (const link of links) {
                      await db.prepare(`
                        INSERT INTO footer_links (category_id, title, link, active)
                        VALUES (?, ?, ?, ?)
                      `)
                      .bind(
                        category.id,
                        link.title,
                        link.link,
                        link.active ? 1 : 0
                      )
                      .run();
                    }
                  }
                }
              }
              
              // Commit the transaction
              await db.exec('COMMIT');
              
            } catch (error) {
              // Rollback on error
              await db.exec('ROLLBACK');
              throw error;
            }
            
            return new Response(JSON.stringify({ success: true }), {
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }
          
          // Fall through to KV logic if D1 is not available
          // Save to KV store
          if (data.stores) {
            await kv.put('stores', JSON.stringify(data.stores));
          }
          
          if (data.footerLinks) {
            await kv.put('footerLinks', JSON.stringify(data.footerLinks));
          }
          
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
      
      // API endpoint to initialize database
      if (url.pathname === '/api/admin/init-db' && request.method === 'POST') {
        try {
          // This endpoint is handled by the init-d1 script
          return new Response(JSON.stringify({ 
            success: true,
            message: 'Use the bun run init-d1 command to initialize the database'
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
      
      // API endpoint to get all stores (admin)
      if (url.pathname === '/api/admin/stores' && request.method === 'GET') {
        try {
          if (useD1) {
            // Get all stores from D1 database
            const stores = await db.prepare('SELECT * FROM stores ORDER BY name').all();
            return new Response(JSON.stringify({ 
              success: true,
              stores: stores.results 
            }), {
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }
          
          // Fall through to KV logic if D1 is not available
          const stores = await kv.get('stores', { type: 'json' });
          return new Response(JSON.stringify({ 
            success: true,
            stores: stores || {} 
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
      
      // API endpoint to get a specific store (admin)
      if (url.pathname.startsWith('/api/admin/stores/') && request.method === 'GET') {
        try {
          const storeId = url.pathname.split('/').pop();
          
          if (useD1) {
            // Get store from D1 database
            const [store, deals] = await Promise.all([
              db.prepare('SELECT * FROM stores WHERE id = ?').bind(storeId).first(),
              db.prepare('SELECT * FROM deals WHERE store_id = ? ORDER BY title').bind(storeId).all()
            ]);
            
            if (!store) {
              return new Response(JSON.stringify({ 
                success: false,
                error: 'Store not found' 
              }), {
                status: 404,
                headers: {
                  'Content-Type': 'application/json',
                },
              });
            }
            
            return new Response(JSON.stringify({ 
              success: true,
              store: {
                ...store,
                deals: deals.results
              }
            }), {
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }
          
          // Fall through to KV logic if D1 is not available
          const stores = await kv.get('stores', { type: 'json' });
          const store = stores?.[storeId];
          
          if (!store) {
            return new Response(JSON.stringify({ 
              success: false,
              error: 'Store not found' 
            }), {
              status: 404,
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }
          
          return new Response(JSON.stringify({ 
            success: true,
            store: store 
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
      
      // API endpoint to create a new store (admin)
      if (url.pathname === '/api/admin/stores' && request.method === 'POST') {
        try {
          const data = await request.json();
          
          if (useD1) {
            // Start a transaction
            await db.exec('BEGIN TRANSACTION');
            
            try {
              // Insert new store
              const result = await db.prepare(`
                INSERT INTO stores (name, logo, bg_color, color, active)
                VALUES (?, ?, ?, ?, ?)
              `)
              .bind(
                data.name,
                data.logo,
                data.bgColor,
                data.color,
                data.active ? 1 : 0
              )
              .run();
              
              // Get the new store ID
              const storeId = result.meta.last_row_id;
              
              // Process deals if provided
              if (data.deals && data.deals.length > 0) {
                for (const deal of data.deals) {
                  await db.prepare(`
                    INSERT INTO deals (store_id, title, description, importance, link, active)
                    VALUES (?, ?, ?, ?, ?, ?)
                  `)
                  .bind(
                    storeId,
                    deal.title,
                    deal.description || '',
                    deal.importance || 'medium',
                    deal.link || '',
                    deal.active ? 1 : 0
                  )
                  .run();
                }
              }
              
              // Commit the transaction
              await db.exec('COMMIT');
              
              return new Response(JSON.stringify({ 
                success: true,
                storeId: storeId
              }), {
                headers: {
                  'Content-Type': 'application/json',
                },
              });
            } catch (error) {
              // Rollback on error
              await db.exec('ROLLBACK');
              throw error;
            }
          }
          
          // Fall through to KV logic if D1 is not available
          const stores = await kv.get('stores', { type: 'json' }) || {};
          
          // Generate a new store ID
          const storeId = `store-${Date.now()}`;
          
          // Add the new store
          stores[storeId] = {
            name: data.name,
            logo: data.logo,
            bgColor: data.bgColor,
            color: data.color,
            active: data.active,
            deals: data.deals || []
          };
          
          // Save the updated stores data
          await kv.put('stores', JSON.stringify(stores));
          
          return new Response(JSON.stringify({ 
            success: true,
            storeId: storeId
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
      
      // If we get here, it means the API endpoint was not found
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API endpoint not found' 
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // For non-API requests, check if ASSETS binding exists (in Pages environment)
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }
    
    // For non-API requests in pure Workers environment with no ASSETS binding
    // Return a basic response for the root path
    if (url.pathname === '/' || url.pathname === '') {
      return new Response('Welcome to stores.deals API. Web app is served from Cloudflare Pages.', {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    // Any other paths not handled return 404
    return new Response('Not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  },
}; 