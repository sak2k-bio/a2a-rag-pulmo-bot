#!/usr/bin/env node

/**
 * Test Google embedding-001 implementation
 * Run with: node test-google-embedding.mjs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env' });

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

async function testGoogleEmbedding() {
  console.log("🧪 Testing Google text-embedding-004 implementation...\n");
  
  if (!GOOGLE_API_KEY) {
    console.error("❌ NEXT_PUBLIC_GOOGLE_API_KEY not found in environment variables");
    console.log("Please set your Google API key in the .env file");
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    const testText = "This is a test of Google's text-embedding-004 model for RAG applications.";
    
    console.log(`📝 Test text: "${testText}"`);
    console.log("🔄 Generating embedding...\n");
    
    const result = await model.embedContent(testText);
    const embedding = result.embedding.values;
    
    console.log("✅ Embedding generated successfully!");
    console.log(`📊 Embedding dimensions: ${embedding.length}`);
    console.log(`📊 First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log(`📊 Last 5 values: [...${embedding.slice(-5).map(v => v.toFixed(4)).join(', ')}]`);
    
    // Test similarity between similar texts
    console.log("\n🔄 Testing similarity between similar texts...");
    
    const text1 = "The patient has pleural effusion";
    const text2 = "Pleural effusion is a medical condition";
    const text3 = "The weather is sunny today";
    
    const [embedding1, embedding2, embedding3] = await Promise.all([
      model.embedContent(text1).then(r => r.embedding.values),
      model.embedContent(text2).then(r => r.embedding.values),
      model.embedContent(text3).then(r => r.embedding.values)
    ]);
    
    // Calculate cosine similarity
    function cosineSimilarity(a, b) {
      const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    }
    
    const similarity1_2 = cosineSimilarity(embedding1, embedding2);
    const similarity1_3 = cosineSimilarity(embedding1, embedding3);
    
    console.log(`📊 Similarity between medical texts: ${similarity1_2.toFixed(4)}`);
    console.log(`📊 Similarity between medical and weather: ${similarity1_3.toFixed(4)}`);
    
    if (similarity1_2 > similarity1_3) {
      console.log("✅ Embeddings correctly show higher similarity for related content!");
    } else {
      console.log("⚠️ Unexpected similarity results - embeddings may need tuning");
    }
    
    console.log("\n🎉 Google text-embedding-004 test completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.message.includes('API_KEY_INVALID')) {
      console.log("💡 Please check your Google API key in the .env file");
    }
    process.exit(1);
  }
}

// Run the test
testGoogleEmbedding();
