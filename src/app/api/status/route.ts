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
        vectorStoreType: process.env.VECTOR_STORE || 'chroma',
        ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
        hasGoogleAPIKey: !!process.env.GOOGLE_API_KEY
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

    // Check Ollama
    try {
      const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
      await axios.get(`${ollamaHost}/api/tags`, { timeout: 5000 });
      status.services.ollama = 'online';
    } catch (error) {
      status.services.ollama = 'offline';
      console.warn('Ollama check failed:', error);
    }

    // Check Google AI (if API key is provided)
    if (process.env.GOOGLE_API_KEY) {
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
