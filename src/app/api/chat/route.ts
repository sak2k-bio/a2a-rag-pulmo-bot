import { NextRequest, NextResponse } from 'next/server';
import { createPipeline } from '@/lib/pipelines';

export async function POST(request: NextRequest) {
  try {
    const { message, pipelineMode = 'meta' } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Debug environment variables
    console.log('🔍 Chat API Debug Info:');
    console.log(`  VERCEL: ${process.env.VERCEL}`);
    console.log(`  GOOGLE_API_KEY: ${process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`  QDRANT_CLOUD_URL: ${process.env.NEXT_PUBLIC_QDRANT_CLOUD_URL ? 'Set' : 'Not set'}`);
    console.log(`  QDRANT_CLOUD_API_KEY: ${process.env.NEXT_PUBLIC_QDRANT_CLOUD_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`  VECTOR_STORE: ${process.env.NEXT_PUBLIC_VECTOR_STORE}`);

    // Create and run the selected pipeline
    const pipeline = createPipeline(pipelineMode);
    const result = await pipeline.process(message);

    const response = {
      success: true,
      answer: result.answer,
      thinkingSteps: result.thinkingSteps,
      pipelineInfo: result.pipelineInfo,
      sources: result.sources || [],
      timestamp: new Date().toISOString(),
      debug: {
        isVercel: process.env.VERCEL === '1',
        hasGoogleAPI: !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        hasQdrantCloud: !!(process.env.NEXT_PUBLIC_QDRANT_CLOUD_URL && process.env.NEXT_PUBLIC_QDRANT_CLOUD_API_KEY),
        vectorStoreType: process.env.NEXT_PUBLIC_VECTOR_STORE || 'qdrant'
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Chat API error:', error);
    
    // Enhanced error logging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: {
        isVercel: process.env.VERCEL === '1',
        hasGoogleAPI: !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        hasQdrantCloud: !!(process.env.NEXT_PUBLIC_QDRANT_CLOUD_URL && process.env.NEXT_PUBLIC_QDRANT_CLOUD_API_KEY),
        vectorStoreType: process.env.NEXT_PUBLIC_VECTOR_STORE || 'qdrant'
      }
    };
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        debug: errorDetails
      },
      { status: 500 }
    );
  }
}
