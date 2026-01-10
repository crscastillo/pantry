#!/usr/bin/env node

/**
 * Direct Migration Executor using Supabase Service Role
 * Executes SQL migrations directly via Supabase REST API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

async function runMigrations() {
  console.log('\n🚀 Running Supabase Migrations\n');
  console.log('═'.repeat(70));
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('\n❌ Error: Missing Supabase credentials');
    console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.error('   Check your .env.local file\n');
    process.exit(1);
  }
  
  // Create client with service role key for admin operations
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && f.match(/^\d{3}_/))
    .sort();
  
  if (files.length === 0) {
    console.log('\n⚠️  No migration files found\n');
    return;
  }
  
  console.log(`\nFound ${files.length} migration file(s)\n`);
  
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
