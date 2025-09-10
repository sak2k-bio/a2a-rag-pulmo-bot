import { NextRequest, NextResponse } from 'next/server';
import { QueryAgent, RetrievalAgent, AnswerAgent } from '@/lib/agents';
import { getVectorStore } from '@/lib/vectorstore';

export async function POST(request: NextRequest) {
  try {
    const { query = 'pleural effusion', testAgent = 'all' } = await request.json();
    
    console.log(`🧪 Debug Agents: Testing with query "${query}"`);
    
    const results: any = {
      query,
      timestamp: new Date().toISOString(),
      environment: {
        isVercel: process.env.VERCEL === '1',
        hasGoogleAPI: !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        hasQdrantCloud: !!(process.env.NEXT_PUBLIC_QDRANT_CLOUD_URL && process.env.NEXT_PUBLIC_QDRANT_CLOUD_API_KEY),
        vectorStoreType: process.env.NEXT_PUBLIC_VECTOR_STORE || 'qdrant'
      },
      tests: {}
    };

    // Test Query Agent
    if (testAgent === 'all' || testAgent === 'query') {
      try {
        console.log('🧪 Testing QueryAgent...');
        const queryAgent = new QueryAgent();
        const queryResult = await queryAgent.process({ query });
        results.tests.queryAgent = {
          success: true,
          result: queryResult
        };
        console.log('✅ QueryAgent test passed');
      } catch (error) {
        console.error('❌ QueryAgent test failed:', error);
        results.tests.queryAgent = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Test Retrieval Agent
    if (testAgent === 'all' || testAgent === 'retrieval') {
      try {
        console.log('🧪 Testing RetrievalAgent...');
        const retrievalAgent = new RetrievalAgent();
        const retrievalResult = await retrievalAgent.process({ query, k: 3 });
        results.tests.retrievalAgent = {
          success: true,
          result: retrievalResult
        };
        console.log('✅ RetrievalAgent test passed');
      } catch (error) {
        console.error('❌ RetrievalAgent test failed:', error);
        results.tests.retrievalAgent = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Test Answer Agent
    if (testAgent === 'all' || testAgent === 'answer') {
      try {
        console.log('🧪 Testing AnswerAgent...');
        const answerAgent = new AnswerAgent();
        
        // First get some documents for context
        let documents: any[] = [];
        try {
          const retrievalAgent = new RetrievalAgent();
          const retrievalResult = await retrievalAgent.process({ query, k: 3 });
          documents = retrievalResult.documents;
        } catch (retrievalError) {
          console.warn('⚠️ Could not retrieve documents for AnswerAgent test:', retrievalError);
        }
        
        const answerResult = await answerAgent.process({ query, documents });
        results.tests.answerAgent = {
          success: true,
          result: answerResult,
          contextDocuments: documents.length
        };
        console.log('✅ AnswerAgent test passed');
      } catch (error) {
        console.error('❌ AnswerAgent test failed:', error);
        results.tests.answerAgent = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Test Vector Store
    if (testAgent === 'all' || testAgent === 'vectorstore') {
      try {
        console.log('🧪 Testing VectorStore...');
        const vectorStore = await getVectorStore();
        const testDocuments = await vectorStore.similaritySearch(query, 3);
        results.tests.vectorStore = {
          success: true,
          documentCount: testDocuments.length,
          documents: testDocuments.map(doc => ({
            contentLength: doc.content.length,
            distance: doc.distance,
            hasMetadata: !!doc.metadata
          }))
        };
        console.log('✅ VectorStore test passed');
      } catch (error) {
        console.error('❌ VectorStore test failed:', error);
        results.tests.vectorStore = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug Agents API error:', error);
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

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Debug Agents API - Use POST with { query: 'your query', testAgent: 'all|query|retrieval|answer|vectorstore' }",
    example: {
      method: "POST",
      body: {
        query: "pleural effusion",
        testAgent: "all"
      }
    }
  });
}
