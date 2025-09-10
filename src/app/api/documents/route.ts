import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore } from '@/lib/vectorstore';

export async function POST(request: NextRequest) {
  try {
    const { documents } = await request.json();
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Documents array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate document format
    for (const doc of documents) {
      if (!doc.content || typeof doc.content !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Each document must have a content field' },
          { status: 400 }
        );
      }
    }

    // Add documents to vector store
    const vectorStore = await getVectorStore();
    await vectorStore.addDocuments(documents);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${documents.length} documents to the knowledge base`,
      documentCount: documents.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Document upload error:', error);
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

export async function DELETE(request: NextRequest) {
  try {
    const vectorStore = await getVectorStore();
    await vectorStore.deleteCollection();

    return NextResponse.json({
      success: true,
      message: 'Knowledge base cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Document deletion error:', error);
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
