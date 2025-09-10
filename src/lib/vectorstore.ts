import { ChromaClient } from 'chromadb';
import { QdrantClient } from '@qdrant/js-client-rest';
import axios from 'axios';

// Configuration - Using Next.js public environment variables
const VECTOR_STORE_TYPE = process.env.NEXT_PUBLIC_VECTOR_STORE || 'qdrant';
const CHROMA_PATH = process.env.NEXT_PUBLIC_CHROMA_PATH || './chroma_db';
const QDRANT_HOST = process.env.NEXT_PUBLIC_QDRANT_HOST || 'localhost';
const QDRANT_PORT = parseInt(process.env.NEXT_PUBLIC_QDRANT_PORT || '6333');
const QDRANT_CLOUD_URL = process.env.NEXT_PUBLIC_QDRANT_CLOUD_URL;
const QDRANT_CLOUD_API_KEY = process.env.NEXT_PUBLIC_QDRANT_CLOUD_API_KEY;
const COLLECTION_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'rag_a2a_collection';
const OLLAMA_HOST = process.env.NEXT_PUBLIC_OLLAMA_HOST || 'http://localhost:11434';

// Embeddings function - Updated for Vercel compatibility
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Check if we're in a Vercel environment
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
      // Use a simple text-based embedding for Vercel (fallback)
      // In production, you should use a proper embedding service
      console.warn("⚠️ Using fallback embedding for Vercel deployment");
      return generateFallbackEmbedding(text);
    }
    
    // Try Ollama for local development
    const response = await axios.post(`${OLLAMA_HOST}/api/embeddings`, {
      model: "nomic-embed-text",
      prompt: text
    });
    return response.data.embedding;
  } catch (error) {
    console.error("❌ Embedding failed, using fallback:", error);
    // Fallback to simple embedding
    return generateFallbackEmbedding(text);
  }
}

// Fallback embedding function for Vercel
function generateFallbackEmbedding(text: string): number[] {
  // Improved hash-based embedding for better similarity search
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(768).fill(0);
  
  // Create a more sophisticated hash-based embedding
  words.forEach((word, wordIndex) => {
    // Create multiple hash values for each word
    const hashes = [
      word.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0),
      word.length,
      word.charCodeAt(0) || 0,
      word.charCodeAt(word.length - 1) || 0
    ];
    
    hashes.forEach((hash, hashIndex) => {
      const normalizedHash = (Math.abs(hash) % 1000) / 1000;
      const position = (wordIndex * 4 + hashIndex) % 768;
      embedding[position] = normalizedHash;
    });
  });
  
  // Add text length and character distribution features
  embedding[760] = Math.min(text.length / 1000, 1); // Normalized text length
  embedding[761] = (text.match(/[a-z]/g) || []).length / text.length; // Letter ratio
  embedding[762] = (text.match(/[0-9]/g) || []).length / text.length; // Number ratio
  embedding[763] = (text.match(/[!?.,;]/g) || []).length / text.length; // Punctuation ratio
  
  return embedding;
}

// Vector store interface
export interface VectorStore {
  init(): Promise<void>;
  addDocuments(documents: Array<{ content: string; metadata?: any }>): Promise<void>;
  similaritySearch(query: string, k: number): Promise<Array<{ content: string; metadata: any; distance: number }>>;
  deleteCollection(): Promise<void>;
}

// Chroma implementation
class ChromaVectorStore implements VectorStore {
  private client: ChromaClient;
  private collection: any;

  constructor() {
    this.client = new ChromaClient({ path: process.cwd() + '/' + CHROMA_PATH });
  }

  async init(): Promise<void> {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: COLLECTION_NAME,
        metadata: { "hnsw:space": "cosine" }
      });
      console.log("✅ Chroma collection initialized:", COLLECTION_NAME);
    } catch (err) {
      console.error("❌ Chroma init error:", err);
      throw err;
    }
  }

  async addDocuments(documents: Array<{ content: string; metadata?: any }>): Promise<void> {
    try {
      const embeddings = await Promise.all(
        documents.map(doc => getEmbedding(doc.content))
      );
      
      const ids = documents.map((_, i) => `doc_${Date.now()}_${i}`);
      const metadatas = documents.map(doc => doc.metadata || {});
      
      await this.collection.add({
        ids,
        embeddings,
        documents: documents.map(doc => doc.content),
        metadatas
      });
      
      console.log(`✅ Added ${documents.length} documents to Chroma`);
    } catch (err) {
      console.error("❌ Chroma add documents error:", err);
      throw err;
    }
  }

  async similaritySearch(query: string, k: number): Promise<Array<{ content: string; metadata: any; distance: number }>> {
    try {
      const queryEmbedding = await getEmbedding(query);
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: k
      });
      
      return results.documents[0].map((doc: string, i: number) => ({
        content: doc,
        metadata: results.metadatas[0][i] || {},
        distance: results.distances[0][i]
      }));
    } catch (err) {
      console.error("❌ Chroma similarity search error:", err);
      throw err;
    }
  }

  async deleteCollection(): Promise<void> {
    try {
      await this.client.deleteCollection({ name: COLLECTION_NAME });
      console.log("✅ Chroma collection deleted");
    } catch (err) {
      console.error("❌ Chroma delete error:", err);
      throw err;
    }
  }
}

// Qdrant implementation
class QdrantVectorStore implements VectorStore {
  private client: QdrantClient;
  private collectionName: string;

  constructor() {
    // Debug environment variables
    console.log("🔍 Qdrant Configuration Debug:");
    console.log(`  QDRANT_CLOUD_URL: ${QDRANT_CLOUD_URL ? 'Set' : 'Not set'}`);
    console.log(`  QDRANT_CLOUD_API_KEY: ${QDRANT_CLOUD_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`  QDRANT_HOST: ${QDRANT_HOST}`);
    console.log(`  QDRANT_PORT: ${QDRANT_PORT}`);
    console.log(`  VECTOR_STORE_TYPE: ${VECTOR_STORE_TYPE}`);
    
    // Support both local and cloud Qdrant instances
    if (QDRANT_CLOUD_URL && QDRANT_CLOUD_API_KEY) {
      this.client = new QdrantClient({
        url: QDRANT_CLOUD_URL,
        apiKey: QDRANT_CLOUD_API_KEY
      });
      console.log("✅ Using Qdrant Cloud instance");
    } else {
      this.client = new QdrantClient({ 
        host: QDRANT_HOST, 
        port: QDRANT_PORT 
      });
      console.log("✅ Using local Qdrant instance");
    }
    this.collectionName = COLLECTION_NAME;
  }

  async init(): Promise<void> {
    try {
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        (col: any) => col.name === this.collectionName
      );

      if (!collectionExists) {
        await this.client.createCollection(this.collectionName, {
          vectors: { size: 768, distance: "Cosine" }
        });
      }
      console.log("✅ Qdrant collection initialized:", this.collectionName);
    } catch (err) {
      console.error("❌ Qdrant init error:", err);
      throw err;
    }
  }

  async addDocuments(documents: Array<{ content: string; metadata?: any }>): Promise<void> {
    try {
      const embeddings = await Promise.all(
        documents.map(doc => getEmbedding(doc.content))
      );
      
      const points = documents.map((doc, i) => ({
        id: `doc_${Date.now()}_${i}`,
        vector: embeddings[i],
        payload: {
          content: doc.content,
          ...doc.metadata
        }
      }));
      
      await this.client.upsert(this.collectionName, {
        wait: true,
        points
      });
      
      console.log(`✅ Added ${documents.length} documents to Qdrant`);
    } catch (err) {
      console.error("❌ Qdrant add documents error:", err);
      throw err;
    }
  }

  async similaritySearch(query: string, k: number): Promise<Array<{ content: string; metadata: any; distance: number }>> {
    try {
      const queryEmbedding = await getEmbedding(query);
      const results = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit: k,
        with_payload: true
      });
      
      return results.map((result: any) => ({
        content: result.payload.content,
        metadata: result.payload,
        distance: result.score
      }));
    } catch (err) {
      console.error("❌ Qdrant similarity search error:", err);
      throw err;
    }
  }

  async deleteCollection(): Promise<void> {
    try {
      await this.client.deleteCollection(this.collectionName);
      console.log("✅ Qdrant collection deleted");
    } catch (err) {
      console.error("❌ Qdrant delete error:", err);
      throw err;
    }
  }
}

// Factory function
export function createVectorStore(): VectorStore {
  if (VECTOR_STORE_TYPE === 'chroma') {
    return new ChromaVectorStore();
  } else if (VECTOR_STORE_TYPE === 'qdrant') {
    return new QdrantVectorStore();
  } else {
    throw new Error(`Unsupported vector store type: ${VECTOR_STORE_TYPE}`);
  }
}

// Singleton instance
let vectorStoreInstance: VectorStore | null = null;

export async function getVectorStore(): Promise<VectorStore> {
  if (!vectorStoreInstance) {
    vectorStoreInstance = createVectorStore();
    await vectorStoreInstance.init();
  }
  return vectorStoreInstance;
}
