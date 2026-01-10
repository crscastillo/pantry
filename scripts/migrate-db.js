#!/usr/bin/env node

/**
 * Direct PostgreSQL Migration Runner
 * Executes SQL migrations directly on Supabase PostgreSQL database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
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
  
  // Extract project reference from Supabase URL
  // Format: https://PROJECT_REF.supabase.co
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];
  
  // Supabase PostgreSQL connection string
  // Format: postgres://postgres:[YOUR-PASSWORD]@db.PROJECT_REF.supabase.co:5432/postgres
  // Note: Direct database connection requires database password, not service role key
  
  console.log('\n⚠️  Note: Direct database connection requires DB_PASSWORD');
  console.log('   Add to .env.local: SUPABASE_DB_PASSWORD=your-db-password');
  console.log('   Get it from: Supabase Dashboard > Settings > Database > Connection string\n');
  
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  
  if (!dbPassword) {
    console.error('❌ Missing SUPABASE_DB_PASSWORD');
    console.log('\n💡 Alternative: Run migrations manually in Supabase Dashboard');
    console.log('   https://app.supabase.com/project/' + projectRef + '/sql/new\n');
    process.exit(1);
  }
  
  const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');
    
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql') && f.match(/^\d{3}_/))
      .sort();
    
    if (files.length === 0) {
      console.log('⚠️  No migration files found\n');
      return;
    }
    
    console.log(`Found ${files.length} migration file(s)\n`);
    
    for (const file of files) {
      console.log(`📝 ${file}`);
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await client.query(sql);
        console.log('   ✅ Applied successfully\n');
      } catch (error) {
        console.error('   ❌ Error:', error.message);
        console.log('   Continuing with next migration...\n');
      }
    }
    
    console.log('═'.repeat(70));
    console.log('✨ Migration process completed\n');
    
  } catch (error) {
    console.error('\n❌ Connection error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. SUPABASE_DB_PASSWORD is correct');
    console.log('   2. Your IP is allowed (disable SSL requirement if needed)');
    console.log('   3. Database is accessible from your network\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
