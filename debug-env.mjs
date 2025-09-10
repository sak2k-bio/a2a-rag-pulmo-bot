#!/usr/bin/env node

/**
 * Debug script to check environment variables
 * Run with: node debug-env.mjs
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

console.log('🔍 Environment Variables Debug\n');

// Check all Qdrant-related variables
const qdrantVars = [
  'NEXT_PUBLIC_QDRANT_CLOUD_URL',
  'NEXT_PUBLIC_QDRANT_CLOUD_API_KEY',
  'NEXT_PUBLIC_QDRANT_HOST',
  'NEXT_PUBLIC_QDRANT_PORT',
  'NEXT_PUBLIC_VECTOR_STORE',
  'NEXT_PUBLIC_COLLECTION_NAME'
];

console.log('Qdrant Configuration:');
qdrantVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = varName.includes('API_KEY') || varName.includes('URL') 
      ? `${value.substring(0, 10)}...` 
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ❌ ${varName}: Not set`);
  }
});

// Check Gemini variables
const geminiVars = [
  'NEXT_PUBLIC_GOOGLE_API_KEY',
  'NEXT_PUBLIC_GEMINI_MODEL',
  'NEXT_PUBLIC_GEMINI_TEMPERATURE',
  'NEXT_PUBLIC_GEMINI_MAX_TOKENS'
];

console.log('\nGemini Configuration:');
geminiVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = varName.includes('API_KEY') 
      ? `${value.substring(0, 10)}...` 
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ❌ ${varName}: Not set`);
  }
});

// Check if cloud credentials are available
const hasCloudCredentials = process.env.NEXT_PUBLIC_QDRANT_CLOUD_URL && process.env.NEXT_PUBLIC_QDRANT_CLOUD_API_KEY;
console.log(`\n🌐 Qdrant Cloud Detection: ${hasCloudCredentials ? '✅ Will use cloud' : '❌ Will use local'}`);

// Check if Gemini is available
const hasGeminiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
console.log(`🤖 Gemini Detection: ${hasGeminiKey ? '✅ Will use Gemini' : '❌ Will use Ollama fallback'}`);

console.log('\n📝 To fix Qdrant Cloud access:');
console.log('1. Create .env.local file in frontend directory');
console.log('2. Copy values from config.env');
console.log('3. Update with your actual Qdrant Cloud credentials');
console.log('4. Restart the Next.js development server');
