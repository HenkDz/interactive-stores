// Script to migrate data from KV to D1 database
import { existsSync } from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function migrateDataToD1() {
  try {
    console.log('Starting data migration from KV to D1...');
    
    // Step 1: Read data from db.json or local KV files
    let dbData;
    
    // Try to read from db.json first
    try {
      const dbPath = './src/data/db.json';
      if (existsSync(dbPath)) {
        dbData = await Bun.file(dbPath).json();
        console.log('Read data from db.json');
      }
    } catch (error) {
      console.error('Error reading db.json:', error);
    }
    
    // If db.json not found, try to read from local KV files
    if (!dbData) {
      try {
        const storesPath = './dev-data/stores.json';
        const footerLinksPath = './dev-data/footerLinks.json';
        const adminsPath = './dev-data/admins.json';
        
        if (existsSync(storesPath) && existsSync(footerLinksPath) && existsSync(adminsPath)) {
          const stores = await Bun.file(storesPath).json();
          const footerLinks = await Bun.file(footerLinksPath).json();
          const admins = await Bun.file(adminsPath).json();
          
          dbData = { 
            stores,
            footerLinks,
            admins
          };
          console.log('Read data from local KV files');
        } else {
          throw new Error('Local KV files not found');
        }
      } catch (error) {
        console.error('Error reading local KV files:', error);
        process.exit(1);
      }
    }
    
    if (!dbData) {
      console.error('No data source found. Please run the local-dev script first to create local KV files.');
      process.exit(1);
    }
    
    // Step 2: Apply migrations
    console.log('Applying database migrations...');
    
    try {
      const { stdout, stderr } = await execAsync('wrangler d1 execute stores-db --local --file=./migrations/0001_create_tables.sql');
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error('Error applying migrations:', error);
      process.exit(1);
    }
    
    // Step 3: Prepare SQL statements for inserting data
    const storeInserts = [];
    const dealInserts = [];
    const footerLinkInserts = [];
    const adminInserts = [];
    
    // Process stores and deals
    for (const [storeId, storeData] of Object.entries(dbData.stores)) {
      const store = {
        name: storeData.name,
        logo: storeData.logo.startsWith('/') ? storeData.logo : `/assets/${storeData.logo.split('/').pop()}`,
        bg_color: storeData.bgColor,
        color: storeData.color,
        active: storeData.active
      };
      
      storeInserts.push(`
        INSERT INTO stores (name, logo, bg_color, color, active)
        VALUES ('${store.name}', '${store.logo}', '${store.bg_color}', '${store.color}', ${store.active ? 1 : 0})
      `);
      
      // Process deals for this store
      if (storeData.deals && storeData.deals.length > 0) {
        storeData.deals.forEach((deal, index) => {
          dealInserts.push(`
            INSERT INTO deals (store_id, title, description, importance, link, active)
            VALUES (
              (SELECT id FROM stores WHERE name = '${store.name}'),
              '${deal.title.replace(/'/g, "''")}',
              '${(deal.description || '').replace(/'/g, "''")}',
              '${deal.importance || 'medium'}',
              '${deal.link || ''}',
              ${deal.active ? 1 : 0}
            )
          `);
        });
      }
    }
    
    // Process footer links
    for (const [category, links] of Object.entries(dbData.footerLinks)) {
      if (links && links.length > 0) {
        for (const link of links) {
          footerLinkInserts.push(`
            INSERT INTO footer_links (category_id, title, link, active)
            VALUES (
              (SELECT id FROM footer_link_categories WHERE name = '${category}'),
              '${link.title.replace(/'/g, "''")}',
              '${link.link}',
              ${link.active ? 1 : 0}
            )
          `);
        }
      }
    }
    
    // Process admins
    if (dbData.admins && dbData.admins.length > 0) {
      for (const admin of dbData.admins) {
        adminInserts.push(`
          INSERT INTO admins (username, password, role)
          VALUES (
            '${admin.username}',
            '${admin.password}',
            '${admin.role || 'admin'}'
          )
        `);
      }
    }
    
    // Step 4: Execute SQL statements
    console.log('Inserting data into D1 database...');
    
    const allStatements = [
      ...storeInserts,
      ...dealInserts,
      ...footerLinkInserts,
      ...adminInserts
    ];
    
    // Split into batches to avoid command line length issues
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < allStatements.length; i += batchSize) {
      batches.push(allStatements.slice(i, i + batchSize));
    }
    
    // Execute each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchSql = batch.join(';');
      
      // Write batch to temporary file
      const batchFile = `./tmp_batch_${i}.sql`;
      await Bun.write(batchFile, batchSql);
      
      try {
        console.log(`Executing batch ${i + 1} of ${batches.length}...`);
        const { stdout, stderr } = await execAsync(`wrangler d1 execute stores-db --local --file=${batchFile}`);
        console.log(stdout);
        if (stderr) console.error(stderr);
        
        // Clean up temp file
        await execAsync(`rm ${batchFile}`);
      } catch (error) {
        console.error(`Error executing batch ${i + 1}:`, error);
      }
    }
    
    console.log('Data migration to D1 complete!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

// Execute the migration
migrateDataToD1(); 