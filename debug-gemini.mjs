#!/usr/bin/env node

/**
 * Debug script to check Gemini API key specifically
 * Run with: node debug-gemini.mjs
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: './.env.local' });

console.log('🔍 Gemini API Key Debug\n');

// Check Gemini environment variables
const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const geminiModel = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-flash';
const geminiTemp = process.env.NEXT_PUBLIC_GEMINI_TEMPERATURE || '0.7';
const geminiTokens = process.env.NEXT_PUBLIC_GEMINI_MAX_TOKENS || '2048';

console.log('Gemini Configuration:');
console.log(`  API Key: ${geminiKey ? `${geminiKey.substring(0, 10)}...` : 'Not set'}`);
console.log(`  Model: ${geminiModel}`);
console.log(`  Temperature: ${geminiTemp}`);
console.log(`  Max Tokens: ${geminiTokens}`);

if (!geminiKey) {
  console.log('\n❌ NEXT_PUBLIC_GOOGLE_API_KEY is not set!');
  console.log('Make sure you have a .env.local file with the correct API key.');
  process.exit(1);
}

// Test the API key
console.log('\n🧪 Testing Gemini API...');

try {
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ 
    model: geminiModel,
    generationConfig: {
      temperature: parseFloat(geminiTemp),
      maxOutputTokens: parseInt(geminiTokens),
    }
  });

  const result = await model.generateContent('Hello, this is a test. Please respond with "API test successful".');
  const response = await result.response;
  const text = response.text();
  
  console.log('✅ Gemini API test successful!');
  console.log(`Response: ${text}`);
  
} catch (error) {
  console.log('❌ Gemini API test failed:');
  console.log(`Error: ${error.message}`);
  
  if (error.message.includes('API key not valid')) {
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Double-check your API key in .env.local');
    console.log('2. Make sure the key starts with "AIza"');
    console.log('3. Verify the key is active in Google AI Studio');
    console.log('4. Restart your Next.js server after updating .env.local');
  }
}
