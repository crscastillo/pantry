#!/usr/bin/env node

/**
 * Script to configure OAuth providers in Supabase
 * 
 * Usage:
 *   node scripts/setup-oauth.js
 * 
 * Environment variables required:
 *   SUPABASE_PROJECT_REF - Your Supabase project reference ID
 *   SUPABASE_ACCESS_TOKEN - Your Supabase access token (from dashboard)
 *   GOOGLE_CLIENT_ID - Google OAuth client ID
 *   GOOGLE_CLIENT_SECRET - Google OAuth client secret
 *   FACEBOOK_CLIENT_ID - Facebook app ID
 *   FACEBOOK_CLIENT_SECRET - Facebook app secret
 */

const https = require('https');

// Configuration
const config = {
  projectRef: process.env.SUPABASE_PROJECT_REF,
  accessToken: process.env.SUPABASE_ACCESS_TOKEN,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  facebookClientId: process.env.FACEBOOK_CLIENT_ID,
  facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
};

// Validate required environment variables
function validateConfig() {
  const required = ['projectRef', 'accessToken'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`));
    console.error('\nPlease set these in your .env file or environment');
    process.exit(1);
  }

  const hasGoogle = config.googleClientId && config.googleClientSecret;
  const hasFacebook = config.facebookClientId && config.facebookClientSecret;

  if (!hasGoogle && !hasFacebook) {
    console.error('❌ No OAuth provider credentials found.');
    console.error('   Please provide at least one of:');
    console.error('   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    console.error('   - FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET');
    process.exit(1);
  }

  return { hasGoogle, hasFacebook };
}

// Make HTTPS request helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Configure Google OAuth
async function configureGoogle() {
  console.log('🔧 Configuring Google OAuth...');
  
  const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${config.projectRef}/config/auth`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    }
  };

  const data = {
    EXTERNAL_GOOGLE_ENABLED: true,
    EXTERNAL_GOOGLE_CLIENT_ID: config.googleClientId,
    EXTERNAL_GOOGLE_SECRET: config.googleClientSecret,
    EXTERNAL_GOOGLE_REDIRECT_URI: `https://${config.projectRef}.supabase.co/auth/v1/callback`,
  };

  try {
    await makeRequest(options, data);
    console.log('✅ Google OAuth configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure Google OAuth:', error.message);
    throw error;
  }
}

// Configure Facebook OAuth
async function configureFacebook() {
  console.log('🔧 Configuring Facebook OAuth...');
  
  const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${config.projectRef}/config/auth`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    }
  };

  const data = {
    EXTERNAL_FACEBOOK_ENABLED: true,
    EXTERNAL_FACEBOOK_CLIENT_ID: config.facebookClientId,
    EXTERNAL_FACEBOOK_SECRET: config.facebookClientSecret,
    EXTERNAL_FACEBOOK_REDIRECT_URI: `https://${config.projectRef}.supabase.co/auth/v1/callback`,
  };

  try {
    await makeRequest(options, data);
    console.log('✅ Facebook OAuth configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure Facebook OAuth:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting OAuth configuration...\n');

  const { hasGoogle, hasFacebook } = validateConfig();

  try {
    if (hasGoogle) {
      await configureGoogle();
    }

    if (hasFacebook) {
      await configureFacebook();
    }

    console.log('\n✨ OAuth configuration complete!');
    console.log('\nNext steps:');
    console.log('1. Test the OAuth flow in your application');
    console.log('2. Verify users can sign in with Google/Facebook');
    console.log('3. Check the Supabase dashboard to confirm settings');
  } catch (error) {
    console.error('\n❌ Configuration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('- Verify your SUPABASE_ACCESS_TOKEN is valid');
    console.error('- Check that your SUPABASE_PROJECT_REF is correct');
    console.error('- Ensure OAuth credentials are correct');
    process.exit(1);
  }
}

main();
