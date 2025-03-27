#!/usr/bin/env bun

// Script to fix logo paths in the D1 database
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function fixLogoPaths() {
  try {
    console.log('Fixing store logo paths in D1 database...');
    
    // Fix Amazon logo path
    await execQuery(`
      UPDATE stores 
      SET logo = '/assets/amazon-logo.svg' 
      WHERE name = 'Amazon'
    `);
    
    // Fix AliExpress logo path
    await execQuery(`
      UPDATE stores 
      SET logo = '/assets/aliexpress-logo.svg' 
      WHERE name = 'AliExpress'
    `);
    
    // Fix Temu logo path
    await execQuery(`
      UPDATE stores 
      SET logo = '/assets/temu-logo.svg' 
      WHERE name = 'Temu'
    `);
    
    console.log('Logo paths fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing logo paths:', error);
    process.exit(1);
  }
}

async function execQuery(query) {
  try {
    // Write query to a temporary file
    const tmpFile = './tmp_query.sql';
    await Bun.write(tmpFile, query);
    
    // Execute the query
    const { stdout, stderr } = await execAsync(`wrangler d1 execute stores-db --local --file=${tmpFile}`);
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    // Clean up temp file
    await execAsync(`rm ${tmpFile}`);
    
    return stdout;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

// Execute the fix
fixLogoPaths(); 