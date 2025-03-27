// Script to set up D1 database using direct Wrangler CLI commands
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const execAsync = promisify(exec);

async function setupD1Database() {
  try {
    console.log('Setting up D1 database...');
    
    // Step 1: Create the schema SQL file if it doesn't exist
    const schemaDir = './migrations';
    if (!existsSync(schemaDir)) {
      await execAsync(`mkdir ${schemaDir}`);
    }
    
    const schemaPath = join(schemaDir, 'setup_schema.sql');
    
    const schemaSQL = `
-- Drop tables if they exist to start clean
DROP TABLE IF EXISTS deals;
DROP TABLE IF EXISTS footer_links;
DROP TABLE IF EXISTS footer_link_categories;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS admins;

-- Create stores table with proper ID column
CREATE TABLE stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  bg_color TEXT NOT NULL,
  color TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table for store deals
CREATE TABLE deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  importance TEXT CHECK(importance IN ('low', 'medium', 'high')),
  link TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Create table for footer links categories
CREATE TABLE footer_link_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table for footer links
CREATE TABLE footer_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES footer_link_categories(id) ON DELETE CASCADE
);

-- Create table for admins
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'super_admin')) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default footer categories
INSERT INTO footer_link_categories (name) VALUES 
  ('about'),
  ('support'),
  ('legal');
`;
    
    await Bun.write(schemaPath, schemaSQL);
    console.log(`Created schema file at ${schemaPath}`);
    
    // Step 2: Apply the database schema using wrangler
    console.log('Applying database schema...');
    const { stdout: applySchemaOutput, stderr: applySchemaError } = 
      await execAsync(`wrangler d1 execute stores-db --local --file=${schemaPath}`);
    
    console.log(applySchemaOutput);
    if (applySchemaError) console.error(applySchemaError);
    
    // Step 3: Check if we have sample data
    console.log('Checking for sample data...');
    const dbPath = './src/data/db.json';
    let sampleData;
    
    try {
      if (existsSync(dbPath)) {
        sampleData = await Bun.file(dbPath).json();
        console.log('Found sample data in db.json');
      } else {
        console.log('No db.json found. Using default sample data.');
        // Use default sample data
        sampleData = {
          stores: {
            amazon: {
              name: "Amazon",
              logo: "/assets/amazon-logo.svg",
              bgColor: "from-orange-500 to-yellow-500",
              color: "bg-orange-500",
              active: true,
              deals: [
                {
                  id: "amz-1",
                  title: "Just-added Deals",
                  description: "Fresh deals added daily",
                  importance: "medium",
                  link: "https://amazon.com/deals",
                  active: true
                }
              ]
            },
            aliexpress: {
              name: "AliExpress",
              logo: "/assets/aliexpress-logo.svg",
              bgColor: "from-[#e43225] to-[#c62a20]",
              color: "bg-[#e43225]",
              active: true,
              deals: [
                {
                  id: "ali-1",
                  title: "Flash Deals",
                  description: "Limited-time offers",
                  importance: "high",
                  link: "https://aliexpress.com/flashdeals",
                  active: true
                }
              ]
            }
          },
          footerLinks: {
            about: [
              {
                id: "about-1",
                title: "About Us",
                link: "/about",
                active: true
              }
            ],
            support: [
              {
                id: "support-1",
                title: "Help Center",
                link: "/help",
                active: true
              }
            ],
            legal: [
              {
                id: "legal-1",
                title: "Privacy Policy",
                link: "/privacy-policy",
                active: true
              }
            ]
          },
          admins: [
            {
              id: "admin-1",
              username: "admin",
              password: "password123",
              role: "super_admin"
            }
          ]
        };
      }
    } catch (error) {
      console.error('Error reading sample data:', error);
      process.exit(1);
    }
    
    // Step 4: Insert sample data
    console.log('Inserting sample data into D1...');
    
    // Insert stores and deals
    for (const [storeKey, storeData] of Object.entries(sampleData.stores)) {
      // Insert store
      const insertStoreCommand = `
        INSERT INTO stores (name, logo, bg_color, color, active) 
        VALUES ('${storeData.name}', '${storeData.logo}', '${storeData.bgColor}', '${storeData.color}', ${storeData.active ? 1 : 0})
      `;
      
      console.log(`Inserting store: ${storeData.name}`);
      const { stdout: storeOutput, stderr: storeError } = 
        await execAsync(`wrangler d1 execute stores-db --local --command="${insertStoreCommand.replace(/\n/g, ' ')}"`);
      
      console.log(storeOutput);
      if (storeError) console.error(storeError);
      
      // Get the store ID
      const { stdout: storeIdOutput } = 
        await execAsync(`wrangler d1 execute stores-db --local --command="SELECT id FROM stores WHERE name='${storeData.name}'"`);
      
      // Parse the store ID from the output
      const storeIdMatch = storeIdOutput.match(/id\s*:\s*(\d+)/);
      const storeId = storeIdMatch ? storeIdMatch[1] : null;
      
      if (storeId && storeData.deals && storeData.deals.length > 0) {
        // Insert deals for this store
        for (const deal of storeData.deals) {
          const insertDealCommand = `
            INSERT INTO deals (store_id, title, description, importance, link, active)
            VALUES (${storeId}, '${deal.title.replace(/'/g, "''")}', '${(deal.description || '').replace(/'/g, "''")}', '${deal.importance || 'medium'}', '${deal.link || ''}', ${deal.active ? 1 : 0})
          `;
          
          console.log(`Inserting deal: ${deal.title}`);
          const { stdout: dealOutput, stderr: dealError } = 
            await execAsync(`wrangler d1 execute stores-db --local --command="${insertDealCommand.replace(/\n/g, ' ')}"`);
          
          console.log(dealOutput);
          if (dealError) console.error(dealError);
        }
      }
    }
    
    // Insert footer links
    for (const [categoryName, links] of Object.entries(sampleData.footerLinks)) {
      // Get category ID
      const { stdout: categoryIdOutput } = 
        await execAsync(`wrangler d1 execute stores-db --local --command="SELECT id FROM footer_link_categories WHERE name='${categoryName}'"`);
      
      // Parse the category ID from the output
      const categoryIdMatch = categoryIdOutput.match(/id\s*:\s*(\d+)/);
      const categoryId = categoryIdMatch ? categoryIdMatch[1] : null;
      
      if (categoryId && links && links.length > 0) {
        // Insert links for this category
        for (const link of links) {
          const insertLinkCommand = `
            INSERT INTO footer_links (category_id, title, link, active)
            VALUES (${categoryId}, '${link.title.replace(/'/g, "''")}', '${link.link}', ${link.active ? 1 : 0})
          `;
          
          console.log(`Inserting footer link: ${link.title}`);
          const { stdout: linkOutput, stderr: linkError } = 
            await execAsync(`wrangler d1 execute stores-db --local --command="${insertLinkCommand.replace(/\n/g, ' ')}"`);
          
          console.log(linkOutput);
          if (linkError) console.error(linkError);
        }
      }
    }
    
    // Insert admins
    if (sampleData.admins && sampleData.admins.length > 0) {
      for (const admin of sampleData.admins) {
        const insertAdminCommand = `
          INSERT INTO admins (username, password, role)
          VALUES ('${admin.username}', '${admin.password}', '${admin.role || 'admin'}')
        `;
        
        console.log(`Inserting admin: ${admin.username}`);
        const { stdout: adminOutput, stderr: adminError } = 
          await execAsync(`wrangler d1 execute stores-db --local --command="${insertAdminCommand.replace(/\n/g, ' ')}"`);
        
        console.log(adminOutput);
        if (adminError) console.error(adminError);
      }
    }
    
    console.log('D1 database setup complete! Run "wrangler d1 execute stores-db --local --command=\'SELECT * FROM stores\'" to verify data.');
    
  } catch (error) {
    console.error('Error setting up D1 database:', error);
    process.exit(1);
  }
}

// Run the setup
setupD1Database(); 