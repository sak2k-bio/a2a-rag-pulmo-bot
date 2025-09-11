import { ChromaClient } from 'chromadb';
import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration - Using Next.js public environment variables
const VECTOR_STORE_TYPE = process.env.NEXT_PUBLIC_VECTOR_STORE || 'qdrant';
const CHROMA_PATH = process.env.NEXT_PUBLIC_CHROMA_PATH || './chroma_db';
const QDRANT_HOST = process.env.NEXT_PUBLIC_QDRANT_HOST || 'localhost';
const QDRANT_PORT = parseInt(process.env.NEXT_PUBLIC_QDRANT_PORT || '6333');
const QDRANT_CLOUD_URL = process.env.NEXT_PUBLIC_QDRANT_CLOUD_URL;
const QDRANT_CLOUD_API_KEY = process.env.NEXT_PUBLIC_QDRANT_CLOUD_API_KEY;
const COLLECTION_NAME = process.env.NEXT_PUBLIC_COLLECTION_NAME || 'rag_a2a_collection';
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const EMBEDDING_MODEL = process.env.NEXT_PUBLIC_EMBEDDING_MODEL || 'embedding-001';
const EMBEDDING_DIM = parseInt(process.env.NEXT_PUBLIC_EMBEDDING_DIM || '3072');

// Embeddings function - Gemini embedding-001 (3072 dims)
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    if (!GOOGLE_API_KEY) {
      throw new Error("Google API key not found for embeddings");
    }
    return await getGoogleEmbedding(text);
  } catch (error) {
    console.error("❌ Embedding failed:", error);
    throw error;
  }
}

// Google Gemini Embeddings function
async function getGoogleEmbedding(text: string): Promise<number[]> {
  try {
    if (!GOOGLE_API_KEY) {
      throw new Error("Google API key not found");
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    
    const result = await model.embedContent(text);
    const embedding = result.embedding.values;
    
    console.log(`✅ Generated Google ${EMBEDDING_MODEL} (${embedding.length} dimensions)`);
    if (embedding.length !== EMBEDDING_DIM) {
      console.warn(`⚠️ Embedding dimension (${embedding.length}) does not match configured EMBEDDING_DIM (${EMBEDDING_DIM}).`);
    }
    return embedding;
  } catch (error) {
    console.error("❌ Google embeddings failed:", error);
    throw error;
  }
}

// No local fallback supported to enforce strict 3072-d embeddings

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
      // For Qdrant, validate vector size against collection's configured size
      // Note: Chroma path does not require this validation
      
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
      const collection = collections.collections.find((col: any) => col.name === this.collectionName);
      if (!collection) {
        throw new Error(`Qdrant collection '${this.collectionName}' not found. Please create it in Qdrant Cloud and set the correct NEXT_PUBLIC_COLLECTION_NAME.`);
      }
      console.log("✅ Qdrant collection found:", this.collectionName);
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
      
      // Validate vector size matches collection configuration to avoid 400s
      try {
        const info = await this.client.getCollection(this.collectionName);
        const expectedSize = (info as any)?.config?.params?.vectors?.size as number | undefined;
        if (expectedSize && points[0].vector.length !== expectedSize) {
          throw new Error(`Embedding dimension ${points[0].vector.length} does not match collection vector size ${expectedSize} for '${this.collectionName}'.`);
        }
      } catch (e) {
        console.warn("⚠️ Could not verify Qdrant collection vector size before upsert:", e);
      }

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
      // Validate embedding size against collection's configured size
      const infoAny: any = await this.client.getCollection(this.collectionName);
      const expectedSize: number | undefined = infoAny?.result?.config?.params?.vectors?.size ?? infoAny?.config?.params?.vectors?.size;
      if (typeof expectedSize === 'number' && queryEmbedding.length !== expectedSize) {
        throw new Error(`Query embedding dimension ${queryEmbedding.length} does not match collection vector size ${expectedSize} for '${this.collectionName}'.`);
      }
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
