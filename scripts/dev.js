// A script to initialize a local KV store and run the dev server
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Mark the script as async to use top-level await
const main = async () => {
  console.log('Starting local development environment...');

  try {
    // Step 1: Create local data directory if it doesn't exist
    const dataDir = './dev-data';
    if (!existsSync(dataDir)) {
      console.log('Creating development data directory...');
      mkdirSync(dataDir);
    }

    // Step 2: Check if db.json exists
    const dbPath = './src/data/db.json';
    if (!existsSync(dbPath)) {
      console.error(`Error: ${dbPath} not found. Please create this file with initial data.`);
      process.exit(1);
    }

    // Step 3: Read data from db.json using Bun's file API
    console.log('Reading initial data from db.json...');
    const dbFile = Bun.file(dbPath);
    if (!await dbFile.exists()) {
      console.error(`Error: ${dbPath} not found. Please create this file with initial data.`);
      process.exit(1);
    }
    
    const dbData = await dbFile.json();
    
    // Step 4: Write data for local KV store use using Bun's file API
    console.log('Preparing local KV data...');
    for (const [key, data] of Object.entries({
      stores: dbData.stores || {},
      footerLinks: dbData.footerLinks || {},
      admins: dbData.admins || []
    })) {
      const dataFile = join(dataDir, `${key}.json`);
      await Bun.write(dataFile, JSON.stringify(data, null, 2));
      console.log(`Saved ${key} data to ${dataFile}`);
    }

    // Step 5: Start the development server
    console.log('Starting development server...');
    console.log('Press Ctrl+C to stop the server.');
    
    // Start both processes using regular node child_process
    const vite = spawn('bun', ['run', 'dev'], { stdio: 'inherit' });
    const wrangler = spawn('wrangler', ['dev', '--local'], { stdio: 'inherit' });
    
    // Handle process exit
    vite.on('error', (err) => {
      console.error('Failed to start vite process:', err);
    });
    
    wrangler.on('error', (err) => {
      console.error('Failed to start wrangler process:', err);
    });
    
    // Exit handling
    process.on('SIGINT', () => {
      vite.kill();
      wrangler.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error setting up local development environment:', error);
    process.exit(1);
  }
};

// Run the main function
main(); 