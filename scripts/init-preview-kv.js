// A script to initialize the Cloudflare KV preview namespace with data from db.json
import { exec } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function main() {
  try {
    // Read the KV namespace preview ID from wrangler.toml
    const wranglerConfig = await Bun.file('./wrangler.toml').text();
    const kvPreviewIdMatch = wranglerConfig.match(/preview_id\s*=\s*"([^"]+)"/);
    const kvPreviewId = kvPreviewIdMatch ? kvPreviewIdMatch[1] : null;

    if (!kvPreviewId) {
      console.error('Error: Could not find KV preview_id in wrangler.toml');
      process.exit(1);
    }

    // Read data from db.json
    let dbData;
    try {
      dbData = await Bun.file('./src/data/db.json').json();
    } catch (error) {
      console.error('Error reading db.json:', error);
      process.exit(1);
    }

    // Initialize the KV store with each section
    console.log('Initializing KV preview namespace with ID:', kvPreviewId);
    const tempDir = './tmp';
    
    // Create temp directory if it doesn't exist
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir);
    }

    // For each key, write to a temporary file and upload
    for (const [key, data] of Object.entries({
      stores: dbData.stores || {},
      footerLinks: dbData.footerLinks || {},
      admins: dbData.admins || []
    })) {
      console.log(`Uploading ${key} data...`);
      
      // Write data to a temporary file using Bun's API
      const tempFile = `${tempDir}/${key}.json`;
      await Bun.write(tempFile, JSON.stringify(data));
      
      // Use the --preview flag to target the preview KV namespace
      const command = `wrangler kv key put --binding=STORE_DATA "${key}" --path="${tempFile}" --preview`;
      console.log(`Running: ${command}`);
      
      const { stdout, stderr } = await execAsync(command);
      console.log(stdout);
      if (stderr) console.error(stderr);
    }
    
    console.log('KV preview namespace initialized successfully!');
  } catch (error) {
    console.error('Error initializing KV preview namespace:', error);
    process.exit(1);
  }
}

// Run the script
main(); 