import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore } from '@/lib/vectorstore';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const status = {
      system: 'online',
      timestamp: new Date().toISOString(),
      services: {
        vectorStore: 'unknown',
        ollama: 'unknown',
        googleAI: 'unknown'
      },
      configuration: {
        vectorStoreType: process.env.NEXT_PUBLIC_VECTOR_STORE || 'qdrant',
        ollamaHost: process.env.NEXT_PUBLIC_OLLAMA_HOST || 'http://localhost:11434',
        hasGoogleAPIKey: !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        hasQdrantCloud: !!(process.env.NEXT_PUBLIC_QDRANT_CLOUD_URL && process.env.NEXT_PUBLIC_QDRANT_CLOUD_API_KEY),
        isVercel: process.env.VERCEL === '1'
      }
    };

    // Check vector store
    try {
      const vectorStore = await getVectorStore();
      status.services.vectorStore = 'online';
    } catch (error) {
      status.services.vectorStore = 'offline';
      console.warn('Vector store check failed:', error);
    }

    // Check Ollama (only for local development)
    try {
      const ollamaHost = process.env.NEXT_PUBLIC_OLLAMA_HOST || 'http://localhost:11434';
      const isVercel = process.env.VERCEL === '1';
      
      if (!isVercel) {
        await axios.get(`${ollamaHost}/api/tags`, { timeout: 5000 });
        status.services.ollama = 'online';
      } else {
        status.services.ollama = 'not_available_vercel';
      }
    } catch (error) {
      status.services.ollama = 'offline';
      console.warn('Ollama check failed:', error);
    }

    // Check Google AI (if API key is provided)
    if (process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      status.services.googleAI = 'configured';
    } else {
      status.services.googleAI = 'not_configured';
    }

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
