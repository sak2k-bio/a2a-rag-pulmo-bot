#!/usr/bin/env node

/**
 * Frontend Test script for Google Gemini 1.5 Flash and Qdrant Cloud integration
 * Run with: node test-gemini-qdrant.mjs
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QdrantClient } from '@qdrant/js-client-rest';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: './config.env' });

// Configuration
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const QDRANT_CLOUD_URL = process.env.NEXT_PUBLIC_QDRANT_CLOUD_URL;
const QDRANT_CLOUD_API_KEY = process.env.NEXT_PUBLIC_QDRANT_CLOUD_API_KEY;
const QDRANT_HOST = process.env.NEXT_PUBLIC_QDRANT_HOST || 'localhost';
const QDRANT_PORT = parseInt(process.env.NEXT_PUBLIC_QDRANT_PORT || '6333');
const COLLECTION_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'test_collection';
const OLLAMA_HOST = process.env.NEXT_PUBLIC_OLLAMA_HOST || 'http://localhost:11434';
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_TEMPERATURE = parseFloat(process.env.NEXT_PUBLIC_GEMINI_TEMPERATURE || '0.7');
const GEMINI_MAX_TOKENS = parseInt(process.env.NEXT_PUBLIC_GEMINI_MAX_TOKENS || '2048');

console.log('🧪 Testing Frontend Google Gemini 1.5 Flash and Qdrant Integration\n');

// Test 1: Google Gemini API
async function testGeminiAPI() {
  console.log('1️⃣ Testing Google Gemini 1.5 Flash API...');
  
  if (!GOOGLE_API_KEY) {
    console.log('❌ NEXT_PUBLIC_GOOGLE_API_KEY not found in environment variables');
    return false;
  }

  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: GEMINI_TEMPERATURE,
        maxOutputTokens: GEMINI_MAX_TOKENS,
      }
    });

    const result = await model.generateContent('Hello, this is a test message. Please respond briefly.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Google Gemini API working');
    console.log(`   Model: ${GEMINI_MODEL}`);
    console.log(`   Temperature: ${GEMINI_TEMPERATURE}`);
    console.log(`   Max Tokens: ${GEMINI_MAX_TOKENS}`);
    console.log(`   Response: ${text.substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.log('❌ Google Gemini API failed:', error.message);
    return false;
  }
}

// Test 2: Qdrant Cloud Connection
async function testQdrantCloud() {
  console.log('\n2️⃣ Testing Qdrant Cloud connection...');
  
  if (!QDRANT_CLOUD_URL || !QDRANT_CLOUD_API_KEY) {
    console.log('⚠️  Qdrant Cloud credentials not found, testing local Qdrant...');
    return await testQdrantLocal();
  }

  try {
    const client = new QdrantClient({
      url: QDRANT_CLOUD_URL,
      apiKey: QDRANT_CLOUD_API_KEY
    });

    // Test connection by getting collections
    const collections = await client.getCollections();
    console.log('✅ Qdrant Cloud connection working');
    console.log(`   URL: ${QDRANT_CLOUD_URL}`);
    console.log(`   Found ${collections.collections.length} collections`);
    
    // Test collection creation
    try {
      await client.getCollection(COLLECTION_NAME);
      console.log(`   Collection '${COLLECTION_NAME}' already exists`);
    } catch (error) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: { size: 768, distance: "Cosine" }
      });
      console.log(`   Created collection '${COLLECTION_NAME}'`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Qdrant Cloud connection failed:', error.message);
    return false;
  }
}

// Test 3: Local Qdrant Connection
async function testQdrantLocal() {
  console.log('\n2️⃣ Testing local Qdrant connection...');
  
  try {
    const client = new QdrantClient({
      host: QDRANT_HOST,
      port: QDRANT_PORT
    });

    // Test connection by getting collections
    const collections = await client.getCollections();
    console.log('✅ Local Qdrant connection working');
    console.log(`   Host: ${QDRANT_HOST}:${QDRANT_PORT}`);
    console.log(`   Found ${collections.collections.length} collections`);
    
    // Test collection creation
    try {
      await client.getCollection(COLLECTION_NAME);
      console.log(`   Collection '${COLLECTION_NAME}' already exists`);
    } catch (error) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: { size: 768, distance: "Cosine" }
      });
      console.log(`   Created collection '${COLLECTION_NAME}'`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Local Qdrant connection failed:', error.message);
    return false;
  }
}

// Test 4: Ollama Fallback
async function testOllamaFallback() {
  console.log('\n3️⃣ Testing Ollama fallback...');
  
  try {
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: "gemma3:1b",
      prompt: "Hello, this is a test. Please respond briefly.",
      stream: false
    });
    
    console.log('✅ Ollama fallback working');
    console.log(`   Host: ${OLLAMA_HOST}`);
    console.log(`   Response: ${response.data.response.substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.log('❌ Ollama fallback failed:', error.message);
    return false;
  }
}

// Test 5: Embedding Generation
async function testEmbeddingGeneration() {
  console.log('\n4️⃣ Testing embedding generation...');
  
  try {
    const response = await axios.post(`${OLLAMA_HOST}/api/embeddings`, {
      model: "nomic-embed-text",
      prompt: "This is a test document for embedding generation."
    });
    
    const embedding = response.data.embedding;
    console.log('✅ Embedding generation working');
    console.log(`   Host: ${OLLAMA_HOST}`);
    console.log(`   Embedding dimension: ${embedding.length}`);
    console.log(`   Sample values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    return true;
  } catch (error) {
    console.log('❌ Embedding generation failed:', error.message);
    return false;
  }
}

// Test 6: Frontend Environment Variables
async function testFrontendEnvironment() {
  console.log('\n5️⃣ Testing frontend environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_GOOGLE_API_KEY',
    'NEXT_PUBLIC_VECTOR_STORE',
    'NEXT_PUBLIC_COLLECTION_NAME'
  ];
  
  const optionalVars = [
    'NEXT_PUBLIC_QDRANT_CLOUD_URL',
    'NEXT_PUBLIC_QDRANT_CLOUD_API_KEY',
    'NEXT_PUBLIC_GEMINI_MODEL',
    'NEXT_PUBLIC_GEMINI_TEMPERATURE',
    'NEXT_PUBLIC_GEMINI_MAX_TOKENS'
  ];
  
  let allRequired = true;
  
  console.log('   Required variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${varName}: Not set`);
      allRequired = false;
    }
  });
  
  console.log('   Optional variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value}`);
    } else {
      console.log(`   ⚠️  ${varName}: Not set (using default)`);
    }
  });
  
  if (allRequired) {
    console.log('✅ All required environment variables are set');
  } else {
    console.log('❌ Some required environment variables are missing');
  }
  
  return allRequired;
}

// Test 7: End-to-End Integration
async function testEndToEndIntegration() {
  console.log('\n6️⃣ Testing end-to-end integration...');
  
  try {
    // This would test the full pipeline, but for now we'll just verify components
    const geminiWorking = await testGeminiAPI();
    const qdrantWorking = await testQdrantCloud();
    const ollamaWorking = await testOllamaFallback();
    const embeddingWorking = await testEmbeddingGeneration();
    const envWorking = await testFrontendEnvironment();
    
    if (geminiWorking && qdrantWorking && ollamaWorking && embeddingWorking && envWorking) {
      console.log('✅ All components working - frontend integration ready');
      return true;
    } else {
      console.log('⚠️  Some components failed - check individual tests above');
      return false;
    }
  } catch (error) {
    console.log('❌ End-to-end integration test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting frontend integration tests...\n');
  
  const results = {
    gemini: await testGeminiAPI(),
    qdrant: await testQdrantCloud(),
    ollama: await testOllamaFallback(),
    embedding: await testEmbeddingGeneration(),
    environment: await testFrontendEnvironment(),
    integration: false
  };
  
  results.integration = await testEndToEndIntegration();
  
  // Summary
  console.log('\n📊 Frontend Test Results Summary:');
  console.log('=================================');
  console.log(`Google Gemini 1.5 Flash: ${results.gemini ? '✅' : '❌'}`);
  console.log(`Qdrant Database: ${results.qdrant ? '✅' : '❌'}`);
  console.log(`Ollama Fallback: ${results.ollama ? '✅' : '❌'}`);
  console.log(`Embedding Generation: ${results.embedding ? '✅' : '❌'}`);
  console.log(`Environment Variables: ${results.environment ? '✅' : '❌'}`);
  console.log(`End-to-End Integration: ${results.integration ? '✅' : '❌'}`);
  
  if (results.integration) {
    console.log('\n🎉 All frontend tests passed! Your Next.js RAG app is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('   1. Copy config.env to .env.local');
    console.log('   2. Update .env.local with your API keys');
    console.log('   3. Run: npm run dev');
    console.log('   4. Visit: http://localhost:3000');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
    console.log('\n📝 Troubleshooting:');
    console.log('   1. Ensure config.env exists and has correct values');
    console.log('   2. Check that all required API keys are set');
    console.log('   3. Verify Ollama is running locally');
  }
  
  return results;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
