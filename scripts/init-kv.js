// A script to initialize the Cloudflare KV namespace with data from db.json
import { exec } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function main() {
  try {
    // Read the KV namespace ID from wrangler.toml
    const wranglerConfig = await Bun.file('./wrangler.toml').text();
    const kvIdMatch = wranglerConfig.match(/id\s*=\s*"([^"]+)"/);
    const kvId = kvIdMatch ? kvIdMatch[1] : null;

    if (!kvId) {
      console.error('Error: Could not find KV namespace ID in wrangler.toml');
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
    console.log('Initializing KV namespace with ID:', kvId);
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
      
      // Upload the file to KV using the correct wrangler syntax
      // Explicitly specify --preview false to target the production namespace
      const command = `wrangler kv key put --binding=STORE_DATA "${key}" --path="${tempFile}" --preview false`;
      console.log(`Running: ${command}`);
      
      const { stdout, stderr } = await execAsync(command);
      console.log(stdout);
      if (stderr) console.error(stderr);
    }
    
    console.log('KV store initialized successfully!');
  } catch (error) {
    console.error('Error initializing KV store:', error);
    process.exit(1);
  }
}

// Run the script
main(); 