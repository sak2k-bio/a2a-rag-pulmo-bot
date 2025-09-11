#!/usr/bin/env node

import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const QDRANT_CLOUD_URL = process.env.NEXT_PUBLIC_QDRANT_CLOUD_URL;
const QDRANT_CLOUD_API_KEY = process.env.NEXT_PUBLIC_QDRANT_CLOUD_API_KEY;
const COLLECTION_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME;
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const EMBEDDING_MODEL = process.env.NEXT_PUBLIC_EMBEDDING_MODEL;

async function main() {
  console.log("🔍 Checking collection contents (READ-ONLY)...\n");

  const client = new QdrantClient({
    url: QDRANT_CLOUD_URL,
    apiKey: QDRANT_CLOUD_API_KEY
  });

  try {
    // Get collection info
    const info = await client.getCollection(COLLECTION_NAME);
    console.log(`📊 Collection '${COLLECTION_NAME}' stats:`);
    console.log(`  - Points count: ${info.points_count}`);
    console.log(`  - Vector dimensions: ${info.config?.params?.vectors?.size}`);
    console.log(`  - Distance metric: ${info.config?.params?.vectors?.distance}`);

    if (info.points_count === 0) {
      console.log("\n❌ Collection is empty - that's why retrieval isn't working!");
      console.log("💡 You need to load documents first using the app's 'Load Sample Docs' button or API");
      return;
    }

    // Get a few sample points to see what's in there
    console.log("\n📋 Sample documents in collection:");
    try {
      const points = await client.scroll(COLLECTION_NAME, {
        limit: 5,
        with_payload: true,
        with_vector: false
      });

      if (points.points && points.points.length > 0) {
        points.points.forEach((point, index) => {
          console.log(`\n📄 Document ${index + 1} (ID: ${point.id}):`);
          if (point.payload.title) console.log(`  Title: ${point.payload.title}`);
          if (point.payload.category) console.log(`  Category: ${point.payload.category}`);
          if (point.payload.content) {
            const preview = point.payload.content.substring(0, 150);
            console.log(`  Content: ${preview}${point.payload.content.length > 150 ? '...' : ''}`);
          }
        });
      }
    } catch (scrollError) {
      console.log("⚠️  Could not retrieve sample documents:", scrollError.message);
    }

    // Test search for "thoracocentesis"
    console.log("\n🔍 Testing search for 'thoracocentesis'...");
    await testSearch(client, "thoracocentesis");

    // Test search for a more general term
    console.log("\n🔍 Testing search for 'lung'...");
    await testSearch(client, "lung");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function testSearch(client, searchTerm) {
  try {
    // Generate embedding for search term
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(searchTerm);
    const queryEmbedding = result.embedding.values;

    console.log(`  Generated ${queryEmbedding.length}-dimensional embedding for "${searchTerm}"`);

    const searchResults = await client.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: 3,
      with_payload: true,
      score_threshold: 0.1  // Lower threshold to see more results
    });

    if (searchResults.length === 0) {
      console.log(`  ❌ No documents found for "${searchTerm}"`);
    } else {
      console.log(`  ✅ Found ${searchResults.length} documents:`);
      searchResults.forEach((result, index) => {
        console.log(`    ${index + 1}. Score: ${result.score.toFixed(4)}`);
        if (result.payload.title) console.log(`       Title: ${result.payload.title}`);
        if (result.payload.content) {
          const preview = result.payload.content.substring(0, 100);
          console.log(`       Content: ${preview}...`);
        }
      });
    }
  } catch (error) {
    console.error(`  ❌ Search error for "${searchTerm}":`, error.message);
  }
}

main().catch(console.error);
