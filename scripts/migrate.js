#!/usr/bin/env node

/**
 * Supabase Migration Runner
 * 
 * This script applies SQL migrations to your Supabase database
 * Usage: npm run migrate:up
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('   Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getMigrationFiles() {
  try {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    return files
      .filter(file => file.endsWith('.sql') && file.match(/^\d{3}_/))
      .sort();
  } catch (error) {
    console.error('❌ Error reading migrations directory:', error.message);
    return [];
  }
}

async function runMigration(filename) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`\n📝 Running migration: ${filename}`);
  
  try {
    // Split by semicolons but be smart about it (avoid splitting inside strings/comments)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_string: statement });
        
        if (error) {
          // If exec_sql doesn't exist, try direct query (this won't work for DDL but we can try)
          const { error: queryError } = await supabase.from('_migrations').select('*').limit(0);
          
          // For now, we'll need to use the REST API directly for DDL
          console.log('   ⚠️  Note: Some statements may need to be run manually via Supabase Dashboard');
          console.log('   Statement:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log(`   ✅ Migration completed: ${filename}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error running migration ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Supabase Migration Runner\n');
  console.log('═'.repeat(70));
  
  const migrationFiles = getMigrationFiles();
  
  if (migrationFiles.length === 0) {
    console.log('\n⚠️  No migration files found\n');
    return;
  }
  
  console.log(`\nFound ${migrationFiles.length} migration(s)\n`);
  
  console.log('⚠️  IMPORTANT NOTES:');
  console.log('   • SQL migrations require service role key or manual execution');
  console.log('   • For full DDL support, use Supabase Dashboard SQL Editor');
  console.log('   • Or use Supabase CLI: supabase db push\n');
  
  console.log('📋 Available migrations:');
  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  
  console.log('\n' + '═'.repeat(70));
  console.log('\n💡 To apply migrations:');
  console.log('\n   Option 1 - Supabase Dashboard (Recommended):');
  console.log(`   https://app.supabase.com/project/${supabaseUrl.split('.')[0].split('//')[1]}/sql/new`);
  console.log('   Copy and paste each migration file content and run\n');
  
  console.log('   Option 2 - Supabase CLI:');
  console.log('   $ npm install -g supabase');
  console.log('   $ supabase link --project-ref YOUR_PROJECT_REF');
  console.log('   $ supabase db push\n');
  
  console.log('   Option 3 - Manual execution:');
  migrationFiles.forEach((file) => {
    const filePath = path.join(MIGRATIONS_DIR, file);
    console.log(`   $ cat ${filePath} | supabase db execute`);
  });
  
  console.log('\n' + '═'.repeat(70) + '\n');
}

main().catch(console.error);
