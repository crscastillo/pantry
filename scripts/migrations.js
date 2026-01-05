#!/usr/bin/env node

/**
 * Supabase Migration Helper
 * 
 * This script helps you manage Supabase migrations by:
 * - Listing all available migrations
 * - Showing migration status
 * - Providing instructions for applying migrations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

function getMigrations() {
  try {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort()
      .map(file => {
        const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
        const descriptionMatch = content.match(/-- Description: (.+)/);
        const createdMatch = content.match(/-- Created: (.+)/);
        
        return {
          file,
          description: descriptionMatch ? descriptionMatch[1] : 'No description',
          created: createdMatch ? createdMatch[1] : 'Unknown',
        };
      });
  } catch (error) {
    console.error('Error reading migrations:', error.message);
    return [];
  }
}

function displayMigrations() {
  const migrations = getMigrations();
  
  console.log('\n📦 Pantry App - Supabase Migrations\n');
  console.log('═'.repeat(70));
  
  if (migrations.length === 0) {
    console.log('\n⚠️  No migrations found in supabase/migrations/\n');
    return;
  }
  
  migrations.forEach((migration, index) => {
    console.log(`\n${index + 1}. ${migration.file}`);
    console.log(`   📝 ${migration.description}`);
    console.log(`   📅 Created: ${migration.created}`);
  });
  
  console.log('\n' + '═'.repeat(70));
  console.log('\n📖 How to apply migrations:\n');
  console.log('Option 1 - Supabase Dashboard (Recommended):');
  console.log('  1. Go to https://app.supabase.com/project/YOUR_PROJECT/sql');
  console.log('  2. Open each migration file in order');
  console.log('  3. Copy and paste the SQL into the editor');
  console.log('  4. Click "Run" to execute\n');
  
  console.log('Option 2 - Supabase CLI:');
  console.log('  1. Install CLI: npm install -g supabase');
  console.log('  2. Link project: supabase link --project-ref YOUR_PROJECT_REF');
  console.log('  3. Push migrations: supabase db push\n');
  
  console.log('💡 Tip: Always apply migrations in order (001, 002, 003...)\n');
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('\nUsage: npm run migrations [options]\n');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --list, -l     List all migrations (default)');
  console.log('');
  process.exit(0);
}

// Default: display migrations
displayMigrations();
