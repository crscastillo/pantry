#!/usr/bin/env node

/**
 * Direct Migration Executor using Supabase Management API
 * This uses direct HTTP calls to execute SQL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

async function executeSql(sql) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  // Extract project ref from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];
  
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  return response;
}

async function runMigrations() {
  console.log('\n🚀 Running Supabase Migrations\n');
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && f.match(/^\d{3}_/))
    .sort();
  
  console.log(`Found ${files.length} migration(s)\n`);
  
  for (const file of files) {
    console.log(`📝 ${file}`);
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log('\n⚠️  This migration must be run manually:');
    console.log('   1. Go to: https://app.supabase.com/project/YOUR_PROJECT/sql/new');
    console.log(`   2. Copy content from: ${file}`);
    console.log('   3. Paste and execute in SQL Editor\n');
  }
  
  console.log('💡 For automated migrations, install Supabase CLI:');
  console.log('   $ brew install supabase/tap/supabase');
  console.log('   $ supabase link --project-ref YOUR_REF');
  console.log('   $ supabase db push\n');
}

runMigrations().catch(console.error);
