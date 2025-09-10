#!/usr/bin/env node

/**
 * Setup script to create .env.local from config.env
 * Run with: node setup-env.mjs
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Setting up environment variables...\n');

// Check if config.env exists
const configPath = './config.env';
const envLocalPath = './.env.local';

if (!fs.existsSync(configPath)) {
  console.log('❌ config.env not found. Please create it first.');
  process.exit(1);
}

// Read config.env
const configContent = fs.readFileSync(configPath, 'utf8');

// Check if .env.local already exists
if (fs.existsSync(envLocalPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
  fs.copyFileSync(envLocalPath, '.env.local.backup');
}

// Create .env.local
fs.writeFileSync(envLocalPath, configContent);

console.log('✅ Created .env.local from config.env');
console.log('\n📝 Next steps:');
console.log('1. Edit .env.local with your actual API keys:');
console.log('   - NEXT_PUBLIC_GOOGLE_API_KEY=your_actual_key');
console.log('   - NEXT_PUBLIC_QDRANT_CLOUD_URL=your_actual_url');
console.log('   - NEXT_PUBLIC_QDRANT_CLOUD_API_KEY=your_actual_key');
console.log('2. Restart your Next.js development server');
console.log('3. Run: node debug-env.mjs to verify configuration');

console.log('\n🔍 Current configuration:');
console.log('========================');

// Parse and display current values
const lines = configContent.split('\n');
lines.forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      const displayValue = key.includes('API_KEY') || key.includes('URL') 
        ? `${value.substring(0, 15)}...` 
        : value;
      console.log(`${key}: ${displayValue}`);
    }
  }
});
