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

    // Create and run the selected pipeline
    const pipeline = createPipeline(pipelineMode);
    const result = await pipeline.process(message);

    const response = {
      success: true,
      answer: result.answer,
      thinkingSteps: result.thinkingSteps,
      pipelineInfo: result.pipelineInfo,
      sources: result.sources || [],
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
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
